const logger = require('@financial-times/n-logger').default;
const fetchGraphqlData = require('../../lib/fetch-graphql-data');
const readNextQuery = require('../../graphql-queries/read-next');
const getSuggestedReads = require('./suggested');
const getReadNext = require('./read-next');

module.exports = function (articleId, publishedDate) {

	const variables = {
		uuid: articleId,
		limitPrimaryTag: 6,
		limitStoryPackage: 5
	}

	return fetchGraphqlData(readNextQuery, variables)
		.then(({ article = [] } = {}) => {
			const { primaryTag, storyPackage } = article;
			const topicArticles = primaryTag ? primaryTag.latestContent.filter(article => article.id !== articleId) : null;
			if (!topicArticles && !storyPackage) {
				return;
			}

			return {
				readNext: getReadNext(topicArticles, storyPackage, publishedDate),
				suggestedReads: getSuggestedReads(topicArticles, storyPackage)
			};
		})
		.catch(
			error => logger.warn('Fetching onward journey data failed.', error.toString())
		);
};
