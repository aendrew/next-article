'use strict';
const affinityApi = require('ft-next-affinity-client');

/**
* Public-facing endpoint to proxy client-side requests via the server to the affinity client
* See affinity-client for params
**/
module.exports = (req, res, next) => {
	const sessionToken = req.get('ft-session-token') || req.cookies.FTSession;
	const options = {
		params: req.params,
		query: req.query,
		session: sessionToken
	};

	return affinityApi.buildRequest(options)
		.then(data => res.json(data))
		.catch(next);
}
