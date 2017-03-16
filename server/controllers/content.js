const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const api = require('next-ft-api-client');
const interactivePoller = require('../lib/ig-poller');
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const model = require('../model');
const getFalconUrl = require('./article-helpers/falcon-url');

function getInteractive (contentId) {
	return interactivePoller.getData().find(
		mapping => mapping.articleuuid === contentId
	);
}

function getArticle (contentId) {
	return api.content({
		uuid: contentId,
		index: 'v3_api_v2'
	})
	// Some things aren't in CAPI v3 (e.g. Syndicated content)
		.catch(function (error) {
			if (fetchres.originatedError(error)) {
				return;
			} else {
				throw error;
			}
		});
}

module.exports = function contentController (req, res, next) {
	res.set('surrogate-key', `contentUuid:${req.params.id}`);

	const contentPromises = [];
	let interactive = getInteractive(req.params.id);

	if (interactive) {
		res.redirect(interactive.interactiveurl);
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

			if (content.type === 'video' && res.locals.flags.videoArticlePage === 'v2') {
				return res.redirect(`/video/${req.params.id}`);
			}

			if (content.type === 'article') {
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
			}

			function render (data) {
				if (req.query.fragment) {
					res.render('fragment', data);
				} else {
					content.layout = 'wrapper';
					content.viewStyle = 'compact';
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