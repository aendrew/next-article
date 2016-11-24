const contentDecorator = require('@financial-times/n-content-decorator');

module.exports = function (topicArticles, packageArticles) {

	let suggestedReads;

	if (packageArticles.length >= 5) {
		suggestedReads = packageArticles.slice(0, 5);
	} else {
		const packageArticleIds = packageArticles.map(article => article.id);
		topicArticles = topicArticles
			? topicArticles.filter(article => !packageArticleIds.includes(article.id))
			: [];
		suggestedReads = packageArticles.concat(topicArticles).slice(0, 5);
	}

	return suggestedReads.map(article => {
		return Object.assign({}, article, contentDecorator(article));
	});
};
