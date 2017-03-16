const model = require('../model');

module.exports = (req, res) => {
	const { body: content } = req;

	function render (data) {
		if (req.query.fragment) {
			res.render('fragment', data);
		} else {
			content.layout = 'wrapper';
			content.viewStyle = 'compact';
			res.render(data.template || 'content', data);
		}
	}

	const typeHandler = model.getHandler(content.type);
	return typeHandler(req, res, content, res.locals.flags || {}).then(render);
};
