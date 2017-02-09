'use strict';

const capiImage = require('./capi-image');

module.exports = (article) => {
	const model = {};
	if(!article) {
		return model;
	}

	const themeImageRatio = {
		'split-text-center': 'split',
		'split-text-left': 'split',
		'split-text-right': 'split',
		'full-bleed-image-center': 'full-bleed',
		'full-bleed-image-left': 'full-bleed',
		'full-bleed-image-right': 'full-bleed',
		'full-bleed-offset': 'full-bleed',
		'full-bleed-text': null
	};

	if(article.package) {
		model.package = article.package;
	}

	if(article.topper && article.topper.theme && themeImageRatio[article.topper.theme]) {
		model.topper = article.topper;
		model.topper.standfirst = article.topper.standfirst || article.standfirst;
		model.topper.headline = article.topper.headline || article.title;
		model.topper.themeImageRatio = themeImageRatio[article.topper.theme];
	}

	if(model.topper && model.topper.images) {
		return Promise.all(model.topper.images.map(image => capiImage(image)))
		.then(images => {
			model.topper.images = images;
			return model;
		});
	} else {
		return model;
	}

}
