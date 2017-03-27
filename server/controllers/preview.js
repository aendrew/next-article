const model = require('../model');
const chooseStylesheets = require('../lib/choose-stylesheets');

module.exports = (req, res) => {
	const { body: content } = req;

	function render (data) {
		if (req.query.fragment) {
			res.render('fragment', data);
		} else {
			data.layout = 'wrapper';
			data.viewStyle = 'compact';
			res.locals.stylesheets = chooseStylesheets(data);
			res.render(data.template || 'content', data);
		}
	}

	const typeHandler = model.getHandler(content.type);
	return typeHandler(req, res, content, res.locals.flags || {}).then(render);
};
