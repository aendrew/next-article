const articleBranding = require('ft-n-article-branding');
const decorateMetadataHelper = require('../controllers/article-helpers/decorate-metadata');
const addTagTitlePrefix = require('../controllers/article-helpers/tag-title-prefix');
const topperThemeMap = require('../controllers/article-helpers/topper-theme-map');
const getMoreOnTags = require('../controllers/article-helpers/get-more-on-tags');
const bylineTransform = require('../transforms/byline');

function isUserSignedIn (req) {
	return req.header('ft-session-token') && req.header('ft-session-token') !== '-'
}

module.exports = function decorateContent (req, res, content, flags) {
	content.signedIn = isUserSignedIn(req);
	content.thisYear = new Date().getFullYear();
	content.shareUrl = req.get('ft-real-url') || content.url;

	if (req.query.myftTopics) {
		content.myftTopics = req.query.myftTopics.split(',');
	}

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(content);
	content.isSpecialReport = content.primaryTag && content.primaryTag.taxonomy === 'specialReports';

	// Keeping primary tag/branch/section hacks here in one place
	if (content.type === 'podcast') {
		// HACK set primaryBrand to Podcasts so will populate second more on
		content.primaryBrand = content.tags.find(tag => tag.id === 'NjI2MWZlMTEtMTE2NS00ZmI0LWFkMzMtNDhiYjA3YjcxYzIy-U2VjdGlvbnM=');
	} else if (content.type === 'video' && !content.primaryTag) {
		// HACK: There's no primary tag via the API yet, so grab the first section tag if present
		content.primaryTag = content.tags.find(tag => tag.taxonomy === 'sections' && tag.prefLabel !== 'Video');
		content.primarySectionTag = content.primarySectionTag || content.primaryTag;
	}

	// Decorate with related stuff
	content.moreOns = getMoreOnTags(content);
	content.dehydratedMetadata = { moreOns: content.moreOns };

	if (flags.articleSuggestedRead && content.metadata.length) {
		if (content.type === 'article' || content.type === 'package') {
			content.readNextTopic = addTagTitlePrefix(content.primaryTag);
		} else {
			content.readNextTopic = content.primaryTag;
		}
	}

	content.isBusinessEducation = (typeof content.metadata.find(tag => tag.idV1 === 'MTI2-U2VjdGlvbnM=') !== 'undefined');
	content.adsLayout = req.query.adsLayout || 'default';
	content.byline = bylineTransform(content.byline, content.metadata.filter(item => item.taxonomy === 'authors'));

	if(!(content.type === 'package' || content.package && content.package.brand)) {
		content.designGenre = articleBranding(content.metadata);
	}

	content.topper = topperThemeMap(content, flags);

	return Promise.resolve(content);
}
