const cheerio = require('cheerio');

module.exports = function (bodyHTML) {

	const $ = cheerio.load(bodyHTML);

	// find image or slideshow in the body
	const $firstMainImage = $('figure.n-content-image--full, figure.n-content-image--center, ft-slideshow').eq(0);
	let mainImageHTML;

	$firstMainImage.attr('alt', '');
	$firstMainImage.attr('role', 'presentation');

	// check that it is the first element in the body
	if (
		$firstMainImage.length &&
		$firstMainImage.prev().length === 0 &&
		(!$firstMainImage.parent() || $firstMainImage.parent().prev().length === 0) &&
		$firstMainImage.next().length > 0
	) {
		mainImageHTML = $.html($firstMainImage.remove());
	}

	return {
		mainImageHTML,
		bodyHTML: $.html()
	}
};
