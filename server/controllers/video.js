const logger = require('@financial-times/n-logger').default;
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const openGraphHelper = require('./article-helpers/open-graph');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const getMoreOnTags = require('./article-helpers/get-more-on-tags');
const getAdsLayout = require('../utils/get-ads-layout');

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

	if (res.locals.flags.openGraph) {
		openGraphHelper(payload);
	}

	payload.moreOns = getMoreOnTags(payload);
	payload.dehydratedMetadata = {
		moreOns: payload.moreOns
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

	return Promise.all(asyncWorkToDo)
		.then(() => {
			payload.contentType = 'video';
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
