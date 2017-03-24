const decorateArticle = require('./article');
const getPackageBrand = require('../controllers/article-helpers/get-package-brand');

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

	return '';
}

module.exports = function decoratePackage (req, res, payload, flags) {
	return decorateArticle(req, res, payload, flags).then(content => {

		// Render a normal article page
		if (!flags.contentPackages || content.degradePackagePage) {
			return content;
		}

		// FIXME: contentType is used for both templating stuff and messages
		// 				to the user so doesn't work so well for packages
		content.contentType = 'article';

		// some content-patch hacks may not have tableOfContents at the moment
		// so let's ensure it's missing
		if (!content.tableOfContents) {
			content.tableOfContents = {
				sequence: 'none',
				labelType: 'none',
				displayIntroduction: !!content.bodyHTML
			};
		}

		// In ElasticSearch it's currently possible for
		// package.contains to be undefined, so let's smooth over that
		if (!Array.isArray(content.contains)) {
			content.contains = [];
		}

		content.contains.forEach((item, index) => {
			item.packageIndex = index;
			item.label = getLabel(content.tableOfContents.labelType, index, item.label);
		});

		content.isIntroArticle = content.tableOfContents.displayIntroduction || !!content.bodyHTML;

		const numChildren = content.contains.length;
		let minBigTeasers = 4;
		let maxBigTeasers = 6;

		if (content.isIntroArticle) {
			content.template = 'package-intro';
			minBigTeasers = maxBigTeasers = Infinity;
		} else {
			content.template = 'package-index';
		}

		content.helpers = content.helpers || {};
		content.helpers.gt = (a, b) => a > b;
<<<<<<< HEAD
=======

		const inverseTheme = content.design.theme === 'extra' || content.design.theme === 'extra-wide';
>>>>>>> 99af18f... Lint

		content.helpers.bigTeasers = function (options) {
			const items = numChildren > maxBigTeasers ? content.contains.slice(0, minBigTeasers) : content.contains;
			let title;
			switch (content.design.theme) {
				case 'special-report':
					title = 'Explore the report';
					break;
				case 'extra':
					title = 'Explore the series';
					break;
			}
			if (items.length) {
				return options.fn({
					title,
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
					case 'extra':
						title = 'Explore the series';
						break;
				}
				return options.fn({
					title,
					items: numChildren > maxBigTeasers ? content.contains.slice(minBigTeasers) : []
				});
			}
			return options.inverse(this);
		}

		content.packageBrand = getPackageBrand(content.metadata);

		return content;
	});
};
