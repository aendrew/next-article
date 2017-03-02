const cheerio = require('cheerio');

/**
* Cut content to a "preview" length
*
* If the user has been granted "preview" access to an article,
* then we cut the content to a sensible length.
*/

/**
 * Decide where to cut content.
 * Current logic: content up to and including half of the article's paragraphs
 * (up to the declared maximum).
 */
const getParaToTruncateFrom = ($) => {
	const maxNumParas = 2;
	const $paras = $('p');
	const contentMidPoint = Math.floor($paras.length / 2);
	const cutoffPoint = Math.min(contentMidPoint, maxNumParas);

	return $paras.eq(cutoffPoint-1);
}

const asObj = ($) => ({ bodyHTML: $.html() });

module.exports = (bodyHTML) => {
	const $ = cheerio.load(bodyHTML);

	getParaToTruncateFrom($)
		.nextAll()
		.remove();

	return asObj($);
}
