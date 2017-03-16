const podcastHandler = require('./podcast');
const videoHandler = require('./video');
const articleHandler = require('./article');
const packageHandler = require('./package');

exports.getHandler = function (type) {
	switch (type) {
		case 'podcast':
			return podcastHandler;
		case 'video':
			return videoHandler;
		case 'package':
			return packageHandler;
		default:
			return articleHandler;
	}
}
