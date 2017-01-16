const cheerio = require('cheerio');

module.exports = $ => {
	const $pullquotes = $('.n-content-pullquote');

	$pullquotes.replaceWith(i => {
		let $el = cheerio($pullquotes.eq(i)).clone();
		$el.attr('aria-hidden', 'true');
		return $el;
	});

	return $;
};
