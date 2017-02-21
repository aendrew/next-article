const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const api = (process.env.EXPERIMENTAL_CONTENT_SOURCE && process.env.NODE_ENV !== 'production')
	? require('../lib/experimental-content-client')
	: require('next-ft-api-client');
const interactivePoller = require('../lib/ig-poller');
const shellpromise = require('shellpromise');
const richArticleModel = require('../lib/rich-article');

const controllerInteractive = require('./interactive');
const controllerPodcast = require('./podcast');
const controllerVideo = require('./video');
const controllerArticle = require('./article');
const controllerPackage = require('./package');

// HACK: remove
const {
	landingPageIds,
	childPageIds,
	packageLookup
} = require('../../package-hack-list');

// HACK: remove this function and all references to it
function hackPackageData (content) {
	const isParentPage = landingPageIds.includes(content.id);
	const isChildPage = childPageIds.includes(content.id);
	if (isParentPage) {
		content.type = 'package';
		content.contains = packageLookup.find(pkg => pkg.landing === content.id).contains;
		content.containedIn = [];
		content.description = packageLookup.find(pkg => pkg.landing === content.id).description;
		content.isSpecialReport = isSpecialReport(content);
	} else if (isChildPage) {
		content.contains = [];
		content.containedIn = [{id: packageLookup.find(pkg => pkg.contains.includes(content.id)).landing}];
		content.isSpecialReport = isSpecialReport(content);
	} else {
		content.contains = [];
		content.containedIn = [];
		content.isSpecialReport = isSpecialReport(content);
	}
	logger.info({
		event: 'ADDING_PACKAGE',
		id: content.id,
		contains: content.contains,
		containedIn: content.containedIn,
		type: content.type,
		isSpecialReport: content.isSpecialReport
	});
	return content;
}

function isSpecialReport (content) {
	return !!content.metadata.find(tag => tag.prefLabel === 'Special Report');
}

function isContainedInPackage (content) {
	return Array.isArray(content.containedIn) && content.containedIn.length > 0;
}

function isArticlePodcast ({ provenance = [] } = {}) {
	return provenance.some(source => /acast\.com/.test(source));
}

function isArticleVideo ({ webUrl = '' } = {}) {
	return webUrl.includes('video.ft.com');
}

function isArticlePackage ({ type }) {
	return type && type === 'package';
}

function getInteractive (contentId) {
	return interactivePoller.getData().find(
		mapping => mapping.articleuuid === contentId
	);
}

function decoratePackageWithContents (pkg) {
	return getArticle(pkg.contains).then(contents => {
		contents.forEach(hackPackageData);
		pkg.contains = contents;
		return pkg;
	});
}

function decorateContentWithPackage (content) {
	hackPackageData(content);

	let promises = [];

	if (isArticlePackage(content)) {
		promises = [decoratePackageWithContents(content)];
	}

	content.isContainedInPackage = isContainedInPackage(content);

	if (content.isContainedInPackage) {

		// fetch the ContentPackage from CAPI
		// HACK: hard-code the first parent package
		const parentAndSiblingsPromises = getArticle(content.containedIn[0].id).then(pkg => {
			hackPackageData(pkg);
			content.containedIn[0] = Object.assign({}, content.containedIn[0], pkg);
			return decoratePackageWithContents(content.containedIn[0]);
		});

		promises = promises.concat(parentAndSiblingsPromises);
	}

	return Promise.all(promises);
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

function getRichArticle (contentId) {
	return fetch(`https://s3-eu-west-1.amazonaws.com/rj-xcapi-mock/${contentId}`)
		.then(fetchres.json)
		.then(richArticleModel)
		.catch(err => {
			logger.error({
				event: 'INTERNAL_CONTENT_FETCH_FAIL',
				uuid: contentId
			}, err);
		});
}

module.exports = function negotiationController (req, res, next) {
	res.set('surrogate-key', `contentUuid:${req.params.id}`);

	let interactive = getInteractive(req.params.id);

	if (interactive) {
		return controllerInteractive(req, res, next, interactive);
	}

	const articlePromise = getArticle(req.params.id);
	const contentPromises = [articlePromise];

	if (res.locals.flags.articleTopper || res.locals.flags.contentPackages) {
		contentPromises.push(
			getRichArticle(req.params.id)
		);
	}

	if (res.locals.flags.contentPackages) {
		contentPromises.push(
			articlePromise.then(content => decorateContentWithPackage(content))
		);
	}

	return Promise.all(contentPromises)
		.then(data => {
			const article = data[0];
			const richArticle = data.length > 1 ? data[1] : null;
			const webUrl = article && article.webUrl || '';

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
			if (article && article.originatingParty && article.originatingParty !== 'FT') {
				return res.redirect(302, `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`);
			}

			// Redirect requests for placeholders
			if (article && article.type === 'placeholder') {
				return res.redirect(302, article.url);
			}

			if (article) {
				if (isArticlePodcast(article)) {
					return controllerPodcast(req, res, next, article);
				} else if (isArticleVideo(article)) {
					return controllerVideo(req, res, next, article);
				} else if (isArticlePackage(article)) {
					return controllerPackage(req, res, next, article, richArticle)
				} else {
					return controllerArticle(req, res, next, article, richArticle);
				}
			}

			return shellpromise(`curl -s http://www.ft.com/cms/s/${req.params.id}.html -H 'FT-Site: falcon' -I | grep -i location || echo`, { verbose: true })
				.then(response => {
					const webUrl = response.replace(/^Location:/i, '').trim();

					if (/^http:\/\/www\.ft\.com\//.test(webUrl)) {
						res.redirect(302, `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`);
					} else {
						res.sendStatus(404);
					}
				});
		})
		.catch(error => {
			logger.error({ event: 'CONTENT_FETCH_FAILED', err: error.toString(), uuid: req.params.id });
			next(error);
		});
};
