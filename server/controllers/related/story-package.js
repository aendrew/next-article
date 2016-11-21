const api = require('next-ft-api-client');
const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const contentDecorator = require('@financial-times/n-content-decorator');
const ReactServer = require('react-dom/server');
const React = require('react');
const getSection = require('../../../config/sections');
const Section = require('@financial-times/n-section').Section;

module.exports = function (req, res, next) {
	res.unvaryAll('wrapper');

	if (!req.query.articleIds) {
		return res.status(400).end();
	}

	let count = parseInt(req.query.count, 10) || 5;
	const uuids = req.query.articleIds.split(',').slice(0, count);

	res.set('surrogate-key', uuids.map(id => `contentId:${id}`).join(' '));

	return api.content({
		index: 'v3_api_v2',
		uuid: uuids
	})
		.then(function (articles) {
			if (!articles.length) {
				throw new NoRelatedResultsException();
			}
			if (articles.length % 2 === 0) articles.length --;
			return articles.map(article => Object.assign(article, contentDecorator(article)));
		})
		.then(articles => {

			if(res.locals.flags.nTeaserArticle) {

				return res.render('partials/related/story-package', { items: articles });
			} else {
				const sectionProps = getSection(
					'onward-journey',
					{content: articles},
					res.locals.flags,
					{
						trackScrollEvent: 'story-package',
						name: {
							title: 'Related stories'
						}
					}
				);
				const sectionHtml = ReactServer.renderToStaticMarkup(<Section {...sectionProps} />);

				return res.send(sectionHtml);

			}


		})
		.catch(function (err) {
			logger.error(err);

			if(err.name === NoRelatedResultsException.NAME) {
				res.status(200).end();
			} else if (err instanceof fetchres.ReadTimeoutError) {
				res.status(500).end();
			} else if (fetchres.originatedError(err)) {
				res.status(404).end();
			} else {
				next(err);
			}
		});
};
