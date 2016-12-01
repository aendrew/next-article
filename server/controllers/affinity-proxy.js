'use strict';
const affinityApi = require('ft-next-affinity-client');
const logger = require('@financial-times/n-logger').default;

/**
* Public-facing endpoint to proxy client-side requests via the server to the affinity client
* See affinity-client for params
**/
module.exports = (req, res) => {
	const options = {
		params: req.params,
		query: req.query
	};
	return affinityApi.buildRequest(options)
		.then(data => {
			return res.json(data)
		})
		.catch(error => {
			logger.warn('Error fetching content from affinity proxy to client', { event: 'FETCH_PROXY_ERROR', msg: error });
		});
}
