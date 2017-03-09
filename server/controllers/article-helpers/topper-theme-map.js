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
	let themeOrLayout;
	let topperOrLeadImages;

	content.topper = content.topper || {};

	//TODO: change to layout only when migration is complete
	themeOrLayout = content.topper.layout || content.topper.theme;
	//TODO: change to leadImages only when migration is complete
	topperOrLeadImages = content.leadImages || content.topper.images;
	
	//Articles within a package get a slate offset topper if the package has the 'extra' theme
	if (flags.contentPackages && content.containedIn && content.containedIn.length) {
		return allProperties('full-bleed-offset', 'offset', 'slate', true, topperOrLeadImages);
	//otherwise use the editorially selected topper if it exists
	} else if (flags.contentPackages && content.type === 'package' && content.design && content.design.theme === 'extra') {
		return allProperties('split-text-left', 'themed', 'slate', true, topperOrLeadImages);
	} else if (flags.contentPackages && content.type === 'package' && content.package.design && content.package.design.theme === 'special-report') {
		return allProperties('split-text-left', 'themed', 'claret', true, topperOrLeadImages);
	} else if(flags.articleTopper && content.topper && themeOrLayout && themeImageRatio.hasOwnProperty(themeOrLayout)) {
		const template = themeOrLayout === 'full-bleed-offset' ? 'offset' : 'themed';
		const hasImage = themeOrLayout !== 'full-bleed-text';
		const backgroundColour = themeOrLayout === 'full-bleed-offset' ? 'pink' : (content.topper.backgroundColour || 'pink');
		const topperProperties = allProperties(themeOrLayout, template, backgroundColour, hasImage, topperOrLeadImages);

		return Object.assign(topperProperties);

		//Branded regular toppers
	} else if(content.designGenre) {
		const topperProperties = basicProperties('branded', 'basic', 'warm-1');
		return Object.assign(topperProperties, { myFtButtonVariant: 'standard' });

	//everything else gets a regular topper
	} else {
		return basicProperties(null, 'basic', 'pink');
	}
};

const allProperties = (layout, template, backgroundColour, includesImage, images) => {
	const addOn = {
		includesImage,
		images
	}
	return Object.assign(basicProperties(layout, template, backgroundColour), addOn)
}

const basicProperties = (layout, template, backgroundColour) => {
	return {
		layout,
		template,
		backgroundColour,
		myFtButtonVariant: myFtButtonVariant(backgroundColour),
		themeImageRatio: themeImageRatio[layout]
	};
}

const myFtButtonVariant = (backgroundColour) => {
	let lightBackgroundColour = ['pink', 'warm-1', 'white'].includes(backgroundColour)
	return (!backgroundColour || lightBackgroundColour) ? 'uncolored' : 'inverse';
};

module.exports = (content, flags) => {
	return Object.assign({}, content.topper, getTopperSettings(content, flags));
}
