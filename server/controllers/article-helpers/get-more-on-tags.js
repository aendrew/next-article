const addTagTitlePrefix = require('./tag-title-prefix');

module.exports = function (content) {
	const moreOnTags = [];

	content.primaryThemeTag && moreOnTags.push(content.primaryThemeTag);
	content.primarySectionTag && moreOnTags.push(content.primarySectionTag);
	content.primaryBrandTag && moreOnTags.push(content.primaryBrandTag);

	if (!moreOnTags.length) {
		return;
	}

	return moreOnTags.slice(0, 2).map(tag => addTagTitlePrefix(tag));

};
