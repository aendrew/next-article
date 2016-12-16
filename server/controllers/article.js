const logger = require('@financial-times/n-logger').default;
const genericContentTransform = require('ft-n-content-transform').transformAll;
const nextJsonLd = require('next-json-ld');
const applicationContentTransform = require('../transforms/body');
const articleBranding = require('ft-n-article-branding');
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const openGraphHelper = require('./article-helpers/open-graph');
const bylineTransform = require('../transforms/byline');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const addTagTitlePrefix = require('./article-helpers/tag-title-prefix');
const getAdsLayout = require('../utils/get-ads-layout');

function isCapiV1 (provenance) {
	return provenance.find(
			source => source.includes('http://api.ft.com/content/items/v1/')
	);
}

function isCapiV2 (provenance) {
	return provenance.find(
		source => source.includes('http://api.ft.com/enrichedcontent/')
	);
}

function transformArticleBody (body, flags, options) {
	const articleBody = genericContentTransform(body, flags);
	return applicationContentTransform(articleBody, flags, options);
}

function isUserSignedIn (req) {
	return req.header('ft-session-token') && req.header('ft-session-token') !== '-'
}

function isFreeArticle (webUrl) {
	return webUrl.search('/cms/s/2') !== -1
}

function isPremium (webUrl) {
	return webUrl.search('/cms/s/3') !== -1
}

function isMethodeArticle (webUrl) {
	if (webUrl.indexOf('http://www.ft.com/cms/s') === 0) {
		return true;
	}
	return false;
}

function getCanonicalUrl (webUrl, id) {
	if (isMethodeArticle(webUrl)) {
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
	let asyncWorkToDo = [];

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

	//When a user comes to an article from a myFT promo area, we want to push them to follow the topic they came from
	if (req.query.tagToFollow) {
		content.tagToFollow = req.query.tagToFollow;
	}

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(content);
	content.isSpecialReport = content.primaryTag && content.primaryTag.taxonomy === 'specialReports';

	// Setup the description field
	content.description = content.subheading || '';

	// Set the canonical URL, it's needed by Open Graph'
	content.canonicalUrl = getCanonicalUrl(content.webUrl, content.id);

	// If the article is not a Methode article (i.e. it is Blogs, Fast FT or Videos, tell search engines not to index it)
	if (!isMethodeArticle(content.webUrl)) {
		res.set('X-Robots-Tag', 'noindex');
	}

	// Apply content and article specific transforms to bodyHTML
	Object.assign(content, transformArticleBody(content.bodyHTML, res.locals.flags, {
			fragment: req.query.fragment,
			adsLayout: content.adsLayout,
			userIsAnonymous: res.locals.anon && res.locals.anon.userIsAnonymous
		}
	));

	content.designGenre = articleBranding(content.metadata);

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

		asyncWorkToDo.push(
			getOnwardJourneyArticles(content.id, content.publishedDate)
				.then(onwardJourney => {
					content.readNextArticle = onwardJourney && onwardJourney.readNext;
					content.readNextArticles = onwardJourney && onwardJourney.suggestedReads;
				})
		);

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

	if(res.locals.flags.ftlabsSpokenLayer){
		content.isAudioArticle = content.metadata.some(tag => tag.idV1 === 'MjgwYzIyNjUtMmQ1ZC00NTNiLTgyMTQtMWU5ZDc3YzIzNWUy-VG9waWNz');
	}

	return Promise.all(asyncWorkToDo)
		.then(() => {
			content.contentType = 'article';
			content.shouldRenderMyftHint = true;
			if (req.query.fragment) {
				res.render('fragment', content);
			} else {
				content.layout = 'wrapper';
				res.render('content', content);
			}
		})
		.catch(error => {
			logger.error(error);
			next(error);
		});
};
