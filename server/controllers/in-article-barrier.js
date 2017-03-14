const logger = require('@financial-times/n-logger').default;
const controllerArticle = require('./article');
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');

module.exports = (req, res, next) => {
	const { content, barrierHTML } = req.body;

	content.inArticleBarrierHTML = decodeURIComponent(barrierHTML);

	getOnwardJourneyArticles(content.id, res.locals.flags)
		.then((onwardJourney) => {
			if (onwardJourney) {
				content.readNextArticle = onwardJourney.readNext;
				content.readNextArticles = onwardJourney.suggestedReads;

				if(onwardJourney.package || onwardJourney.context) {
					content.package = onwardJourney.package;
					content.context = onwardJourney.context;
				}
			}

			return controllerArticle(req, res, next, content);
		})
		.catch(err => {
			logger.warn({ event: 'ONWARD_JOURNEY_FETCH_FAIL' }, err);
		});

};
