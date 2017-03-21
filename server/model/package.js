const decorateArticle = require('./article');

module.exports = function decoratePackage (req, res, payload, flags) {
	return decorateArticle(req, res, payload, flags).then(content => {

		if (!flags.contentPackages) {
			return content;
		}

		content.contentType = 'article';

		if (!content.displayIntroduction) {
			content.template = 'content-package';
		}

		const numChildren = content.contains.length;
		const minBigTeasers = 4;
		const maxBigTeasers = 6;
		const labelType = content.tableOfContents && content.tableOfContents.labelType;

		content.helpers = content.helpers || {};
		content.helpers.gt = (a, b) => a > b;
		content.helpers.needsSequenceId = () => !!labelType;

		content.helpers.itemLabel = value => {
			switch (labelType === 'part-number') {
				case 'part-number':
					return `Part ${value + 1}`;
				case 'chapter-number':
					return `Chapter ${value + 1}`;
				default:
					return '';
			}
		}

		content.helpers.bigTeasers = function (options) {
			const items = numChildren <= maxBigTeasers ? content.contains : content.contains.slice(0, minBigTeasers);
			if (numChildren > maxBigTeasers) {
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
						title = 'More from this special report';
						break;
					case 'special-report':
						title = 'More in this Series';
						break;
				}
				return options.fn({
					title,
					items: numChildren <= maxBigTeasers ? [] : content.contains.slice(minBigTeasers)
				});
			}
			return options.inverse(this);
		}

		return content;
	});
};
