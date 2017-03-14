const nock = require('nock');
const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixtureOnwardJourney = require('../../fixtures/onward-journey');

const dependencyStubs = {
	logger: sinon.spy(),
	article: sinon.spy(),
	onwardJourney: sinon.stub().returns(Promise.resolve(fixtureOnwardJourney))
};

nock.disableNetConnect();

const subject = proxyquire('../../../server/controllers/in-article-barrier', {
	'./article': dependencyStubs.article,
	'./article-helpers/onward-journey': dependencyStubs.onwardJourney
});

describe('In Article Barrier Endpoint Controller', () => {

	let request;
	let response;
	let next;

	function createInstance (params, flags) {
		next = sinon.stub();
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		return subject(request, response, next);
	}

	it('Fetches Onward Journey information', () => {
		createInstance({
			body: {
				content: {},
				barrierHTML: '<p>Foo</p>'
			},
			params: {
				id: '012f81d6-2e2b-11e5-8873-775ba7c2ea3d'
			}
		});

		sinon.assert.calledOnce(dependencyStubs.onwardJourney);
	});

	it('Sets up the barrier content for injection into the article.', () => {
		expect(request.body.content.inArticleBarrierHTML).to.equal('<p>Foo</p>');
	});

});
