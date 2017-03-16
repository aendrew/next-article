const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const shellpromise = sinon.stub();
const getFalconUrl = proxyquire('../../../../server/controllers/article-helpers/falcon-url', {
	'shellpromise': shellpromise,
});

describe('Get Falcon URL', () => {

	afterEach(function () {
		shellpromise.reset();
	});

	it('with valid UUID resolves to a Falcon URL', () => {
		// The UUID of the article
		const uuid = '8f88c930-d00a-11da-80fb-0000779e2340';
		// THe corresponding URL in Falcon
		const falconUrl = `http://www.ft.com/cms/s/0/${uuid}.html`;
		// We need to redirect the browser with a query string
		const redirectUrl = `${falconUrl}?ft_site=falcon&desktop=true`;
		shellpromise.returns(Promise.resolve(`Location:${falconUrl}`));
		return getFalconUrl(uuid).then(url => {
			expect(url).to.equal(redirectUrl);
			expect(shellpromise.callCount).to.equal(1);
		});
	});

	it('with no UUID does not resolve to a Falcon URL', () => {
		const uuid = null;
		shellpromise.returns(Promise.resolve(undefined));
		return getFalconUrl(uuid).then(url => {
			expect(url).to.be.undfined;
			expect(shellpromise.callCount).to.equal(0);
		});
	});

	it('with unknown UUID does not resolve to a Falcon URL', () => {
		const uuid = '8f88c930-d00a-11da-80fb-0000779e2340';
		shellpromise.returns(Promise.resolve(''));
		return getFalconUrl(uuid).then(url => {
			expect(url).to.be.undefined;
			expect(shellpromise.callCount).to.equal(1);
		});
	});
});
