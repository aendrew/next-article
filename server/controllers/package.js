const logger = require('@financial-times/n-logger').default;

module.exports = function packageController (req, res, next, content) {
	const asyncWorkToDo = [
		Promise.resolve(true)
	];

	content.url = content.url.replace('https://www.ft.com', '');
	content.contains.forEach(item => item.url = item.url.replace('https://www.ft.com', ''));

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
