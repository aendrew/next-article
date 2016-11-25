const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
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

			return res.render('partials/related/story-package', { items: storyPackage });
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
