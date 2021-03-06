module.exports = function (topicArticles, packageArticles, publishedDate) {

	const topicArticle = topicArticles && topicArticles[0];
	const packageArticle = packageArticles && packageArticles[0];

	// hierarchy of compellingness governing which read next article to return
	if (topicArticle && new Date(topicArticle.publishedDate) > new Date(publishedDate)) {
		// 1. return article with same topic as parent if more recent
		return Object.assign({}, topicArticle, {moreRecent: true});
	} else if (packageArticle) {
		// 2. otherwise if story package return the first one
		return packageArticle;
	} else {
		// 3. failing that return the article on the same topic
		return topicArticle;
	}

};
