// Moved to https://github.com/Financial-Times/next-classification-api/blob/master/server/controllers/access.js
// Remove this file when fully switched to Content Classification Api (contentClassificationApi flag)

'use strict';

var metrics = require('ft-next-express').metrics;
var api = require('next-ft-api-client');
var fetchres = require('fetchres');
var url	= require('url');
var blogsAccessPoller = require('../lib/blogs-access-poller');

var accessMetadata = [
	{
		path_regex: '/cms/s/[01]',
		classification: 'conditional_standard'
	},
	{
		path_regex: '/cms/s/2',
		classification: 'unconditional'
	},
	{
		path_regex: '/cms/s/3',
		classification: 'conditional_premium'
	},
	{
		path_regex: '/fastft',
		classification: 'conditional_standard'

	},
	{
		host_regex: 'ftalphaville\.ft\.com',
		classification: 'conditional_registered'

	}
];

function suppressBadResponses(err) {
	if (fetchres.originatedError(err)) {
		return;
	} else {
		throw err;
	}
}

module.exports = function(req, res, next) {

	// make sure we're not hitting this controller when the api flag is on
	if (res.locals && res.locals.flags.contentClassificationApi) {
		throw new Error('Hitting content classification in Article with contentClassificationApi flag on');
	}

	if (req.get('X-FT-Access-Metadata') === 'remote_headers') {
		return api.content({
			uuid: req.params.id,
			index: 'v3_api_v2'
		})
			.catch(suppressBadResponses)
			.then(function(article) {
				metrics.count('__debug.accessmiddleware.accessservice.start.count', 1);

				// if this article doesn't exist in capi, continue
				if (!article) {
					return next();
				}

				var blogAccessMetadata = blogsAccessPoller.getData().access_metadata.map(function (access) {
					access.host_regex = 'blogs\.ft\.com';
					return access;
				});

				var classification = 'conditional_registered';
				var articleUrl = url.parse(article.webUrl);
				var access = accessMetadata
					.concat(blogAccessMetadata)
					.find(function (access) {
						if (access.path_regex && articleUrl.pathname.search(access.path_regex) === -1) {
							return false;
						}
						if (access.host_regex && articleUrl.hostname.search(access.host_regex) === -1) {
							return false;
						}
						return true;
					});

				if (access) {
					classification = access.classification;
				}

				metrics.count('__debug.accessmiddleware.accessservice.end.count', 1);

				res.set('Outbound-Cache-Control', 'public, max-age=3600');
				res.set('Surrogate-Control', 'max-age=3600');
				res.vary('X-FT-UID');
				res.set('X-FT-UID', req.params.id);
				res.set('X-FT-Content-Classification', classification);
				res.status(200).end();
			})
			.catch(function() {
				metrics.count('__debug.accessmiddleware.accessservice.error.count', 1);
				next();
			});
	} else {
		metrics.count('__debug.accessmiddleware.count', 1);
		next();
	}
};
