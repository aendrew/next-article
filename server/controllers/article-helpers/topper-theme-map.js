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

const getTopperSettings = (content, flags) => {
	if(flags.articleTopper && content.topper && content.topper.theme && themeImageRatio.hasOwnProperty(content.topper.theme)) {

		const backgroundColour = content.topper.theme === 'full-bleed-offset' ? 'pink' : (content.topper.backgroundColour || 'pink');
		return {
			theme: content.topper.theme,
			template: content.topper.theme === 'full-bleed-offset' ? 'offset' : 'themed',
			themeImageRatio: themeImageRatio[content.topper.theme],
			backgroundColour,
			myFtButtonVariant: myFtButtonVariant(backgroundColour),
			includesImage: content.topper.theme !== 'full-bleed-text'
		};
	} else if (flags.contentPackages && content.containedIn && content.containedIn.length) {
		return {
			theme: 'full-bleed-offset',
			template: 'offset',
			backgroundColour: 'slate',
			myFtButtonVariant: myFtButtonVariant('slate')
		};
	} else if(content.designGenre) {
		return {
			theme: 'branded',
			template: 'basic',
			backgroundColour: 'warm-1',
			myFtButtonVariant: 'standard'
		};
	} else {
		return {
			theme: null,
			template: 'basic',
			backgroundColour: 'pink',
			myFtButtonVariant: myFtButtonVariant('pink')
		};
	}
};

const myFtButtonVariant = (backgroundColour) => {
	if(!backgroundColour || ['pink', 'warm-1', 'white'].includes(backgroundColour)) {
		return 'uncolored';
	} else {
		return 'inverse';
	}
};

module.exports = (content, flags) => {
	return Object.assign({}, content.topper, getTopperSettings(content, flags));
}
