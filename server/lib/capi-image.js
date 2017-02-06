const logger = require('@financial-times/n-logger').default;

//copied from es-interface but tweaked to have smaller timeout
const fetchCapiJson = (endpoint) => {
	return fetch(endpoint, {
		timeout: 1000,
		headers: {
			'X-Api-Key': process.env.apikey,
		}
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return response.text()
				.then((text) => {
					return Promise.reject({
						error: text,
						status: response.status
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
				uuid: image.id
			}, err);
		});
	}
};
