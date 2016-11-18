const logger = require('@financial-times/n-logger').default;
const suggestedHelper = require('./article-helpers/suggested');
const readNextHelper = require('./article-helpers/read-next');
const openGraphHelper = require('./article-helpers/open-graph');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const externalPodcastLinksUtil = require('../utils/external-podcast-links');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const getAdsLayout = require('../utils/get-ads-layout');
const podcastMainImageHTML = require('./article-helpers/podcast-main-image');

module.exports = function podcastLegacyController (req, res, next, payload) {
	let asyncWorkToDo = [];

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(payload);

	payload.thisYear = new Date().getFullYear();

	// TODO: move this to template or re-name subheading
	payload.standfirst = payload.subheading || '';

	// Append podcast specific data
	payload.externalLinks = externalPodcastLinksUtil(payload.provenance[0]);
	payload.media = payload.attachments[0];

	if (res.locals.flags.openGraph) {
		openGraphHelper(payload);
	}

	// HACK set primaryBrand to Podcasts so will populate second more on
	payload.primaryBrand = payload.tags
		.find(tag => tag.id === 'NjI2MWZlMTEtMTE2NS00ZmI0LWFkMzMtNDhiYjA3YjcxYzIy-U2VjdGlvbnM=');

	payload.moreOns = getMoreOnTags(payload);
	payload.dehydratedMetadata = {
		moreOns: payload.moreOns
	};

	if (payload.mainImage) {
			payload.mainImageHTML = podcastMainImageHTML(payload.mainImage);
	}

	if (res.locals.flags.articleSuggestedRead && payload.metadata.length) {
		let storyPackageIds = (payload.storyPackage || []).map(story => story.id);

		asyncWorkToDo.push(
			suggestedHelper(payload.id, storyPackageIds, payload.primaryTag).then(
				articles => payload.readNextArticles = articles
			)
		);

		asyncWorkToDo.push(
			readNextHelper(payload.id, storyPackageIds, payload.primaryTag, payload.publishedDate).then(
				article => payload.readNextArticle = article
			)
		);

		payload.readNextTopic = payload.primaryTag;
	}

	return Promise.all(asyncWorkToDo)
		.then(() => {
			payload.contentType = 'podcast';
			payload.adsLayout = getAdsLayout(req.query.adsLayout);

			if (req.query.fragment) {
				res.unvaryAll('wrapper');
				res.render('fragment', payload);
			} else {
				payload.layout = 'wrapper';
				res.render('content', payload);
			}
		})
		.catch(error => {
			logger.error(error);
			next(error);
		});
};
