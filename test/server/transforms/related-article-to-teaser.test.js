const cheerio = require('cheerio');
let relatedArticleToTeaserTransform;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
require('chai').should();

describe('Related Article to Teaser Transform', () => {

	const teaserStub = sinon.stub().returns('[teaser-placeholder]');

	before(() => {
		relatedArticleToTeaserTransform = proxyquire('../../../server/transforms/related-article-to-teaser', {
			'../../node_modules/@financial-times/n-teaser/templates/heavy.html': teaserStub
		});
	});

	afterEach(() => {
		teaserStub.reset();
	});

	it('should turn content into oTeaser', () => {
		const $ = cheerio.load(
			'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
			'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
			'<a class="n-content-related-box__image-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582"><img src="http://com.ft.imagepublish.prod.s3.amazonaws.com/c0bce01a-9663-11e6-a1dc-bdf38d484582" alt="alt text" width="2048" height="1152" data-copyright="© EPA"></a>' +
			'<div class="n-content-related-box__headline"><a class="n-content-related-box__headline-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582">Donald Trump fails to keep election suspense alive</a></div>' +
			'<div class="n-content-related-box__content">' +
			'<p>Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)</p>' +
			'</div>' +
			'</aside>',
			{ decodeEntities: false }
		);
		const transformed$ = relatedArticleToTeaserTransform($);
		sinon.assert.calledWith(teaserStub, {
			colspan: '{"default": 12, "L": 4}',
			mainImage: {
				url: 'http://com.ft.imagepublish.prod.s3.amazonaws.com/c0bce01a-9663-11e6-a1dc-bdf38d484582'
			},
			position: '{"default": "bottom"}',
			mods: ['large-portrait'],
			standfirst: 'Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)',
			title: 'Donald Trump fails to keep election suspense alive',
			relativeUrl: '/content/18c31cb8-967b-11e6-a1dc-bdf38d484582',
			widths: '[500, 332]'
		});

		transformed$.html().should.equal(
			'<aside class="n-content-related-box n-content-related-box--no-border" data-trackable="related-box" role="complementary"><h2 class="standalone-teaser-heading">Tatomer Riesling 2012</h2>[teaser-placeholder]</aside>'
		);
	});

	it('should not transform things that arent links', () => {
		const $ = cheerio.load(
			'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
			'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
			'<a class="n-content-related-box__image-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582"><img src="http://com.ft.imagepublish.prod.s3.amazonaws.com/c0bce01a-9663-11e6-a1dc-bdf38d484582" alt="alt text" width="2048" height="1152" data-copyright="© EPA"></a>' +
			'<div class="n-content-related-box__headline">Donald Trump fails to keep election suspense alive/div>' +
			'<div class="n-content-related-box__content">' +
			'<p>Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)</p>' +
			'</div>' +
			'</aside>',
			{ decodeEntities: false }
		);
		relatedArticleToTeaserTransform($);
		teaserStub.callCount.should.equal(0);
	});

	it('should not transform things with more than one link', () => {
		const $ = cheerio.load(
			'<aside class="n-content-related-box" data-trackable="related-box" role="complementary">' +
			'<div class="n-content-related-box__title"><div class="n-content-related-box__title-text">Tatomer Riesling 2012</div></div>' +
			'<a class="n-content-related-box__image-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582"><img src="http://com.ft.imagepublish.prod.s3.amazonaws.com/c0bce01a-9663-11e6-a1dc-bdf38d484582" alt="alt text" width="2048" height="1152" data-copyright="© EPA"></a>' +
			'<div class="n-content-related-box__headline"><a class="n-content-related-box__headline-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582">Donald Trump fails to keep election suspense alive</a></div>' +
			'<div class="n-content-related-box__headline"><a class="n-content-related-box__headline-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582">Donald Trump fails to keep election suspense alive</a></div>' +
			'<div class="n-content-related-box__headline"><a class="n-content-related-box__headline-link" href="/content/18c31cb8-967b-11e6-a1dc-bdf38d484582">Donald Trump fails to keep election suspense alive</a></div>' +
			'<div class="n-content-related-box__content">' +
			'<p>Graham Tatomer worked at Austrian Riesling producer Emmerich Knoll and now fashions this example from the old vines of the Kick-on Ranch in Santa Barbara (£26.95, Roberson)</p>' +
			'</div>' +
			'</aside>',
			{ decodeEntities: false }
		);
		relatedArticleToTeaserTransform($);
		teaserStub.callCount.should.equal(0);
	});

});
