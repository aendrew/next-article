const getMoreOnTags = require('../../../../server/controllers/article-helpers/get-more-on-tags');

const primaryBrandTag = { primaryBrandTag: { taxonomy: 'brand' } };
const primaryThemeTag = { primaryThemeTag: {taxonomy: 'theme'} };
const primarySectionTag = { primarySectionTag: {taxonomy: 'section'} };
const primaryTag = { primaryTag: {taxonomy: 'specialReports'} };

describe('Getting the tags for More Ons', () => {

	let content;

	it('should return just the primaryTag if it is a special report', () => {
		content = Object.assign({},
			primaryBrandTag,
			primarySectionTag,
			primaryTag,
			{ isSpecialReport: true }
		)
		getMoreOnTags(content).length.should.equal(1);
		getMoreOnTags(content).pop().taxonomy.should.equal('specialReports');
	});

	it('should return the first two tags if primary theme, section and brand exist', () => {
		content = Object.assign({},
			primaryBrandTag,
			primarySectionTag,
			primaryThemeTag
		)
		getMoreOnTags(content).length.should.equal(2);
		getMoreOnTags(content)[0].taxonomy.should.equal('theme');
		getMoreOnTags(content)[1].taxonomy.should.equal('section');
	});

	it('should only return one if only one of the primary types exists', () => {

	});

});
