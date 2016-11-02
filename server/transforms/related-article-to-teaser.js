const cheerio = require('cheerio');

const teaser = require('../../bower_components/n-teaser/templates/heavy.html');

module.exports = function ($, flags) {

	if(!flags.nTeaserArticle) {
		return $;
	};

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
		const summary = $standfirstEl.length ? $standfirstEl.text() : null;
		const url = $headline.attr('href');

		const $imageEl = $el.find('.n-content-related-box__image-link img');
		let imageUrl;
		if($imageEl.length && $imageEl.attr('srcset')) {
			imageUrl = $imageEl.attr('srcset').split(' ')[0];
		} else if ($imageEl.length && $imageEl.attr('src')) {
			imageUrl = $imageEl.attr('src');
		}
		const teaserHTML = teaser({
			title,
			summary,
			url,
			size: 'large',
			image: {
				url: imageUrl
			},
			colspan: '{"default": 12, "L": 4}',
			position: '{"default": "bottom"}',
			widths: '[500, 332]'
		});

		$el.addClass('n-content-related-box--no-border');
		let boxTitle = $boxTitle.length > 0 ? $boxTitle.text() : 'Related article';

		$el.html(`<h2 class="standalone-teaser-heading">${boxTitle}</h2>${teaserHTML}`);
		return $el;

	});

	return $
}
