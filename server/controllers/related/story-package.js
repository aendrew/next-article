'use strict';

var api = require('next-ft-api-client');
var fetchres = require('fetchres');
var logger = require('ft-next-express').logger;
var NoRelatedResultsException = require('../../lib/no-related-results-exception');
var articlePodMapping = require('../../mappings/article-pod-mapping');

module.exports = function(req, res, next) {
	var storyPackageIds = req.query.ids;

	if (!req.query.ids) {
		return res.status(400).end();
	}

	return api.contentLegacy({
		uuid: storyPackageIds.split(','),
		useElasticSearch: true,
		useElasticSearchOnAws: res.locals.flags.elasticSearchOnAws
	})
		.then(function(articles) {
			if (!articles.length) {
				throw new NoRelatedResultsException();
			}
			if (req.query.count) {
				articles.splice(req.query.count);
			}

			return articles.map(function(article) {
				return articlePodMapping(article);
			});
		})
		.then(function(articles) {
			return res.render('related/story-package', {
				articles: articles.map(function(article, index) {
					if (articles.length > 4 && article.image && index && index > 2) {
						article.image = undefined;
					}
					return article;
				}),
				headerText: 'Related stories',
			});
		})
		.catch(function(err) {
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
