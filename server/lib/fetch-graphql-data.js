const fetchres = require('fetchres');

module.exports = (query, variables = {}) => {
	return fetch(`https://next-api.ft.com/v1/query?query=${query}&variables=${JSON.stringify(variables)}&source=next-article`, {
			method: 'GET',
			headers: {
				'X-Api-Key': process.env.NEXT_API_KEY
			},
			timeout: 3000
		})
		.then(fetchres.json)
		.then(({ data = {} } = {}) => data);
}
