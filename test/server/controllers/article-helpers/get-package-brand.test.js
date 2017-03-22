const expect = require('chai').expect;
const getPackageBrand = require('../../../../server/controllers/article-helpers/get-package-brand');

const SPECIAL_REPORT = 'MjBkZDZhODAtYTQzOS00YmM1LWI4ZTItN2VjM2QwZmI0NTMw-QnJhbmRz';
const FT_SERIES = 'ZjIwNzVmMDQtNzU3OC00NDY4LTg3MmItNGUyYmQ5ZjY3NGY3-QnJhbmRz';

describe('Package branding', () => {

	if('identifies a special report', () => {
		const brand = getPackageBrand([{idV1: 'something'}, { idV1: SPECIAL_REPORT, prefLabel: 'Special Report' }]);

		expect(brand.prefLabel).to.equal('Special Report');
		expect(brand.inSentence).to.equal('Special Report');
	});

	it('identifies an FT series', () => {

		const brand = getPackageBrand([{idV1: 'something'}, { idV1: FT_SERIES, prefLabel: 'FT Series' }, { idV1: 'something else' }]);

		expect(brand.prefLabel).to.equal('FT Series');
		expect(brand.inSentence).to.equal('series');
	});

	it('takes the first one, if it is both a series and special report', () => {

		const brand = getPackageBrand([{idV1: 'something'}, { idV1: FT_SERIES, prefLabel: 'FT Series' }, { idV1: SPECIAL_REPORT, prefLabel: 'Special Report' }]);

		expect(brand.prefLabel).to.equal('FT Series');
		expect(brand.inSentence).to.equal('series');
	});

	it('other things dont have a package brand', () => {

		const brand = getPackageBrand([{idV1: 'something'}]);

		expect(brand).to.be.undefined;
	});

});
