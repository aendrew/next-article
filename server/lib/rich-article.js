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

	if(model.topper && model.topper.image) {
		return capiImage(model.topper.image).then(image => {
			model.topper.image = image;
		}).then(() => model);
	} else {
		return model;
	}
}
