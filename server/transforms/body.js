const cheerio = require('cheerio');

const relatedBoxExpander = require('./related-box-expander');
const tableOfContents = require('./table-of-contents');
const lightSignup = require('./light-sign-up');
const inlineAd = require('./inline-ad');
const extractToc = require('./extract-toc');
const extractMainImage = require('./extract-main-image');
const gcsConflicts = require('./gcs-conflicts');
const tourTip = require('./tour-tip');

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
		.with(relatedBoxExpander)
		.with(tableOfContents)
		.with(inlineAd)
		.with(lightSignup)
		.with(tourTip);

	const resultObject = { bodyHTML: $bodyHTML.html() };

	Object.assign(resultObject, extractToc(resultObject.bodyHTML));

	// Don't extract the main image from fragment requests because that will mean
	// the mainImage disappears when you open article with a mainImage in stream.
	if (!options.fragment) {
		Object.assign(resultObject, extractMainImage(resultObject.bodyHTML));
	}

	Object.assign(resultObject, gcsConflicts(resultObject.bodyHTML));

	return resultObject;
};
