const cheerio = require('cheerio');

/**
* Cut content to a "preview" length
*
* If the user has been granted "preview" access to an article,
* then we cut the content to a sensible length.
*
* [1] currently this functionality is behind a flag while testing.
*/

/**
 * Decide where to cut content.
 * Current logic: content up to and including half of the article's paragraphs
 * (up to a max of 4).
 */
const getParaToTruncateFrom = ($) => {
	const maxNumParas = 4;
	const $paras = $('p');
	const midPoint = Math.floor($paras.length / 2);
	const cutoffPoint = midPoint > maxNumParas ? maxNumParas : midPoint;

	return $paras.eq(cutoffPoint-1);
}

const asObj = ($) => ({ bodyHTML: $.html() });

module.exports = (bodyHTML, flags) => {
	const $ = cheerio.load(bodyHTML);

	if (!flags.inArticlePreview) { return asObj($); } // [1]

	getParaToTruncateFrom($)
		.nextAll()
		.remove();

	return asObj($);
}
