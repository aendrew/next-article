const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const contentDecorator = require('@financial-times/n-content-decorator');
const ReactServer = require('react-dom/server');
const React = require('react');
const getSection = require('../../../config/sections');
const Section = require('@financial-times/n-section').Section;
const fetchGraphQlData = require('../../lib/fetch-graphql-data');
const storyPackageQuery = require('../../graphql-queries/story-package');

module.exports = function (req, res, next) {
	res.unvaryAll('wrapper');

	if (!req.params.id) {
		return res.status(400).end();
	}

	let count = parseInt(req.query.count, 10) || 3;

	return fetchGraphQlData(storyPackageQuery, { uuid: req.params.id, limit: count })
		.then(({ article: { storyPackage = [] } } = {}) => {
			if (!storyPackage.length) {
				throw new NoRelatedResultsException();
			}

			res.set('surrogate-key', storyPackage.map(article => `contentId:${article.id}`).join(' '));

			return storyPackage.map(article => Object.assign(article, contentDecorator(article)));
		})
		.then(storyPackage => {

			if(res.locals.flags.nTeaserArticle) {

				return res.render('partials/related/story-package', { items: storyPackage });
			} else {
				const sectionProps = getSection(
					'onward-journey',
					{content: storyPackage},
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
