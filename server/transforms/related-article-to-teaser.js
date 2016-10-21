const cheerio = require('cheerio');

const expanderWordImage = 55;
const expanderWordNoImage = 100;
const expanderParaBreak = 3;
const expanderButton = '<button class="o-expander__toggle o--if-js" data-trackable="expander-toggle"></button>';

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const template = fs.readFileSync(path.resolve(`bower_components/n-teaser/templates/heavy.html`), {encoding:'utf8'});
const teaser = Handlebars.compile(template);

module.exports = function ($, flags) {
	
	if(!flags.nTeaserArticle) {
		return $;
	};

	const $relatedBox = $('.n-content-related-box');

	$relatedBox.replaceWith(i => {
		let $el = cheerio($relatedBox.eq(i)).clone();
		let $boxTitle = $el.find('.n-content-related-box__title');
		const $headline = $el.find('.n-content-related-box__headline-link');
		if($headline.length !== 1) {
			return $el;
		};
		const title = $headline.text();
		const $standfirstEl = $el.find('.n-content-related-box__content p');
		const summary = $standfirstEl.length ? $standfirstEl.text() : null;
		const url = $headline.find('.n-content-related-box__headline-link').attr('href');

		const $imageEl = $el.find('.n-content-related-box__image-link img');
		const imageUrl = $imageEl.length ? $imageEl.attr('srcset').split(' ')[0] : null;
		const teaserHTML = teaser({
			title, 
			summary,
			image: {
				url: imageUrl
			}
		});

		$el.html($.html($boxTitle) + teaserHTML);	
		return $el;

	});

	return $
}
