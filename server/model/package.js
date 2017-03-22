const decorateArticle = require('./article');

function getLabel (labelType, itemIndex, label) {

	if (!labelType || labelType === 'none') return '';

	if (Number.isInteger(itemIndex)) {
		if (labelType === 'part-number') {
			return `Part ${itemIndex + 1}`;
		} else if (labelType === 'chapter-number') {
			return `Chapter ${itemIndex + 1}`;
		}
	}

	if (labelType === 'custom' && label) {
		return label;
	}

	return ''
}

module.exports = function decoratePackage (req, res, payload, flags) {
	return decorateArticle(req, res, payload, flags).then(content => {

		if (!flags.contentPackages) {
			return content;
		}

		content.contentType = 'article';

		if (!content.tableOfContents) {
			content.tableOfContents = {
				sequence: 'none',
				labelType: 'none',
				displayIntroduction: !!content.bodyHTML
			};
		}

		if (!content.tableOfContents.displayIntroduction) {
			content.template = 'content-package';
		}

		content.contains.forEach((item, index) => {
			item.packageIndex = index;
			item.label = getLabel(content.tableOfContents.labelType, index, item.label);
		});

		const numChildren = content.contains.length;
		const minBigTeasers = 4;
		const maxBigTeasers = 6;

		content.helpers = content.helpers || {};
		content.helpers.gt = (a, b) => a > b;

		content.helpers.bigTeasers = function (options) {
			const items = numChildren > maxBigTeasers ? content.contains.slice(0, minBigTeasers) : content.contains;
			if (items.length) {
				return options.fn({
					title: null,
					items
				});
			}
			return options.inverse(this);
		}

		content.helpers.littleTeasers = function (options) {
			if (numChildren > maxBigTeasers) {
				let title;
				switch (content.design.theme) {
					case 'special-report':
						title = 'More from this Special Report';
						break;
					case 'special-report':
						title = 'More in this Series';
						break;
				}
				return options.fn({
					title,
					items: numChildren > maxBigTeasers ? content.contains.slice(minBigTeasers) : []
				});
			}
			return options.inverse(this);
		}

		return content;
	});
};
