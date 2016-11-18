const api = require('next-ft-api-client');
const logger = require('@financial-times/n-logger').default;
const contentDecorator = require('@financial-times/n-content-decorator');

module.exports = function (articleId, storyPackageIds, primaryTag) {
	let suggestedArticleFetch;

	if (primaryTag && storyPackageIds.length < 5) {
		suggestedArticleFetch = api.search({
			filter: ['metadata.idV1', primaryTag.idV1],
			fields: ['id'],
			// Get extras so de-dupe against article and story package
			count: 5 + storyPackageIds.length + 1
		})
			.then(
				articles => storyPackageIds.concat(
					articles
						.filter(article => article.id !== articleId && !storyPackageIds.includes(article.id))
						.map(article => article.id)
				)
			);
	} else {
		suggestedArticleFetch = Promise.resolve(storyPackageIds);
	}

	return suggestedArticleFetch
		.then(
			suggestedArticleIds => api.content({
				uuid: suggestedArticleIds.slice(0, 5),
				index: 'v3_api_v2'
			})
		)
		.then(items => items.map(item => {
			return Object.assign(item, contentDecorator(item, { excludeTaxonomies: true }));
		}))
		.catch(
			error => logger.warn('Fetching suggested reads failed.', error.toString())
		);
};
