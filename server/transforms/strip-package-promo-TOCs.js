const cheerio = require('cheerio');

const teaser = require('../../node_modules/@financial-times/n-teaser/templates/heavy.html');

module.exports = function ($, flags, options) {

	if (!flags || !flags.contentPackages || !options || options.fragment || !options.contentPackage || !options.contentPackage.contents) return $;

	const $relatedBox = $('.n-content-related-box');

	$relatedBox.replaceWith(i => {
		let $el = cheerio($relatedBox.eq(i)).clone();

		const $links = $el.find('a');
		if($links.length < 2) {
			return $el;
		} else {
			return '';
		}
	});

	return $
}
