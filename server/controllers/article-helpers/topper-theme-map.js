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
	content.topper = content.topper || {};

	//Articles within a package get a slate offset topper if the package has the 'extra' theme
	if (flags.contentPackages && content.containedIn && content.containedIn.length && content.package && content.package.design.theme === 'extra') {
		return allProperties('full-bleed-offset', 'offset', 'slate', ['package-extra'], true);

	//package landing pages
	} else if (flags.contentPackages && content.type === 'package' && content.design && content.design.theme) {
		const bgMap = {
			'basic': 'warm-1',
			'special-report': 'claret',
			'extra': 'slate'
		};
		const modifiers = ['package', `package-${content.design.theme}`]
		return allProperties('split-text-left', 'themed', bgMap[content.design.theme], modifiers, true);
	//otherwise use the editorially selected topper if it exists
	} else if(flags.articleTopper && content.topper && content.topper.layout && themeImageRatio.hasOwnProperty(content.topper.layout)) {
		const template = content.topper.layout === 'full-bleed-offset' ? 'offset' : 'themed';
		const hasImage = content.topper.layout !== 'full-bleed-text';
		const backgroundColour = content.topper.layout === 'full-bleed-offset' ? 'pink' : (content.topper.backgroundColour || 'pink');
		const topperProperties = allProperties(content.topper.layout, template, backgroundColour, [], hasImage);

		return Object.assign(topperProperties);

		//Branded regular toppers
	} else if(content.designGenre) {
		const modifiers = content.designGenre.headshot ? ['has-headshot'] : [];
		const topperProperties = basicProperties('branded', 'basic', 'warm-1', modifiers);
		return Object.assign(topperProperties, { myFtButtonVariant: 'standard' });

	//everything else gets a regular topper
	} else {
		return basicProperties(null, 'basic', 'pink', []);
	}
};

const allProperties = (layout, template, backgroundColour, modifiers, includesImage, images) => {
	const addOn = {
		includesImage,
		images
	}
	return Object.assign(basicProperties(layout, template, backgroundColour, modifiers), addOn)
}

const basicProperties = (layout, template, backgroundColour, modifiers) => {

	return {
		layout,
		template,
		backgroundColour,
		myFtButtonVariant: myFtButtonVariant(backgroundColour),
		themeImageRatio: themeImageRatio[layout],
		modifiers: [layout].concat(modifiers)
	};
}

const myFtButtonVariant = (backgroundColour) => {
	let lightBackgroundColour = ['pink', 'warm-1', 'white'].includes(backgroundColour)
	return (!backgroundColour || lightBackgroundColour) ? 'uncolored' : 'inverse';
};

module.exports = (content, flags) => {

	const topper = content.topper || {};
	return Object.assign({},
		topper,
		{
			images: content.leadImages,

			headline: topper.headline || content.title,
			standfirst: content.descriptionHTML || topper.standfirst || content.standfirst
		},
		getTopperSettings(content, flags));
}
