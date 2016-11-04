module.exports = function () {
	const articleBody = document.querySelector('[data-legal-copy]');

	articleBody.addEventListener('copy', (e) => {
		e.clipboardData.setData('text/plain', 'naughty');
		e.preventDefault();
	});
}
