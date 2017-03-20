const expect = require('chai').expect;
const fixture = require('../../../fixtures/v3-elastic-article-found')._source;
const subject = require('../../../../server/controllers/article-helpers/decorate-metadata');

describe('Metadata', () => {

	let result;
	let fixtureData;

	context('for an article with a primary theme and primary section', () => {

		beforeEach(() => {
			// Subject modifies the data given to it so always start fresh
			fixtureData = JSON.parse(JSON.stringify(fixture));
			result = subject(fixtureData);
		});

		it('fills the metadata with CAPI V1 compatible properties', () => {
			result.metadata.forEach(
				tag => expect(tag).to.include.keys('idV1', 'prefLabel', 'taxonomy', 'relativeUrl')
			);
		});

		it('decorates the given article with primary theme, section and brand', () => {
			expect(result.primaryThemeTag.prefLabel).to.equal('Cyber Security');
			expect(result.primarySectionTag.prefLabel).to.equal('Banks');
			expect(result.primaryBrandTag.prefLabel).to.equal('The World');
		});

		it('selects the primary tag based on the primaryTag indicator', () => {
			expect(result.primaryTag.prefLabel).to.equal('Cyber Security');
		});

		it('selects tags for display', () => {
			result.tags.forEach(tag => {
				expect(tag.idV1).not.to.equal(result.primaryTag.idV1);
				expect([ 'iptc', 'icb' ]).not.to.contain(tag.taxonomy);
			});
		});

	});

	context('for an article that has author(s) in its metadata', () => {

		beforeEach(() => {
			// Subject modifies the data given to it so always start fresh
			fixtureData = JSON.parse(JSON.stringify(fixture));
			result = subject(fixtureData);
		});

		it('selects authors for display', () => {
			expect(result.authors).to.be.an('array');
			expect(result.authors.length).to.equal(1);
			// Martin Arnold’s concept uuid
			expect(result.authors[0].idV1).to.equal('Q0ItMDAwMDcyMw==-QXV0aG9ycw==');
		});

		it('excludes authors from the tags array', () => {
			result.tags.forEach(tag => {
				expect(tag.id).not.to.equal('Q0ItMDAwMDcyMw==-QXV0aG9ycw==');
			});
		});
	});

});
