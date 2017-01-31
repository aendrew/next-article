const cheerio = require('cheerio');

/**
* Cut content to a "teaser" length
*
* If the user has been granted "teaser" access to an article,
* then we cut the content to a sensible length.
*
* [1] currently this functionality is behind a flag while testing.
*/

const isChildOf = (selector, $el) => $el.parents(selector).length !== 0;

/**
 * Cut content after the provided cut off index, exclude special cases.
 * TODO: improve logic to ensure we do not cut anything important
 *
 * e.g keep figures: el.tagName === 'figure' || isChildOf('figure', $el)
 */
const elementsToCut = (i, el, $el, cutIdx) => {

	const whiteListed = (
		$el.hasClass('o-ads') ||
		isChildOf('.o-ads', $el)
	);

	// content is not whitelisted and after cut off index
	return !whiteListed && i > cutIdx;
}

/**
 * Decide where to cut content.
 * Current logic: content up to an including half of the article's paragraphs
 * (up to a max of 4). This should hopefully preserve figures etc whilst
 * catering for shorter articles
 */
const getCutOffIdx = ($, $contents, breakdown) => {
	const half = Math.floor(breakdown['p'] / 2) - 1;
	const idx = half > 3 ? 3 : half; // 4 paragraphs (0 index)
	const $lastP = $('p').eq(idx);
	return $contents.index($lastP);
}

/**
 * @returns {Obj} example:
 * { p: 16, a: 6, div: 5, figure: 3, img: 3, figcaption: 3 }
 */
const tagNameCount = ($) => {
	const tags = {};
	$.each((i, el) => tags[el.tagName] = (tags[el.tagName] || 0) + 1);
	return tags;
}

const asObj = ($) => ({ bodyHTML: $.html() });

module.exports = function (bodyHTML, flags) {
	const $ = cheerio.load(bodyHTML);

	if (!flags.inArticleTeaser) return asObj($); // [1]

	const $contents = $('*');
	const breakdown = tagNameCount($contents);

	const cutIdx = getCutOffIdx($, $contents, breakdown);

	$contents
		.filter(function (i, el) { // NOTE: preserve this scope
			return elementsToCut(i, el, $(this), cutIdx)
		})
		.remove();

	return asObj($);
}
