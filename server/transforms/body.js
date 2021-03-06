const cheerio = require('cheerio');

const stripPackagePromoTOCs = require('./strip-package-promo-TOCs');
const relatedBoxExpander = require('./related-box-expander');
const relatedArticleToTeaser = require('./related-article-to-teaser');
const ariaHiddenMidContentInterruptions = require('./aria-hidden');
const lightSignup = require('./light-sign-up');
const inlineAd = require('./inline-ad');
const extractMainImage = require('./extract-main-image');
const gcsConflicts = require('./gcs-conflicts');

function transform ($, flags, options) {
	const proto = {
		'with': function (transform) {
			transform($, flags, options);
			return this;
		}
	};

	return proto;
}

module.exports = function (body, flags, options) {

	const $bodyHTML = cheerio.load(body, { decodeEntities: false });
	transform($bodyHTML, flags, options)
		//while AB testing packages, we want to remove the editorially placed promos with
		// a table of contents, as the TOCs will be represented in the package Nav
		.with(stripPackagePromoTOCs)
		.with(relatedArticleToTeaser)
		.with(relatedBoxExpander)
		.with(ariaHiddenMidContentInterruptions)
		.with(inlineAd)
		.with(lightSignup);

	const resultObject = { bodyHTML: $bodyHTML.html() };

	// Don't extract the main image from fragment requests because that will mean
	// the mainImage disappears when you open article with a mainImage in stream.
	if (!options.fragment) {
		Object.assign(resultObject, extractMainImage(resultObject.bodyHTML));
	}

	Object.assign(resultObject, gcsConflicts(resultObject.bodyHTML));

	return resultObject;
};
