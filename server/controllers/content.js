const logger = require('@financial-times/n-logger').default;
const fetchres = require('fetchres');
const signedFetch = require('signed-aws-es-fetch');
const getInteractive = require('../lib/ig-poller').lookup;
const chooseStylesheets = require('../lib/choose-stylesheets');
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const model = require('../model');
const getFalconUrl = require('./article-helpers/falcon-url');

function getArticle (contentId) {
	const url = `https://next-elastic.ft.com/v3_api_v2/item/${contentId}`;

	return signedFetch(url)
		.then(fetchres.json)
		.then((json) => json._source)
		.catch((error) => {
			if (fetchres.originatedError(error)) {
				return null;
			} else {
				throw error;
			}
		});
}


module.exports = function contentController (req, res, next) {
	res.set('surrogate-key', `contentUuid:${req.params.id}`);

	const contentPromises = [];
	let interactiveUrl = getInteractive(req.params.id);

	if (interactiveUrl) {
		res.redirect(interactiveUrl);
		return;
	}

	contentPromises.push(getArticle(req.params.id));

	if(res.locals.flags.articleSuggestedRead || res.locals.flags.contentPackages) {
		contentPromises.push(
			getOnwardJourneyArticles(req.params.id, res.locals.flags)
				.catch(err => {
					logger.warn({ event: 'ONWARD_JOURNEY_FETCH_FAIL' }, err);
				}));
	}

	return Promise.all(contentPromises).then(([content, onwardJourney]) => {

			// TODO: document why content would be null
			if (!content) {
				return getFalconUrl(req.params.id).then(falconUrl => {
					if (!falconUrl) {
						return res.sendStatus(404);
					}
					return res.redirect(302, falconUrl);
				});
			}

			if (content.type === 'placeholder') {
				return res.redirect(content.url);
			}

			const webUrl = content.webUrl || '';

			// Redirect ftalphaville to old FT.com.  Next is not currently planning to absorb FTAlphaville
			// and therefore we shouldn't replicate content from FTAlphaville on Next for SEO reasons.
			if (webUrl.includes('ftalphaville.ft.com')) {
				return res.redirect(301, `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`);
			}

			// Redirect liveblogs to old FT.com because they don't yet work in Next
			// TODO: Remove once liveblogs are supported on Next
			if (webUrl.includes('/liveblogs/') || webUrl.includes('/marketslive/')) {
				return res.redirect(302, `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`);
			}

			// Redirect syndicated / wires content to old FT.com as no treatment on Next yet
			if (content.originatingParty && content.originatingParty !== 'FT') {
				return res.redirect(302, `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`);
			}

			if (content.type === 'video' && res.locals.flags.newVideoPage === 'variant') {
				return res.redirect(`/video/${req.params.id}`);
			}

			if (content.type === 'package') {

				// Allow us to degrade gracefully
				if (!onwardJourney) {
					content.degradePackagePage = true;
				}
				const isIntroArticle = (content.tableOfContents && content.tableOfContents.displayIntroduction) || !!content.bodyHTML;
				const cannotRender = content.degradePackagePage || !res.locals.flags.contentPackages;
				const canRedirect = content.contains && !!content.contains.length;

				// If we're unable to render a decent package page then perhaps we
				// can at least redirect to the first article page in the package
				if (!isIntroArticle && cannotRender && canRedirect) {
					const uuid = content.contains[0].id;
					return res.redirect(`/content/${uuid}`);
				}

			}

			// TODO: do we need to do this for package pages?
			if (content.type === 'article' || content.type === 'package') {
				res.vary('ft-is-aud-dev');
				res.vary('ft-blocked-url');
				res.vary('ft-barrier-type');
				res.vary('x-ft-auth-gate-result');

				res.set('x-ft-auth-gate-result', req.get('x-ft-auth-gate-result') || '-');
				res.set('x-ft-barrier-type', req.get('ft-barrier-type') || '-');
				res.set('ft-blocked-url', req.get('ft-blocked-url') || '-');
			}

			if (onwardJourney) {
				content.readNextArticle = onwardJourney.readNext;
				content.readNextArticles = onwardJourney.suggestedReads;

				if(onwardJourney.package || onwardJourney.context) {
					content.package = onwardJourney.package;
					content.context = onwardJourney.context;
				}

				if (onwardJourney.contains) {
					content.contains = onwardJourney.contains.map((item, i) => {
						item.promotionalTitle = content.contains[i].title || item.promotionalTitle || item.title;
						return item;
					});
				}
			}

			function render (data) {
				if (req.query.fragment) {
					res.locals.stylesheets = { inline: [], lazy: [], blocking: [] };
					res.render('fragment', data);
				} else {
					data.layout = 'wrapper';
					data.viewStyle = 'compact';
					res.locals.stylesheets = chooseStylesheets(data);
					res.render(data.template || 'content', data);
				}
			}

			// Type handlers decorate the model with type specific model data.
			// They return a promise that resolves with the new data
			const typeHandler = model.getHandler(content.type);

			// TODO: we shouldn't need to pass in the req, res, and next params
			return typeHandler(req, res, content, res.locals.flags).then(render);
		})
		.catch(error => {
			logger.error({ event: 'CONTENT_FETCH_FAILED', err: error.toString(), uuid: req.params.id });
			next(error);
		});
};
