const cheerio = require('cheerio');
const expect = require('chai').expect;
const inlineAdTransform = require('../../../server/transforms/inline-ad');

describe('Inline ad inside body', function () {

	const adHtml = '<div class="o-ads in-article-advert advert" data-o-ads-name="mpu" data-o-ads-center="true" data-o-ads-label="true" data-o-ads-targeting="pos=mid;" data-o-ads-formats-default="MediumRectangle,Responsive" data-o-ads-formats-small="MediumRectangle,Responsive" data-o-ads-formats-medium="MediumRectangle,Responsive" data-o-ads-formats-large="Responsive" data-o-ads-formats-extra="Responsive" data-o-ads-collapse-empty="true" aria-hidden="true"></div>';

	const adHtmlWithoutResponsive = '<div class="o-ads in-article-advert advert" data-o-ads-name="mpu" data-o-ads-center="true" data-o-ads-label="true" data-o-ads-targeting="pos=mid;" data-o-ads-formats-default="MediumRectangle,Responsive" data-o-ads-formats-small="MediumRectangle,Responsive" data-o-ads-formats-medium="MediumRectangle,Responsive" data-o-ads-formats-large="false" data-o-ads-formats-extra="false" data-o-ads-collapse-empty="true" aria-hidden="true"></div>';

	const secondAdHtml = '<div class="o-ads in-article-advert advert" data-o-ads-name="second-mpu" data-o-ads-center="true" data-o-ads-label="true" data-o-ads-targeting="pos=mid;" data-o-ads-formats-default="MediumRectangle,Responsive" data-o-ads-formats-small="MediumRectangle,Responsive" data-o-ads-formats-medium="false" data-o-ads-formats-large="false" data-o-ads-formats-extra="false" data-o-ads-collapse-empty="true" aria-hidden="true"></div>';

	it('should insert an ad between the third and fourth paragraphs', function () {
		const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p>', { decodeEntities: false });
		inlineAdTransform($, {}, {adsLayout: 'default'});
		expect($.html()).to.equal(`<p>1</p><p>2</p><p>3</p>${adHtml}<p>4</p>`);
	});

	it('should insert an ad at the end of the doc if there are three paragraphs', function () {
		const $ = cheerio.load('<p>1</p><img><p>2</p><p>3</p>', { decodeEntities: false });
		inlineAdTransform($, { threeAdProposition: true }, {adsLayout: 'default'});
		expect($.html()).to.equal(`<p>1</p><img><p>2</p><p>3</p>${adHtmlWithoutResponsive}`);
	});

	it('should not insert an ad at the end of the doc if there are three paragraphs but the last element is not a paragraph', function () {
		const $ = cheerio.load('<p>1</p><img><p>2</p><p>3</p><img>', { decodeEntities: false });
		inlineAdTransform($, { threeAdProposition: true }, {adsLayout: 'default'});
		expect($.html()).to.equal('<p>1</p><img><p>2</p><p>3</p><img>');
	});

	it('should not insert an ad at the end of the doc if there are three paragraphs and the flag is off', function () {
		const $ = cheerio.load('<p>1</p><img><p>2</p><p>3</p><img>', { decodeEntities: false });
		inlineAdTransform($, { threeAdProposition: false }, {adsLayout: 'default'});
		expect($.html()).to.equal('<p>1</p><img><p>2</p><p>3</p><img>');
	});

	it('should insert a non-responsive at the end of the doc if there are less than three paragraphs', function () {
		const $ = cheerio.load('<p>1</p>', { decodeEntities: false });
		inlineAdTransform($, { threeAdProposition: true }, {adsLayout: 'default'});
		expect($.html()).to.equal(`<p>1</p>${adHtmlWithoutResponsive}`);
	});

	it('should move the ad later if there is any other element after the third paragraph', function () {
		const $ = cheerio.load('<p>1</p><img><p>2</p><p>3</p><img><p>4</p><p>5</p>', { decodeEntities: false });
		inlineAdTransform($, {}, {adsLayout: 'default'});
		expect($.html()).to.equal(`<p>1</p><img><p>2</p><p>3</p><img><p>4</p>${adHtml}<p>5</p>`);
	});

	it('should not place an ad in an aside', function () {
		const $ = cheerio.load('<p>1</p><p>2</p><aside><p>3</p><p>4</p></aside>', { decodeEntities: false });
		inlineAdTransform($, {}, {adsLayout: 'responsive'});
		expect($.html()).to.equal('<p>1</p><p>2</p><aside><p>3</p><p>4</p></aside>');
	});

	it('should not place an ad directly after an aside', function () {
		let $ = cheerio.load('<p>1</p><aside>2</aside><p>3</p><p>4</p><p>5</p>');
		$ = inlineAdTransform($, {}, 'responsive');
		expect($.html()).to.equal(`<p>1</p><aside>2</aside><p>3</p><p>4</p>${adHtml.replace('pos=mpu;', 'pos=mid;')}<p>5</p>`);
	});

	it('should add a second MPU after another 6 pars if flag is on', function () {
		let $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p><p>11</p><p>12</p><p>13</p><p>14</p><p>15</p><p>16</p>');
		$ = inlineAdTransform($, { threeAdProposition: true}, 'responsive');
		expect($.html()).to.equal(`<p>1</p><p>2</p><p>3</p>${adHtmlWithoutResponsive}<p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>${secondAdHtml}<p>10</p><p>11</p><p>12</p><p>13</p><p>14</p><p>15</p><p>16</p>`);
	});
});
