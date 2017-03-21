const cheerio = require('cheerio');
require('chai').should();

const subject = require('../../../server/transforms/strip-package-promo-TOCs');

const promoBoxWithTOC = `<aside aria-hidden="true" class="n-content-related-box p402_hide" data-trackable="related-box" role="complementary">
		<div class="n-content-related-box__headline">
			Women of the year
		</div>
		<div class="n-image-wrapper n-image-wrapper--placeholder" style="padding-bottom: 56.25%;"><img alt="" class="n-image" data-n-image-lazy-load-js="" data-uid="f4094d4711.f8d" role="presentation" sizes="(min-width: 30.625em) 298px, calc(100vw - 20px)" srcset="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F03a6fab8-bc94-11e6-8b45-b8b81dd5d080?source=next&amp;fit=scale-down&amp;width=467 467w, https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F03a6fab8-bc94-11e6-8b45-b8b81dd5d080?source=next&amp;fit=scale-down&amp;width=298 298w"></div>
		<div class="n-content-related-box__content">
			<p><a data-trackable="link" href="/content/4ff0cb62-bc74-11e6-8b45-b8b81dd5d080">FT women of 2016</a>: who we chose and why</p>
			<p><a data-trackable="link" href="/content/2616fda2-bc06-11e6-8b45-b8b81dd5d080">Theresa May</a>, UK prime minister</p>
			<p><a data-trackable="link" href="/content/278a54fe-bc06-11e6-8b45-b8b81dd5d080">Simone Biles</a>, gymnast</p>
			<p><a data-trackable="link" href="/content/2bbe70be-bc06-11e6-8b45-b8b81dd5d080">Jean Liu</a>, businesswoman</p>
			<p><a data-trackable="link" href="/content/24450582-bc06-11e6-8b45-b8b81dd5d080">Maria Grazia Chiuri</a>, head of Christian Dior</p>
			<p><a data-trackable="link" href="/content/0055d3ea-bc06-11e6-8b45-b8b81dd5d080">Margrethe Vestager</a>, EU competition commissioner</p>
			<p><a data-trackable="link" href="/content/22a6925e-bc06-11e6-8b45-b8b81dd5d080">Njideka Akunyili Crosby</a>, artist</p>
			<p><a data-trackable="link" href="/content/cd5c2b24-bc05-11e6-8b45-b8b81dd5d080">Dilma Rousseff</a>, former Brazilian president</p>
			<p><a data-trackable="link" href="/content/febac644-bc05-11e6-8b45-b8b81dd5d080">Phoebe Waller-Bridge &amp; Vicky Jones</a>, creators of ‘Fleabag’</p>
		</div>
	</aside>`;

const promoBoxWithSingleLink = `
	<aside class="n-content-related-box" role="complementary">
		<h3 class="n-content-related-box__title"><span class="n-content-related-box__title-text">Related article</span></h3><a class="n-content-related-box__image-link" href="/&quot;/content/95d61362-80b0-11e6-bc52-0c7211ef3198/&quot;"><img alt="(FILE" data-copyright="©" height="1152" longdesc="/&quot;Mary" src="/&quot;http://com.ft.imagepublish.prod.s3.amazonaws.com/3ba022c2-80b3-11e6-8e50-8ec15fb462f4/&quot;" width="2048"></a>
		<div class="n-content-related-box__headline">
			<a class="n-content-related-box__headline-link" href="/&quot;/content/95d61362-80b0-11e6-bc52-0c7211ef3198/&quot;">Mary Berry quits ‘Great British Bake Off’ out of loyalty to BBC</a>
		</div>
		<div class="n-content-related-box__content">
			<p>Turmoil in UK’s most popular show illustrates shifts in entertainment industry</p>
		</div>
	</aside>
`;

describe('Promo Boxes within content package articles', () => {


	it('should be stripped if there is more than one link, as it is likely to be duplicated navigation', () => {
		const $ = cheerio.load(promoBoxWithTOC, { decodeEntities: false });
		const transformed$ = subject($, { contentPackages: true }, { contentPackage: { contents: [] }});
		transformed$.html().should.equal('');
	});

	it('should not strip promo boxes with fewer than 2 links', () => {
		const $ = cheerio.load(promoBoxWithSingleLink, { decodeEntities: false });
		const transformed$ = subject($, { contentPackages: true }, { contentPackage: { contents: [] }});
		transformed$.html().should.equal(promoBoxWithSingleLink);
	});

	it('should not strip anything from content which is not a package', () => {
		const $ = cheerio.load(promoBoxWithTOC, { decodeEntities: false });
		const transformed$ = subject($, { contentPackages: true }, { contentPackage: null });
		transformed$.html().should.equal(promoBoxWithTOC);
	});

	it('should not strip anything if the contentPackages flag is off', () => {
		const $ = cheerio.load(promoBoxWithTOC, { decodeEntities: false });
		const transformed$ = subject($, { contentPackages: false }, { contentPackage: { contents: [] } });
		transformed$.html().should.equal(promoBoxWithTOC);
	});

	it('should not strip anything from the fragment view', () => {
		const $ = cheerio.load(promoBoxWithTOC, { decodeEntities: false });
		const transformed$ = subject($, { contentPackages: true }, { fragment: true, contentPackage: { contents: [] } });
		transformed$.html().should.equal(promoBoxWithTOC);
	});

});
