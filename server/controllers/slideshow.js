module.exports = function (req, res, next) {
	const err = new Error();

	res.locals.stylesheets = { inline: [], lazy: [], blocking: [] };
	// E.g. 4eb77dd4-9b35-11e4-be20-002128161462
	return fetch(`https://api.ft.com/content/items/v1/${req.params.id}?apiKey=${process.env.apikey}`)
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				err.status = response.status;
				err.message = response.statusText;
				throw err;
			}
		})
		.then(data => {
			if (data
				&& data.item
				&& data.item.assets
				&& data.item.assets[0]
				&& data.item.assets[0].type === 'slideshow') {
				res.render('slideshow', {
					title: data.item.assets[0].fields.title,
					syncid: req.query.syncid,
					slides: data.item.assets[0].fields.slides
				});
			} else {
				err.status = 404;
				throw err;
			}
		})
		.catch(err => {
			if (err.status === 404) {
				res.status(404).end();
			} else {
				next(err);
			}
		});
};
