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
		return fetchCapiJson(image.id)
		.then((imageSet) => {
			//For topper at least we want all the images in the imageset
			return Promise.all(imageSet.members.map(image => fetchCapiJson(image.id)));
		})
		.then((images) => images.map(image => ({
			title: image.title,
			description: image.description,
			url: image.binaryUrl,
			width: image.pixelWidth,
			height: image.pixelHeight,
			ratio: image.pixelWidth && image.pixelHeight ? image.pixelWidth / image.pixelHeight : null
		})))
		.catch((err) => {
			logger.error({
				event: 'MAIN_IMAGE_FETCH_FAIL',
				error: err.toString(),
				uuid: image
			});
		});
	}
};
