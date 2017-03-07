const controllerArticle = require('./article');
const controllerPodcast = require('./podcast');
const controllerVideo = require('./video');

module.exports = (req, res, next) => {
	const { body: content } = req;
	switch (content.type) {
		case 'podcast':
			return controllerPodcast(req, res, next, content);
		case 'video':
			return controllerVideo(req, res, next, content);
		default:
			return controllerArticle(req, res, next, content);
	}
};
