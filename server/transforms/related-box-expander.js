const cheerio = require('cheerio');

const expanderWordImage = 55;
const expanderWordNoImage = 100;
const expanderParaBreak = 3;
const expanderButton = '<button class="o-expander__toggle o--if-js" data-trackable="expander-toggle"></button>';

module.exports = function ($) {

	const $relatedBox = $('.n-content-related-box');

	$relatedBox.replaceWith(i => {
		let $el = cheerio($relatedBox.eq(i)).clone();

		const contentEl = $el.find('.n-content-related-box__content');
		const contentParasEl = $el.find('.n-content-related-box__content p');

		const wordCount = contentEl.text().split(' ').length + 1;
		const contentParas = contentParasEl.length;

		const $img = $el.find('img');
		const hasImage = $img.length;
		if (hasImage) {
			$img
				.attr('alt','')
				.attr('role','presentation')
				// lazy load the image
				.addClass('n-image--lazy-loading')
				// and the wrapper
				.parent('.n-image-wrapper')
					.addClass('n-image-wrapper--lazy-loading');
			['src', 'srcset'].forEach(attr => {
				const attrValue = $img.attr(attr);
				if (attrValue) {
					$img.attr(`data-${attr}`, attrValue)
						.removeAttr(attr);
				}
			});
		}

		if ((contentParas > expanderParaBreak &&
			((hasImage && wordCount > expanderWordImage) ||
			(!hasImage && wordCount > expanderWordNoImage)))) {
				const expanderContentClass = 'n-content-related-box__content--extension';
				contentEl.addClass('o-expander__content');
				$el.attr({
					'data-o-component': 'o-expander',
					'data-o-expander-shrink-to': '0',
					'data-o-expander-count-selector': `.${expanderContentClass}`
				});
				contentParasEl.eq(expanderParaBreak).before(`<div class="${expanderContentClass}"></div>`);
				$el.find(`.${expanderContentClass}`).append(contentParasEl.slice(expanderParaBreak));
				contentEl.after(expanderButton);
		}

		return $el;

	});

	return $
}
