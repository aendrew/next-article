const logger = require('@financial-times/n-logger').default;
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const openGraphHelper = require('./article-helpers/open-graph');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const getAdsLayout = require('../utils/get-ads-layout');
const durationTransform = require('../transforms/video-duration');

module.exports = function (req, res, next, payload) {
	const asyncWorkToDo = [];

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(payload);

	payload.thisYear = new Date().getFullYear();

	// TODO: move this to template or re-name subheading
	payload.standfirst = payload.subheading || '';

	payload.video = {
		id: payload.webUrl.replace('http://video.ft.com/', '')
	};

	const mp4s = payload.attachments.filter(attachment => attachment.mediaType === 'video/mp4' && 'codec' in attachment);

	if (mp4s.length) {
		payload.brightcoveData = {
			videoStillURL: payload.mainImage && payload.mainImage.url,
			renditions: mp4s.map(rendition => ({
				url: rendition.url,
				videoCodec: rendition.codec,
				frameWidth: rendition.width
			}))
		};
	}

	if (res.locals.flags.closedCaptions) {
		payload.captions = payload.attachments.filter(attachment => attachment.mediaType === 'text/vtt').reduce((a, b) => b, undefined);
	}

	payload.shareUrl = req.get('ft-real-url') || payload.url;

	if (res.locals.flags.openGraph) {
		openGraphHelper(payload);
	}

	payload.formattedDuration = durationTransform(payload.attachments && payload.attachments[0] && payload.attachments[0].duration);

	// HACK: There's no primary tag via the API yet, so grab the first section tag if present
	if (!payload.primaryTag) {
		payload.primaryTag = payload.tags.find(tag => tag.taxonomy === 'sections' && tag.prefLabel !== 'Video');
		payload.primarySectionTag = payload.primarySectionTag || payload.primaryTag;
	}

	payload.moreOns = getMoreOnTags(payload);
	payload.dehydratedMetadata = {
		upNextTag: payload.primaryTag && payload.primaryTag.idV1,
	};

	if (res.locals.flags.articleSuggestedRead && payload.metadata.length) {

		asyncWorkToDo.push(
			getOnwardJourneyArticles(payload.id, payload.publishedDate)
				.then(onwardJourney => {
					payload.readNextArticle = onwardJourney && onwardJourney.readNext;
					payload.readNextArticles = onwardJourney && onwardJourney.suggestedReads;
				})
		);

		payload.readNextTopic = payload.primaryTag;
	}

	payload.autoplay = !res.locals.flags.videoArticlePage;

	return Promise.all(asyncWorkToDo)
		.then(() => {
			payload.contentType = 'video';
			payload.adsLayout = getAdsLayout(req.query.adsLayout);
			if (req.query.fragment) {
				res.unvaryAll('wrapper');
				res.render('fragment', payload);
			} else {
				payload.layout = 'wrapper';
				payload.viewStyle = 'compact';
				res.render('content-video', payload);
			}
		})
		.catch(error => {
			logger.error(error);
			next(error);
		});
};
