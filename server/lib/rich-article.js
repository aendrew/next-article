'use strict';

const capiImage = require('./capi-image');

module.exports = (article) => {
	const model = {};
	if(!article) {
		return model;
	}
	model.topper = article.topper;
	if(article.topper && article.topper.image) {
		return capiImage(article.topper.image).then(image => {
			model.topper.image = image;
		}).then(() => model);
	} else {
		return model;
	}
}
