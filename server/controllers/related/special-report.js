const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const getRelatedArticles = require('../../lib/get-related-articles');
const contentDecorator = require('@financial-times/n-content-decorator');

module.exports = function (req, res, next) {

	res.unvaryAll('wrapper');

	if (!req.query.tagId) {
		return res.status(400).end();
	}

	const tagId = req.query.tagId;
	const count = parseInt(req.query.count, 10) || 5;
	const parentId = req.params.id;

	return getRelatedArticles(tagId, count, parentId)
		.then(specialReportArticles => {
			specialReportArticles = specialReportArticles.map(article => Object.assign(article, contentDecorator(article)));
			let articleWithImage = specialReportArticles.find(article => article.image);
			let articleWithSpecialReportPrimary = specialReportArticles
				.find(article => article.primaryTag && article.primaryTag.taxonomy === 'specialReports');
			return res.render('related/special-report', {
				idV1: articleWithSpecialReportPrimary ? articleWithSpecialReportPrimary.primaryTag.id : null,
				prefLabel: articleWithSpecialReportPrimary ? articleWithSpecialReportPrimary.primaryTag.name : null,
				image: articleWithImage ? articleWithImage.image : null,
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
