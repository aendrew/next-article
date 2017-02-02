const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;

const fetchGraphQlData = require('../../lib/fetch-graphql-data');
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const getRelatedArticles = require('../../lib/get-related-articles');

module.exports = function (req, res, next) {

	res.unvaryAll('wrapper');

	if (!req.query.tagId) {
		return res.status(400).end();
	}

	const tagId = req.query.tagId;

	res.set('surrogate-key', `idV1:${req.query.tagId}`);

	const count = parseInt(req.query.count, 10) || 5;
	const parentId = req.params.id;
	const tagPrefLabelPromise = fetchGraphQlData(`
		query ($tagId: String!) {
			specialReport: tag(id: $tagId) {
				prefLabel
			}
		}
	`, { tagId })
		.then(({ specialReport: { prefLabel } = {}} = {}) => prefLabel)
		.catch(err => logger.error(err));

	return Promise.all([getRelatedArticles(tagId, count, parentId), tagPrefLabelPromise])
		.then(([specialReportArticles, tagPrefLabel]) => {
			const articleWithImage = specialReportArticles.find(article => article.mainImage);
			return res.render('related/special-report', {
				idV1: tagId,
				prefLabel: tagPrefLabel,
				mainImage: articleWithImage ? articleWithImage.mainImage : null,
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
