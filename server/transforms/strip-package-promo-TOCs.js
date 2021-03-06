const cheerio = require('cheerio');

module.exports = function ($, flags, options) {

	if (!flags || !flags.contentPackages || !options || options.fragment || !options.contentPackage || !options.contentPackage.contents) return $;

	const $relatedBox = $('.n-content-related-box');

	$relatedBox.replaceWith(i => {
		let $el = cheerio($relatedBox.eq(i)).clone();

		const $links = $el.find('.n-content-related-box__content a, .n-content-related-box__headline a');

		if($links.length < 1) {
			return $el;
		} else {
			return '';
		}
	});

	return $
}
