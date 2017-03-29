const cheerio = require('cheerio');
const genericContentTransform = require('ft-n-content-transform').transformAll;
const nextJsonLd = require('@financial-times/next-json-ld');
const applicationContentTransform = require('../transforms/body');
const openGraphHelper = require('../controllers/article-helpers/open-graph');
const decorateContent = require('./content');

function transformArticleBody (body = '', flags, options) {
	const articleBody = genericContentTransform(body, flags);
	return applicationContentTransform(articleBody, flags, options);
}

function isFreeArticle (webUrl = '') {
	return webUrl.search('/cms/s/2') !== -1
}

function isPremium (webUrl = '') {
	return webUrl.search('/cms/s/3') !== -1
}

function getDescription ({ standfirst, openingHTML }) {
	if (standfirst) {
		return standfirst;
	} else if (openingHTML) {
		return cheerio.load(openingHTML)('p').first().text();
	} else {
		return '';
	}
}

function getCanonicalUrl (webUrl = '', id) {
	const isMethodeArticle = webUrl.startsWith('http://www.ft.com/cms/s');
	const isFastFtArticle = webUrl.startsWith('http://www.ft.com/fastft/');
	const isBlogsArticle = webUrl.startsWith('http://blogs.ft.com/');
	if (isMethodeArticle || isFastFtArticle || isBlogsArticle) {
		return `https://www.ft.com/content/${id}`;
	} else {
		return webUrl;
	}
}

const showGcs = (req, res, isFreeArticle) => {
	if (res.locals.flags.googleConsumerSurvey && res.locals.anon && res.locals.anon.userIsAnonymous) {
		// TODO: only need to vary on free vs counted content
		res.vary('ft-content-classification');
		return !isFreeArticle;
	} else {
		return false;
	}
};

module.exports = function decorateArticle (req, res, payload, flags) {
	const userIsAnonymous = res.locals.anon && res.locals.anon.userIsAnonymous;
	const isTruncatedArticleBarrier = !!payload.inArticleBarrierHTML;

	return decorateContent(req, res, payload, flags).then(content => {

		// Setup the description field
		content.description = getDescription(content);

		// Set the canonical URL, it's needed by Open Graph'
		content.canonicalUrl = getCanonicalUrl(content.webUrl, content.id);

		// Apply content and article specific transforms to bodyHTML
		Object.assign(
			content,
			transformArticleBody(content.bodyHTML, flags, {
				fragment: req.query.fragment,
				adsLayout: content.adsLayout,
				userIsAnonymous,
				isContentPackage: content.type === 'package' || (content.package && content.package.contains)
			})
		);

		if(req.app && req.app.getHashedAssetUrl) {
			content.commentsAssets = {
				js: req.app.getHashedAssetUrl('comments.js'),
				css: req.app.getHashedAssetUrl('comments.css')
			};
		}

		content.dehydratedMetadata.package = content.storyPackage || [];

		if (flags.openGraph) {
			openGraphHelper(content);
		}

		content.freeArticle = isFreeArticle(content.webUrl);
		content.isPremium = isPremium(content.webUrl);
		content.withGcs = showGcs(req, res, content.freeArticle);
		content.lightSignup = {
			show: (res.locals.anon && res.locals.anon.userIsAnonymous) && flags.lightSignupInArticle && !isTruncatedArticleBarrier,
			isInferred: flags.lsuInferredTopic
		};

		if (flags.newSchema) {
			res.locals.jsonLd = res.locals.jsonLd || [];
			res.locals.jsonLd.push(nextJsonLd.newsArticle(content));
			content.jsonLd = res.locals.jsonLd;
		}

		if (flags.ftlabsAudioPlayer) {
			content.isAudioArticle = content.metadata.some(tag => tag.idV1 === 'MjgwYzIyNjUtMmQ1ZC00NTNiLTgyMTQtMWU5ZDc3YzIzNWUy-VG9waWNz');
		}

		content.contentType = 'article';
		content.shouldRenderMyftHint = true;
		content.template = 'content';
		return content;
	});
};
