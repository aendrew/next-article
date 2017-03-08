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

	if(content.topper) {
		//TODO: change to layout only when migration is complete
		themeOrLayout = content.topper.theme || content.topper.layout;
		//TODO: change to leadImages only when migration is complete
		topperOrLeadImages = content.topper.images || content.leadImages;
	}

	if(flags.articleTopper && content.topper && themeOrLayout && themeImageRatio.hasOwnProperty(themeOrLayout)) {
		const template = themeOrLayout === 'full-bleed-offset' ? 'offset' : 'themed';
		const hasImage = themeOrLayout !== 'full-bleed-text';
		const backgroundColour = themeOrLayout === 'full-bleed-offset' ? 'pink' : (content.topper.backgroundColour || 'pink');
		const topperProperties = allProperties(themeOrLayout, template, backgroundColour, hasImage, topperOrLeadImages);
		const extraProperty = {themeImageRatio: themeImageRatio[themeOrLayout]};

		return Object.assign(topperProperties, extraProperty);

	} else if (flags.contentPackages && content.containedIn && content.containedIn.length) {
<<<<<<< HEAD
		return allProperties('full-bleed-offset', 'offset', 'slate', true, topperOrLeadImages)

=======
		return {
			theme: 'full-bleed-offset',
			template: 'offset',
			backgroundColour: 'pink', //TODO make the background work
			myFtButtonVariant: myFtButtonVariant('pink')
		};
>>>>>>> 87ab56d9c4cc547334f45fe232b1e66a61bc81b7
	} else if(content.designGenre) {
		const topperProperties = basicProperties('branded', 'basic', 'warm-1');

		return Object.assign(topperProperties, { myFtButtonVariant: 'standard' });

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
	};
}

const myFtButtonVariant = (backgroundColour) => {
	let lightBackgroundColour = ['pink', 'warm-1', 'white'].includes(backgroundColour)
	return (!backgroundColour || lightBackgroundColour) ? 'uncolored' : 'inverse';
};

module.exports = (content, flags) => {
	return Object.assign({}, content.topper, getTopperSettings(content, flags));
}
