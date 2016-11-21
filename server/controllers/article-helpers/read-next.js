const logger = require('@financial-times/n-logger').default;
const contentDecorator = require('@financial-times/n-content-decorator');
const fetchGraphqlData = require('../../lib/fetch-graphql-data');
const readNextQuery = require('../../graphql-queries/read-next');

module.exports = function (articleId, publishedDate) {

	const variables = {
		uuid: articleId,
		limitPrimaryTag: 2,
		limitStoryPackage: 1
	};

	return fetchGraphqlData(readNextQuery, variables)
		.then(({ article = [] } = {}) => {
			let { primaryTag: { latestContent: topicArticle } } = article;
			let { storyPackage: packageArticle } = article;
			topicArticle = topicArticle.filter(article => article.id !== articleId).shift();
			packageArticle = packageArticle[0];

			if (!topicArticle && !packageArticle) {
				return;
			}

			// hierarchy of compellingness governing which read next article to return
			if (topicArticle && new Date(topicArticle.lastPublished) > new Date(publishedDate)) {
				// 1. return article with same topic as parent if more recent
				return Object.assign({}, topicArticle, contentDecorator(topicArticle), {moreRecent: true});
			} else if (packageArticle) {
				// 2. otherwise if story package return the first one
				return Object.assign({}, packageArticle, contentDecorator(packageArticle));
			} else {
				// 3. failing that return the article on the same topic
				return Object.assign({}, topicArticle, contentDecorator(topicArticle));
			}
		})
		.catch(error => {
			logger.warn('Fetching read next failed.', error.toString());
		});
};
