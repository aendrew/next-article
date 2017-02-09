'use strict';

module.exports = (topper) => {
	if(topper && topper.theme && themeImageRatio[topper.theme]) {
		return Object.assign({
			themeImageRatio: themeImageRatio[topper.theme]
		}, topper);
	} else {
		return null;
	};
}
