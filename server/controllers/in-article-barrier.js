const logger = require('@financial-times/n-logger').default;
const articleHandler = require('../model/article');
const getOnwardJourneyArticles = require('./article-helpers/onward-journey');
const chooseStylesheets = require('../lib/choose-stylesheets');

module.exports = (req, res) => {
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

			function render (data) {
				if (req.query.fragment) {
					res.render('fragment', data);
				} else {
					data.layout = 'wrapper';
					data.viewStyle = 'compact';
					res.locals.stylesheets = chooseStylesheets(data);
					res.render(data.template || 'content', data);
				}
			}

			return articleHandler(req, res, content, res.locals.flags).then(render);
		})
		.catch(err => {
			logger.warn({ event: 'ONWARD_JOURNEY_FETCH_FAIL' }, err);
		});

};
