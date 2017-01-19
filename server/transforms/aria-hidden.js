const cheerio = require('cheerio');

module.exports = $ => {
	const $midContentConfusions = $('.n-content-pullquote, .n-content-related-box');

	$midContentConfusions.replaceWith(i => {
		let $el = cheerio($midContentConfusions.eq(i)).clone();
		$el.attr('aria-hidden', 'true');
		return $el;
	});

	return $;
};
