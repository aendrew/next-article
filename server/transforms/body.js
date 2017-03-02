const cheerio = require('cheerio');

const relatedBoxExpander = require('./related-box-expander');
const relatedArticleToTeaser = require('./related-article-to-teaser');
const ariaHiddenMidContentInterruptions = require('./aria-hidden');
const tableOfContents = require('./table-of-contents');
const lightSignup = require('./light-sign-up');
const contentPreview = require('./content-preview');
const inlineAd = require('./inline-ad');
const extractToc = require('./extract-toc');
const extractMainImage = require('./extract-main-image');
const gcsConflicts = require('./gcs-conflicts');
const series = require('./series');

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
		.with(relatedArticleToTeaser)
		.with(relatedBoxExpander)
		.with(ariaHiddenMidContentInterruptions)
		.with(tableOfContents)
		.with(inlineAd)
		.with(lightSignup)
		.with(series);

	const resultObject = { bodyHTML: $bodyHTML.html() };

	Object.assign(resultObject, extractToc(resultObject.bodyHTML));

	// Don't extract the main image from fragment requests because that will mean
	// the mainImage disappears when you open article with a mainImage in stream.
	if (!options.fragment) {
		Object.assign(resultObject, extractMainImage(resultObject.bodyHTML));
	}

	Object.assign(resultObject, gcsConflicts(resultObject.bodyHTML));

	// "preview" access — cut article content
	if (options.previewArticle) {
		Object.assign(resultObject, contentPreview(resultObject.bodyHTML));
	}

	return resultObject;
};
