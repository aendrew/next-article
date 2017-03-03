'use strict';

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

module.exports = (topper) => {
	if(topper && topper.theme && themeImageRatio.hasOwnProperty(topper.theme)) {

		if(topper.theme === 'full-bleed-offset') {
			topper.backgroundColour = 'pink';
		}

		return Object.assign({
			themeImageRatio: themeImageRatio[topper.theme],
			backgroundColour: 'pink' //default to pink bg
		}, topper);
	} else {
		return null;
	};
}
