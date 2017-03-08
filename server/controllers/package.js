const logger = require('@financial-times/n-logger').default;
const topperThemeMap = require('./article-helpers/topper-theme-map');

module.exports = function packageController (req, res, next, content) {
	const asyncWorkToDo = [
		Promise.resolve(true)
	];

	if (!content.topper) {
		content.topper = {
			standfirst: content.standfirst,
			headline: content.title,
			theme: 'split-text-left',
			bgColor: 'slate'
		};
	}


	content.url = content.webUrl.replace('https://www.ft.com', '');

	content.topper = topperThemeMap(content, res.locals.flags);

	content.isSpecialReport = !!content.metadata.find(tag => tag.prefLabel === 'Special Report');

	return Promise.all(asyncWorkToDo)
		.then(() => {
			content.contentType = 'article';
			content.layout = 'wrapper';
			content.viewStyle = 'compact';
			res.render('content-package', content);
		})
		.catch(error => {
			logger.error(error);
			next(error);
		});
};
