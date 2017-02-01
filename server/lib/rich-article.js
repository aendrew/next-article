'use strict';

const capiImage = require('./capi-image');

module.exports = (article) => {
	const model = {};
	if(!article) {
		return model;
	}

	if(article.topper && article.topper.theme && article.topper.theme !== '') {
		model.topper = article.topper;
		model.topper.standfirst = article.topper.standfirst || article.standfirst;
		model.topper.headline = article.topper.headline || article.title;
	}

	if(model.topper.images) {
		return Promise.all(model.topper.images.map(image => capiImage(image)))
		.then(images => {
			model.topper.images = images;
			return model;
		});
	} else {
		return model;
	}
}
