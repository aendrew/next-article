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
	//TODO: change to layout only when migration is complete
	const themeOrLayout = content.topper.theme || content.topper.layout;
	//TODO: change to leadImages only when migration is complete
	const topperOrLeadImages = content.topper.images || content.leadImages;
	const imageProperties = (includesImage) => {
		return {
			includesImage,
			images: topperOrLeadImages
		}
	};

	let basicProperties;
	let extraProperties;

	if(flags.articleTopper && content.topper && themeOrLayout && themeImageRatio.hasOwnProperty(themeOrLayout)) {
		const template = themeOrLayout === 'full-bleed-offset' ? 'offset' : 'themed';
		const backgroundColour = themeOrLayout === 'full-bleed-offset' ? 'pink' : (content.topper.backgroundColour || 'pink');
		basicProperties = topperProperties(themeOrLayout, template, backgroundColour);
		extraProperties = Object.assign(imageProperties(themeOrLayout !== 'full-bleed-text'), {themeImageRatio: themeImageRatio[themeOrLayout]});

		return Object.assign(basicProperties, extraProperties);

	} else if (flags.contentPackages && content.containedIn && content.containedIn.length) {
		basicProperties = topperProperties('full-bleed-offset', 'offset', 'slate');
		extraProperties = imageProperties(true);

		return Object.assign(basicProperties, extraProperties);

	} else if(content.designGenre) {
		basicProperties = topperProperties('branded', 'basic', 'warm-1');

		return Object.assign(basicProperties, { myFtButtonVariant: 'standard' });

	} else {
		return topperProperties(null, 'basic', 'pink');
	}
};

const topperProperties = (layout, template, backgroundColour) => {
	return {
		layout,
		template,
		backgroundColour,
		myFtButtonVariant: myFtButtonVariant(backgroundColour),
	};
}

const myFtButtonVariant = (backgroundColour) => {
	let lightBackgroundColour = ['pink', 'warm-1', 'white'].includes(backgroundColour)
	return (!backgroundColour || lightBackgroundColour) ? 'uncolored' : 'inverse';
};

module.exports = (content, flags) => {
	return Object.assign({}, content.topper, getTopperSettings(content, flags));
}
