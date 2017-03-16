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

		return content;
	});
};
