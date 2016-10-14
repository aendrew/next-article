const proxyquire = require('proxyquire');
const cheerio = require('cheerio');
const expect = require('chai').expect;

const mockTourTipHtml = '<div class="tour-tip"></div>';
const tourTipTransform = proxyquire('../../../server/transforms/tour-tip', {'../lib/get-random-tour-tip-html': () => mockTourTipHtml});

describe('Tour tip component inside body', function () {

	describe('Position component', function () {
		const flags = { nextFtTour: true, nextFtTourTipArticlePage: true };

		it('should insert the component after the 6th paragraph', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>');
			tourTipTransform($, flags, { userIsAnonymous: false });
			expect($.html()).to.equal(`<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p>${mockTourTipHtml}<p>7</p><p>8</p><p>9</p><p>10</p>`);
		});

		it('should not insert the component if there are only 6 paragraphs', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><img>');
			tourTipTransform($, flags, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><img>');
		});

		it('should not insert the component if there are fewer than 2 paras after the proposed place', () => {
			// this fixes problems where there isn't enough text between the tip and e.g. an add and we get loads of
			// whitespace
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p>');
			tourTipTransform($, flags, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p>');
		});

		it('should not insert the component if follow two paras are followed by a quote', () => {
			// this fixes case where there are two paras between the tip and a quote but on of the paras is like an intro
			// to the quote so its really small and we end up with loads of whitespace
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><blockquote>do or do not there is no try</blockquote><p>4</p><p>5</p>');
			tourTipTransform($, flags, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><blockquote>do or do not there is no try</blockquote><p>4</p><p>5</p>');
		});

		it('should not insert the component if follow two paras are followed by a quote', () => {
			// this fixes case where there are two paras between the tip and a quote but on of the paras is like an intro
			// to the quote so its really small and we end up with loads of whitespace
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><blockquote>do or do not there is no try</blockquote><p>4</p><p>5</p>');
			tourTipTransform($, flags, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><blockquote>do or do not there is no try</blockquote><p>4</p><p>5</p>');
		});

		it('should not insert the component when user is anonymous', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>');
			tourTipTransform($, flags, {
				userIsAnonymous: true
			});
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>');
		});

		it('should not insert the component when userIsAnonymous property isn’t passed through', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>');
			tourTipTransform($, flags);
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>');
		});

	});

	describe('Flags not on', function () {

		it('should not insert anything if nextFtTour flag is false', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
			tourTipTransform($, { nextFtTour: false }, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
		});

		it('should not insert anything if nextFtTour flag is true but nextFtTourTipArticlePage is false', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
			tourTipTransform($, { nextFtTour: true, nextFtTourTipArticlePage: false }, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
		});

		it('should not insert anything if nextFtTourTipArticlePage flag is true but nextFtTour is false', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
			tourTipTransform($, { nextFtTour: false, nextFtTourTipArticlePage: true }, { userIsAnonymous: false });
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
		});

	});

	describe('Fragment view', () => {
		const flags = { nextFtTour: true };
		const options = { fragment: true, userIsAnonmous: false };

		it('should not insert anything on a fragment view', () => {
			const $ = cheerio.load('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
			tourTipTransform($, flags, options);
			expect($.html()).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p>');
		});
	});

});
