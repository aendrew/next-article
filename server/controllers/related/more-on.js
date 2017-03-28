const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const NoRelatedResultsException = require('../../lib/no-related-results-exception');
const getRelatedArticles = require('../../lib/get-related-articles');

const allSettled = (promises) => {
	let resolveWhenSettled = function (promise) {
		return new Promise(res => {
			promise.then(res, () => res());
		});
	};
	return Promise.all(promises.map(resolveWhenSettled));
};

module.exports = function (req, res, next) {

	res.unvaryAll('wrapper');

	// make sure there are tag ids and an index not greater than 4
	if (!req.query.tagIds || !req.query.index || parseInt(req.query.index, 10) > 4) {
		return res.status(400).end();
	}

	const tagIdArray = req.query.tagIds.split(',');

	res.set('surrogate-key', tagIdArray.map(id => `idV1:${id}`).join(' '));

	const moreOnIndex = req.query.index;
	const parentId = req.params.id;
	const count = Math.min(parseInt(req.query.count, 10), 10) || 5;

	let getArticlesPromises = [];
	let precedingMoreOnIds = [];

	const dedupe = function (articlesToDedupe) {
		return !articlesToDedupe
			? []
			: articlesToDedupe.filter(article => isNotADupe(article.id)).slice(0, count);
	};

	const isNotADupe = function (articleId) {
		return precedingMoreOnIds.indexOf(articleId) === -1;
	};

	// get predecessor more-on tag articles for deduping
	tagIdArray.slice(0,(moreOnIndex + 1)).forEach((tagId, i) => {
		getArticlesPromises.push(getRelatedArticles(tagId, (count * (i + 1)) + 1, parentId));
	});

	return allSettled(getArticlesPromises)
		.then(moreOnArticlesArray => {
			for (let i = 0; i < moreOnIndex; i++) {
				precedingMoreOnIds = precedingMoreOnIds
				.concat(dedupe(moreOnArticlesArray[i]).map(article => article.id));
			}
			moreOnArticlesArray[moreOnIndex] = dedupe(moreOnArticlesArray[moreOnIndex]);
			res.locals.stylesheets = { inline: [], lazy: [], blocking: [] };

			return res.render('partials/teaser-collections/1-3', { items: moreOnArticlesArray[moreOnIndex] });

		})
		.catch(function (err) {
			logger.error(err);

			if(err.name === NoRelatedResultsException.NAME) {
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
