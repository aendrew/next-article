const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const spreadsheet = require('../../fixtures/interactive-graphics');
const fixture = spreadsheet.reduce(
	(map, row) => map.set(row.articleuuid, row.interactiveurl), new Map()
);

describe('IG poller', () => {
	let subject;
	let result;
	let stub;

	beforeEach(() => {
		stub = sinon.createStubInstance(require('ft-poller'));

		subject = proxyquire('../../../server/lib/ig-poller', {
			'ft-poller': function () { return stub; }
		});
	});

	describe('#start', () => {
		beforeEach(() => {
			result = subject.start();
		});

		it('kicks off the poller', () => {
			sinon.assert.calledOnce(stub.start);
			sinon.assert.calledWith(stub.start, sinon.match.has('initialRequest'));
		});
	});

	describe('#getData', () => {
		beforeEach(() => {
			stub.getData.returns(fixture);
			result = subject.getData();
		});

		it('fetches data from the poller', () => {
			sinon.assert.calledOnce(stub.getData);
			expect(result).to.equal(fixture);
		});
	});

	describe('#lookup', () => {
		beforeEach(() => {
			stub.getData.returns(fixture);
		});

		it('matches ID to URL', () => {
			result = subject.lookup('7acdba4a-f4e1-11e4-8a42-00144feab7de');
			sinon.assert.calledOnce(stub.getData);
			expect(result).to.equal('http://ig.ft.com/sites/2015/greek-debt-monitor/');
		});

		it('returns nothing for ID without a URL mapping', () => {
			result = subject.lookup('foo-bar-baz');
			sinon.assert.calledOnce(stub.getData);
			expect(result).to.not.be.ok;
		});


		it('returns nothing for undefined ID', () => {
			result = subject.lookup();
			sinon.assert.calledOnce(stub.getData);
			expect(result).to.not.be.ok;
		});
	});
});
