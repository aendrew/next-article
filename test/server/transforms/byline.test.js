require('chai').should();
const bylineTransform = require('../../../server/transforms/byline');

describe('Byline', () => {

	it('should wrap author in link',() => {
		const byline = 'George Parker';
		const authors = [ { idV1: 'ABCD-efhsdf', prefLabel: 'George Parker', relativeUrl: '/stream/authorsId/ABCD-efhsdf' } ];

		bylineTransform(byline, authors).should.equal('<a class="n-content-tag" href="/stream/authorsId/ABCD-efhsdf" data-trackable="author">George Parker</a>');
	});

	it('should wrap multiple authors in links',() => {
		const byline = 'George Parker and Chris Giles';
		const authors = [
			{ idV1: 'ABCD-efhsdf', prefLabel: 'George Parker', relativeUrl: '/stream/authorsId/ABCD-efhsdf' },
			{ idV1: 'OBCD-efhsdf', prefLabel: 'Chris Giles', relativeUrl: '/stream/authorsId/OBCD-efhsdf' }
		];

		bylineTransform(byline, authors).should.equal(
			'<a class="n-content-tag" href="/stream/authorsId/ABCD-efhsdf" data-trackable="author">George Parker</a>' +
			' and ' +
			'<a class="n-content-tag" href="/stream/authorsId/OBCD-efhsdf" data-trackable="author">Chris Giles</a>'
		);
	});

	it('should do anything if no authors data', () => {
		const byline = 'George Parker and Chris Giles';
		const authors = [];

		bylineTransform(byline, authors).should.equal('George Parker and Chris Giles');
	});

});
