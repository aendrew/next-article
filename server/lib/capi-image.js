const logger = require('@financial-times/n-logger').default;

//copied from es-interface but tweaked to have smaller timeout
const fetchCapiJson = (endpoint) => {
	return fetch(endpoint, {
		timeout: 1000,
		headers: {
			'X-Api-Key': process.env.API_KEY,
		}
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return response.text()
				.then((text) => {
					const requestId = response.headers.get('x-request-id') || 'UNKNOWN';
					const server = response.headers.get('server') || 'UNKNOWN';
					const masheryMessageId = response.headers.get('x-mashery-message-id') || 'UNKNOWN';
					return Promise.reject({
						error: text,
						status: response.status,
						requestId: requestId,
						server: server,
						masheryMessageId: masheryMessageId
					});
				});
		});
};


module.exports = function (image) {
	if (image && image.id) {
		let crop = image.type;
		return fetchCapiJson(image.id)
		.then((result) => {
			return {
				type: crop,
				title: result.title,
				copyright: result.copyright ? result.copyright.notice : '',
				url: result.binaryUrl,
				width: result.pixelWidth,
				height: result.pixelHeight,
				ratio: result.pixelWidth && result.pixelHeight ? result.pixelWidth / result.pixelHeight : null
			}
		})
		.catch((err) => {
			logger.error({
				event: 'TOPPER_IMAGE_FETCH_FAIL',
				error: err.toString(),
				uuid: image
			});
		});
	}
};
