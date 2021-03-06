const fetchGraphqlData = require('../../lib/fetch-graphql-data');
const readNextQuery = require('../../graphql-queries/read-next');
const getSuggestedReads = require('./suggested');
const getReadNext = require('./read-next');
const contentPackage = require('./content-package');

module.exports = function (articleId, flags) {

	const variables = {
		uuid: articleId,
		limitPrimaryTag: 6,
		limitStoryPackage: 5
	};

	return fetchGraphqlData(readNextQuery(flags.articleSuggestedRead, flags.contentPackages), variables)
		.then(({ article = [] } = ({})) => {
			if(!article) {
				return;
			}
			const { primaryTag, storyPackage } = article;
			const topicArticles = primaryTag ? primaryTag.latestContent.filter(article => article.id !== articleId) : null;
			let onwardJourney = {};
			if (topicArticles || storyPackage) {
				onwardJourney.readNext = getReadNext(topicArticles, storyPackage, article.publishedDate);
				onwardJourney.suggestedReads = getSuggestedReads(topicArticles, storyPackage);
			}

			if (article.containedIn) {
				Object.assign(onwardJourney, contentPackage(article));
			}

			if (article.contains) {
				onwardJourney.contains = article.contains;
			}

			return onwardJourney;
		})
};
