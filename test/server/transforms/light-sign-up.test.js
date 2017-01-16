const cheerio = require('cheerio');
const expect = require('chai').expect;
const lightSignupTransform = require('../../../server/transforms/light-sign-up');

describe('Light Signup component inside body', function () {

	describe('Position component', function () {
		const flags = {lightSignupInArticle: true};
		const lightSignupHtml = '<div class="p402_hide" data-o-email-only-signup-position-mvt="" aria-hidden="true"></div>';

		it('should insert the component after the first paragraph', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p>');
			lightSignupTransform($, flags);
			expect($.html()).to.equal(`<p>1</p>${lightSignupHtml}<p>2</p><p>3</p><p>4</p><p>5</p><p>6</p>`);
		});

		it('should not insert the component if there is only one paragraph', () => {
			const $ = cheerio.load('<p>1</p><img>');
			lightSignupTransform($, flags);
			expect($.html()).to.equal('<p>1</p><img>');
		});

		it('should move the component later if there is any other element after the first paragraph', () => {
			const $ = cheerio.load('<p>1</p><img><p>2</p><p>3</p>');
			lightSignupTransform($, flags);
			expect($.html()).to.equal(`<p>1</p><img><p>2</p>${lightSignupHtml}<p>3</p>`);
		});

		it('should not add into an aside', () => {
			const $ = cheerio.load('<blockquote><p>1</p></blockquote><p>2</p><p>3</p>');
			lightSignupTransform($, flags);
			expect($.html()).to.equal(`<blockquote><p>1</p></blockquote><p>2</p>${lightSignupHtml}<p>3</p>`);
		});

	});

	describe('No Flag', function () {

		const flags = {lightSignupInArticle: false};

		it('should not insert anything if flag is false', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p>');
			lightSignupTransform($, flags);
				expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p>');
		});

	});

	describe('Fragment view', () => {
		const flags = {lightSignupInArticle: true};
		const options = {fragment: true};

		it('should not insert anything on a fragment view', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>');
			lightSignupTransform($, flags, options);
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>');
		});
	});

});
