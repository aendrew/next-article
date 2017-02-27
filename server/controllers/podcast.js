const openGraphHelper = require('./article-helpers/open-graph');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const externalPodcastLinksUtil = require('../utils/external-podcast-links');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const getAdsLayout = require('../utils/get-ads-layout');
const podcastMainImageHTML = require('./article-helpers/podcast-main-image');

module.exports = function podcastLegacyController (req, res, next, payload) {

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
		payload.readNextTopic = payload.primaryTag;
	}

	payload.contentType = 'podcast';
	payload.adsLayout = getAdsLayout(req.query.adsLayout);

	if (req.query.fragment) {
		res.unvaryAll('wrapper');
		res.render('fragment', payload);
	} else {
		payload.layout = 'wrapper';
		payload.viewStyle = 'compact';
		res.render('content', payload);
	}
};
