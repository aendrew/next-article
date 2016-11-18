const api = require('next-ft-api-client');
const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const articlePodMapping = require('../../mappings/article-pod-mapping-v3');

function getArticles (tagId, count, parentId) {
	return api.search({
		filter: [ 'metadata.idV1', tagId ],
		// Get +1 for de-duping
		count: count + 1,
		fields: [
			'id',
			'title',
			'metadata',
			'subheading',
			'mainImage',
			'publishedDate'
		]
	})
		.then(function (articles) {
			if (!articles.length || articles.length <= 1) {
				throw new NoRelatedResultsException();
			}
			return articles
				.filter(article => article.id !== parentId)
				.slice(0, count)
				.map(articlePodMapping);
		});
}

module.exports = function (req, res, next) {

	res.unvaryAll('wrapper');

	if (!req.query.tagId) {
		return res.status(400).end();
	}

	const tagId = req.query.tagId;
	const count = parseInt(req.query.count, 10) || 5;
	const parentId = req.params.id;

	return getArticles(tagId, count, parentId)
		.then(specialReportArticles => {
			let articleWithImage = specialReportArticles.find(article => article.mainImage);
			let articleWithSpecialReportPrimary = specialReportArticles
				.find(article => article.primaryTag && article.primaryTag.taxonomy === 'specialReports');
			return res.render('related/special-report', {
				idV1: articleWithSpecialReportPrimary ? articleWithSpecialReportPrimary.primaryTag.idV1 : null,
				prefLabel: articleWithSpecialReportPrimary ? articleWithSpecialReportPrimary.primaryTag.prefLabel : null,
				image: articleWithImage ? articleWithImage.mainImage : null,
				articles: specialReportArticles
			});
		})
		.catch(function (err) {
			logger.error(err);

			if (err.name === NoRelatedResultsException.NAME) {
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
