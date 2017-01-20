const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;

module.exports = {
	content ({ uuid }) {
		const sources = {
			CAPI: `http://test.api.ft.com/enrichedcontent/${ uuid }?apiKey=${ process.env.CAPI_API_KEY }`,
			S3: `https://s3-eu-west-1.amazonaws.com/rj-xcapi-mock/${ uuid }`
		};

		logger.info({
			event: 'FETCHING_EXPERIMENTAL_CONTENT',
			uuid,
			source: process.env.EXPERIMENTAL_CONTENT_SOURCE
		});

		return fetch(sources[process.env.EXPERIMENTAL_CONTENT_SOURCE])
			.then(fetchres.json)
			.then(content => {
				const preview = `https://ft-next-es-interface-${ process.env.REGION || 'eu' }.herokuapp.com/api/preview?apiKey=${ process.env.ES_INTERFACE_API_KEY }`;
				return fetch(preview, {
					method: 'POST',
					headers: {
						'Content-type': 'application/json'
					},
					body: JSON.stringify(content)
				}).then(fetchres.json);
			})
			.catch(error => {
				logger.error({ event: 'FAILED_TO_FETCH_EXPERIMENTAL_CONTENT', error});
			});
	}
};
