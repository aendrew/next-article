const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-package-found').docs[0]._source;
const subject = proxyquire('../../../server/model/package', {});

function cloneFixture () {
	return JSON.parse(JSON.stringify(fixture));
}

describe('Package Handler', () => {

	let request;
	let response;
	let result;

	function createInstance (params, flags, payload, asAnon) {
		result = null;
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {}, anon: { userIsAnonymous: asAnon } };
		// node-mocks-http doesn't support this method
		return subject(request, response, payload || fixture, response.locals.flags);
	}

	context('when contentPackages flag is off', () => {
		beforeEach(() => {
			const content = cloneFixture(fixture);
			content.tableOfContents.displayIntroduction = false;
			content.bodyHTML = '';
			return createInstance(null, {contentPackages: false}).then(data => {
				result = data;
			})
		});

		it('uses the normal article template', () => {
			expect(result.template).to.equal('content');
		});

	});

	context('when contentPackages flag is on', () => {
		beforeEach(() => {
			const content = cloneFixture(fixture);
			content.tableOfContents.displayIntroduction = false;
			content.tableOfContents.labelType = 'none';
			content.bodyHTML = '';
			return createInstance(null, {contentPackages: true}, content).then(data => {
				result = data;
			});
		});

		it('uses the package template', () => {
			expect(result.template).to.equal('package-index');
			expect(result.contains.every(e => Number.isInteger(e.packageIndex))).to.be.true;
			result.contains.forEach(e => expect(e.label).to.equal(''));
		});

	});

	context('with variant tableOfContents settings', () => {

		it('labelType is "part-number"', () => {
			const content = cloneFixture(fixture);
			content.tableOfContents.displayIntroduction = false;
			content.tableOfContents.labelType = 'part-number';
			content.tableOfContents.sequence = 'exact-order';
			content.bodyHTML = '';
			return createInstance(null, {contentPackages: true}, content).then(result => {
				expect(result.contains.every(e => Number.isInteger(e.packageIndex))).to.be.true;
				result.contains.forEach(
					e => expect(e.label).to.match(/^part\ \d+$/i)
				);
			});
		});

		it('labelType is "chapter-number"', () => {
			const content = cloneFixture(fixture);
			content.tableOfContents.displayIntroduction = false;
			content.tableOfContents.labelType = 'chapter-number';
			content.tableOfContents.sequence = 'exact-order';
			content.contains.forEach(e => e.label = 'some value');
			content.bodyHTML = '';
			return createInstance(null, {contentPackages: true}, content).then(result => {
				expect(result.contains.every(e => Number.isInteger(e.packageIndex))).to.be.true;
				result.contains.forEach(
					e => expect(e.label).to.match(/^chapter\ \d+$/i)
				);
			});
		});

		it('labelType is "custom"', () => {
			const content = cloneFixture(fixture);
			content.tableOfContents.displayIntroduction = false;
			content.tableOfContents.labelType = 'custom';
			content.tableOfContents.sequence = 'none';
			content.contains[0].label = 'Winner';
			content.contains[1].label = 'Runner up';
			content.bodyHTML = '';
			return createInstance(null, {contentPackages: true}, content).then(result => {
				expect(result.contains.every(e => Number.isInteger(e.packageIndex))).to.be.true;
				expect(result.contains[0].label).to.equal('Winner');
				expect(result.contains[1].label).to.equal('Runner up');
				result.contains.slice(2).forEach(
					e => expect(e.label).to.equal('')
				);
			});
		});

	});

});
