'use strict';

const logger = require('ft-next-express').logger;
const cacheControlUtil = require('../utils/cache-control');
const suggestedHelper = require('./article-helpers/suggested');
const openGraphHelper = require('./article-helpers/open-graph');
const decorateMetadataHelper = require('./article-helpers/decorate-metadata');
const externalPodcastLinksUtil = require('../utils/external-podcast-links');

module.exports = function podcastLegacyController(req, res, next, payload) {
	let asyncWorkToDo = [];

	// Decorate article with primary tags and tags for display
	decorateMetadataHelper(payload);

	payload.thisYear = new Date().getFullYear();

	// TODO: move this to template or re-name subheading
	payload.standFirst = payload.summaries ? payload.summaries[0] : '';

	// Append podcast specific data
	payload.externalLinks = externalPodcastLinksUtil(payload.provenance[0]);
	payload.media = payload.attachments[0];

	if (res.locals.flags.openGraph) {
		openGraphHelper(payload);
	}

	asyncWorkToDo.push(
		suggestedHelper(payload.id, [], payload.primaryTag).then(
			articles => payload.relatedContent = articles
		)
	);

	return Promise.all(asyncWorkToDo)
		.then(() => {
			payload.layout = 'wrapper';
			return res.set(cacheControlUtil).render('podcast', payload);
		})
		.catch(error => {
			logger.error(error);
			next(error);
		});
};
