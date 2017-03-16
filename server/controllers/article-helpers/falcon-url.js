const shellpromise = require('shellpromise');

function getFalconPage (id) {
	return shellpromise(`curl -s http://www.ft.com/cms/s/${id}.html -H 'FT-Site: falcon' -I | grep -i location || echo`, { verbose: true })
}

module.exports = function (id) {
	if (!id) return Promise.resolve(undefined);
	return getFalconPage(id).then(response => {
		const webUrl = response.replace(/^Location:/i, '').trim();
		if (/^http:\/\/www\.ft\.com\//.test(webUrl)) {
			return `${webUrl}${webUrl.includes('?') ? '&' : '?'}ft_site=falcon&desktop=true`
		}
	});
};
