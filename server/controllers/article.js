const genericContentTransform = require('ft-n-content-transform').transformAll;
const nextJsonLd = require('@financial-times/next-json-ld');
const applicationContentTransform = require('../transforms/body');
const articleBranding = require('ft-n-article-branding');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const openGraphHelper = require('./article-helpers/open-graph');
const bylineTransform = require('../transforms/byline');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const addTagTitlePrefix = require('./article-helpers/tag-title-prefix');
const topperThemeMap = require('./article-helpers/topper-theme-map');
const getAdsLayout = require('../utils/get-ads-layout');
const cheerio = require('cheerio');

function isCapiV1 (provenance = []) {
	return provenance.find(
			source => source.includes('http://api.ft.com/content/items/v1/')
	);
}

function isCapiV2 (provenance = []) {
	return provenance.find(
		source => source.includes('http://api.ft.com/enrichedcontent/')
	);
}

function transformArticleBody (body = '', flags, options) {
	const articleBody = genericContentTransform(body, flags);
	return applicationContentTransform(articleBody, flags, options);
}

function isUserSignedIn (req) {
	return req.header('ft-session-token') && req.header('ft-session-token') !== '-'
}

function isFreeArticle (webUrl = '') {
	return webUrl.search('/cms/s/2') !== -1
}

function isPremium (webUrl = '') {
	return webUrl.search('/cms/s/3') !== -1
}

function isMethodeArticle (webUrl = '') {
	if (webUrl.indexOf('http://www.ft.com/cms/s') === 0) {
		return true;
	}
	return false;
}

function isFastftArticle (webUrl = '') {
	if (webUrl.indexOf('http://www.ft.com/fastft/') === 0) {
		return true;
	}
	return false;
}

function isBlogsArticle (webUrl = '') {
	if (webUrl.indexOf('http://blogs.ft.com/') === 0) {
		return true;
	}
	return false;
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

function getCanonicalUrl (webUrl, id) {
	if (isMethodeArticle(webUrl) || isFastftArticle(webUrl) || isBlogsArticle(webUrl)) {
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

module.exports = function articleV3Controller (req, res, next, content) {
	const userIsAnonymous = res.locals.anon && res.locals.anon.userIsAnonymous;

	res.vary('ft-is-aud-dev');
	res.vary('ft-blocked-url');
	res.vary('ft-barrier-type');
	res.vary('x-ft-auth-gate-result');

	res.set('x-ft-auth-gate-result', req.get('x-ft-auth-gate-result') || '-');
	res.set('x-ft-barrier-type', req.get('ft-barrier-type') || '-');
	res.set('ft-blocked-url', req.get('ft-blocked-url') || '-');

	content.thisYear = new Date().getFullYear();

	content.shareUrl = req.get('ft-real-url') || content.url;

	content.adsLayout = getAdsLayout(req.query.adsLayout);

	if (req.query.myftTopics) {
		content.myftTopics = req.query.myftTopics.split(',');
	}

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(content);
	content.isBusinessEducation = (typeof content.metadata.find(tag => tag.idV1 === 'MTI2-U2VjdGlvbnM=') !== 'undefined');
	// Setup the description field
	content.description = getDescription(content);

	// Set the canonical URL, it's needed by Open Graph'
	content.canonicalUrl = getCanonicalUrl(content.webUrl, content.id);

	// Apply content and article specific transforms to bodyHTML
	Object.assign(
		content,
		transformArticleBody(content.bodyHTML, res.locals.flags, {
			fragment: req.query.fragment,
			adsLayout: content.adsLayout,
			userIsAnonymous,
			contentPackage: Object.assign({ context: content.context }, content.package)
		})
	);

	content.designGenre = articleBranding(content.metadata);

	if(req.app && req.app.getHashedAssetUrl) {
		content.commentsAssets = {
			js: req.app.getHashedAssetUrl('comments.js'),
			css: req.app.getHashedAssetUrl('comments.css')
		};
	}

	// Decorate with related stuff
	content.moreOns = getMoreOnTags(content);

	content.articleV1 = isCapiV1(content.provenance);
	content.articleV2 = isCapiV2(content.provenance);

	content.byline = bylineTransform(content.byline, content.metadata.filter(item => item.taxonomy === 'authors'));

	content.dehydratedMetadata = {
		moreOns: content.moreOns,
		package: content.storyPackage || []
	};

	if (res.locals.flags.openGraph) {
		openGraphHelper(content);
	}

	if (res.locals.flags.articleSuggestedRead && content.metadata.length) {
		content.readNextTopic = addTagTitlePrefix(content.primaryTag);
	}

	content.signedIn = isUserSignedIn(req);
	content.freeArticle = isFreeArticle(content.webUrl);
	content.isPremium = isPremium(content.webUrl);
	content.withGcs = showGcs(req, res, content.freeArticle);
	content.lightSignup = {
		show: (res.locals.anon && res.locals.anon.userIsAnonymous) && res.locals.flags.lightSignupInArticle,
		isInferred: res.locals.flags.lsuInferredTopic
	};

	if (res.locals.flags.newSchema) {
		res.locals.jsonLd = res.locals.jsonLd || [];
		res.locals.jsonLd.push(nextJsonLd.newsArticle(content));
		content.jsonLd = res.locals.jsonLd;
	}

	if (res.locals.flags.ftlabsAudioPlayer) {
		content.isAudioArticle = content.metadata.some(tag => tag.idV1 === 'MjgwYzIyNjUtMmQ1ZC00NTNiLTgyMTQtMWU5ZDc3YzIzNWUy-VG9waWNz');
	}

	content.topper = topperThemeMap(content, res.locals.flags);

	content.contentType = 'article';
	content.shouldRenderMyftHint = true;
	if (req.query.fragment) {
		res.render('fragment', content);
	} else {
		content.layout = 'wrapper';
		content.viewStyle = 'compact';
		res.render('content', content);
	}
};
