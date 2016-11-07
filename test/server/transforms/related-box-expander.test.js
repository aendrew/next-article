const cheerio = require('cheerio');
const relatedBoxExpanderTransform = require('../../../server/transforms/related-box-expander');
require('chai').should();

describe('Related Box Expander Transform', () => {

	context('An expander should be added when the related box has', () => {

		it('more than 3 paras no image and over 100 words', () => {
			const $ = cheerio.load(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content">' +
				'<p><strong>Breakthrough:</strong> “Closing our first seed round in 10 days three times oversubscribed gave us momentum [to carry through] to the execution of our strategy and into the IPO.”</p>' +
				'<p><strong>Best mentor:</strong> “Chris Baohm, my boss at Gresham Partners in Australia . . . made me understand the importance of breaking down complex situations into the core commercial objectives.”</p>' +
				'<p><strong>Biggest mistake:</strong> “It became very clear that we needed a strong team with us who we could trust to navigate the huge due diligence tasks we had in several countries, in a different language.”</p>' +
				'<p><strong>Networking:</strong> “Wherever possible, and especially in Latin America, meet in person. Regardless of how good tech is, a face-to-face meeting is irreplaceable.”</p>' +
				'</div>' +
				'</aside>',
				{ decodeEntities: false }
			);
			const transformed$ = relatedBoxExpanderTransform($);
			transformed$.html().should.equal(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary" data-o-component="o-expander" data-o-expander-shrink-to="0" data-o-expander-count-selector=".n-content-related-box__content--extension">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content o-expander__content">' +
				'<p><strong>Breakthrough:</strong> “Closing our first seed round in 10 days three times oversubscribed gave us momentum [to carry through] to the execution of our strategy and into the IPO.”</p>' +
				'<p><strong>Best mentor:</strong> “Chris Baohm, my boss at Gresham Partners in Australia . . . made me understand the importance of breaking down complex situations into the core commercial objectives.”</p>' +
				'<p><strong>Biggest mistake:</strong> “It became very clear that we needed a strong team with us who we could trust to navigate the huge due diligence tasks we had in several countries, in a different language.”</p>' +
				'<div class="n-content-related-box__content--extension">' +
				'<p><strong>Networking:</strong> “Wherever possible, and especially in Latin America, meet in person. Regardless of how good tech is, a face-to-face meeting is irreplaceable.”</p>' +
				'</div>' +
				'</div>' +
				'<button class="o-expander__toggle o--if-js" data-trackable="expander-toggle"></button>' +
				'</aside>'
			);
		});

		it('more than 3 paras an image and over 55 words', () => {
			const $ = cheerio.load(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<img alt="" class="n-image" src="https://next-geebee.ft.com/image/v1/images/raw/http://com.ft.imagepublish.prod.s3.amazonaws.com/1871b094-3b7d-11e5-bbd1-b37bc06f590c?source=next&amp;fit=scale-down">' +
				'<div class="n-content-related-box__content">' +
				'<p><strong>Breakthrough:</strong> “Closing our first seed round in 10 days three times oversubscribed gave us momentum.”</p>' +
				'<p><strong>Best mentor:</strong> “Chris Baohm, my boss at Gresham Partners in Australia . . . made me understand the importance of breaking.”</p>' +
				'<p><strong>Biggest mistake:</strong> “It became very clear that we needed a strong team with us.”</p>' +
				'<p><strong>Networking:</strong> “Wherever possible, and especially in Latin America, meet in person. Regardless of how good tech is.”</p>' +
				'</div>' +
				'</aside>',
				{ decodeEntities: false }
			);
			const transformed$ = relatedBoxExpanderTransform($);
			transformed$.html().should.equal(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary" data-o-component="o-expander" data-o-expander-shrink-to="0" data-o-expander-count-selector=".n-content-related-box__content--extension">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<img alt="" class="n-image n-image--lazy-loading" role="presentation" data-src="https://next-geebee.ft.com/image/v1/images/raw/http://com.ft.imagepublish.prod.s3.amazonaws.com/1871b094-3b7d-11e5-bbd1-b37bc06f590c?source=next&amp;fit=scale-down">' +
				'<div class="n-content-related-box__content o-expander__content">' +
				'<p><strong>Breakthrough:</strong> “Closing our first seed round in 10 days three times oversubscribed gave us momentum.”</p>' +
				'<p><strong>Best mentor:</strong> “Chris Baohm, my boss at Gresham Partners in Australia . . . made me understand the importance of breaking.”</p>' +
				'<p><strong>Biggest mistake:</strong> “It became very clear that we needed a strong team with us.”</p>' +
				'<div class="n-content-related-box__content--extension">' +
				'<p><strong>Networking:</strong> “Wherever possible, and especially in Latin America, meet in person. Regardless of how good tech is.”</p>' +
				'</div>' +
				'</div>' +
				'<button class="o-expander__toggle o--if-js" data-trackable="expander-toggle"></button>' +
				'</aside>'
			);
		});

	});

	context('An expander should not be added when the related box has', () => {

		it('fewer than 4 paras', () => {
			const $ = cheerio.load(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content">' +
				'<p>Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)</p>' +
				'</div>' +
				'</aside>',
				{ decodeEntities: false }
			);
			const transformed$ = relatedBoxExpanderTransform($);
			transformed$.html().should.equal(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content">' +
				'<p>Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)</p>' +
				'</div>' +
				'</aside>'
			);
		});

		it('more than 3 paras but fewer than 100 words and no image', () => {
			const $ = cheerio.load(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content">' +
				'<p>The first paragraph</p>' +
				'<p>The second paragraph</p>' +
				'<p>The third paragraph</p>' +
				'<p>The fourth paragraph</p>' +
				'<p>The fifth paragraph</p>' +
				'</div>' +
				'</aside>',
				{ decodeEntities: false }
			);
			const transformed$ = relatedBoxExpanderTransform($);
			transformed$.html().should.equal(
				'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
				'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
				'<div class="n-content-related-box__headline">Greece debt crisis</div>' +
				'<div class="n-content-related-box__content">' +
				'<p>The first paragraph</p>' +
				'<p>The second paragraph</p>' +
				'<p>The third paragraph</p>' +
				'<p>The fourth paragraph</p>' +
				'<p>The fifth paragraph</p>' +
				'</div>' +
				'</aside>'
			);
		});

	});

});
