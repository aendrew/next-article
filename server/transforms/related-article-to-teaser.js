const cheerio = require('cheerio');

const teaser = require('../../node_modules/@financial-times/n-teaser/templates/heavy.html');

module.exports = function ($) {

	const $relatedBox = $('.n-content-related-box');

	$relatedBox.replaceWith(i => {
		let $el = cheerio($relatedBox.eq(i)).clone();
		let $boxTitle = $el.find('.n-content-related-box__title-text');
		const $headline = $el.find('.n-content-related-box__headline-link');
		if($headline.length !== 1) {
			return $el;
		};
		const title = $headline.text();
		const $standfirstEl = $el.find('.n-content-related-box__content p');
		const standfirst = $standfirstEl.length ? $standfirstEl.text() : null;
		const relativeUrl = $headline.attr('href');

		const $imageEl = $el.find('.n-content-related-box__image-link img');
		let imageUrl;
		if($imageEl.length && $imageEl.attr('srcset')) {
			imageUrl = $imageEl.attr('srcset').split(' ')[0];
		} else if ($imageEl.length && $imageEl.attr('src')) {
			imageUrl = $imageEl.attr('src');
		}
		const teaserHTML = teaser({
			title,
			standfirst,
			relativeUrl,
			mods: ['large-portrait'],
			mainImage: imageUrl ? {
				url: imageUrl
			} : null,
			colspan: '{"default": 12, "L": 4}',
			position: '{"default": "bottom"}',
			widths: '[500, 332]'
		});

		$el.addClass('n-content-related-box--no-border');
		$el.attr('aria-hidden', 'true');
		let boxTitle = $boxTitle.length > 0 ? $boxTitle.text() : 'Related article';

		$el.html(`<h2 class="standalone-teaser-heading">${boxTitle}</h2>${teaserHTML}`);
		return $el;

	});

	return $
}
