const fetchGraphQlData = require('./fetch-graphql-data');
const relatedContentQuery = require('../graphql-queries/related-content');
const NoRelatedResultsException = require('./no-related-results-exception');
const logger = require('@financial-times/n-logger').default;

module.exports = (tagId, count, parentId) => {
	return fetchGraphQlData(relatedContentQuery, { tagId, limit: count + 1 })
		.then(({ search: articles = [] } = {}) => {
			if (!articles.length) {
				throw new NoRelatedResultsException();
			}
			return articles
				.filter(article => article.id !== parentId)
				.slice(0, count)
		})
		.catch(err => {
			logger.error(err);
			return [];
		})
};
