const logger = require('@financial-times/n-logger').default;
const fetchGraphQlData = require('../../lib/fetch-graphql-data');
const upNextContentQuery = require('../../graphql-queries/video-up-next');
const url = require('url');

module.exports = function (req, res, next) {
	res.unvaryAll('wrapper');

	if (!req.query.tagId) {
		return res.status(400).end();
	}

	const tagId = req.query.tagId;
	const currentUuid = req.params.id;
	const videosToDisplay = 4;

	res.set('surrogate-key', `idV1:${tagId}`);

	return fetchGraphQlData(upNextContentQuery, { tagId })
		.then(({ tag: { latestContent = [] } } = {}) => {

			// HACK: Until we have a proper way of recommending/linking what next to watch
			// on videos, use the four next videos after the current one.  This isn't (yet)
			// supported in next-api searches, so instead we select the latest twenty; if
			// the current uuid is in the list, we select the four after it, otherwise we
			// just show the most recent four again.

			let currentVideoIndex = latestContent.findIndex(content => content.id === currentUuid);
			let sliceStartIndex = 0;
			if (currentVideoIndex !== -1 && currentVideoIndex < latestContent.length - videosToDisplay) {
				sliceStartIndex = currentVideoIndex + 1;
			}

			return latestContent.slice(sliceStartIndex, sliceStartIndex + videosToDisplay);
		})

		// HACK: videos should stay on Next, as there's no real Falcon-served equivalent, and
		// the old video.ft.com backend is going away
		.then(items => {
			items.forEach(item => {
				let urlObject = url.parse(item.relativeUrl, true, true);
				urlObject.query.ft_site = 'next';
				delete urlObject.search; // Forces regeneration of search from query parts
				item.relativeUrl = url.format(urlObject);
			});
			return items;
		})
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(items => {
			if (!items.length) {
				return res.status(200).end();
			}

			return res.render('partials/teaser-collections/video-up-next', { items });
		})
		.catch(err => next(err));
};
