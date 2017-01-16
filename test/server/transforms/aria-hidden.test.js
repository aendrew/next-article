const cheerio = require('cheerio');
const pullquoteAriaHiddenTransform = require('../../../server/transforms/pullquote-aria-hidden');

require('chai').should();

describe('Add aria-hidden to pullquotes', () => {
	it('should add `aria-hidden="true"` to pullquotes, in order to aid comprehension of the main content', () => {
		const $ = cheerio.load(
			'<blockquote class="n-content-pullquote"><div class="n-content-pullquote__content"><p>New Place is an intriguing sight, but without any provable connection to Shakespeare’s own garden</p></div></blockquote>',
			{ decodeEntities: false }
		);
		const transformed$ = pullquoteAriaHiddenTransform($);

		transformed$.html().should.equal(
			'<blockquote class="n-content-pullquote" aria-hidden="true"><div class="n-content-pullquote__content"><p>New Place is an intriguing sight, but without any provable connection to Shakespeare’s own garden</p></div></blockquote>'
		);
	});
});
