const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-podcast-found')._source;

const stubs = {
	onwardJourney: sinon.stub()
};

const subject = proxyquire('../../../server/model/podcast', {
	'../controllers/article-helpers/onward-journey': stubs.onwardJourney
});

describe('Podcast Handler', () => {
	let request;
	let response;
	let result;

	function createInstance (params, flags) {
		result = null;
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		// node-mocks-http doesn't support this method
		response.unvaryAll = sinon.stub();
		return subject(request, response, fixture, response.locals.flags);
	}

	beforeEach(() => {
		return createInstance(null, { articleSuggestedRead: true }).then(data => {
			result = data;
		});
	});

	it('provides related data for podcasts', () => {
		expect(result.externalLinks).to.be.an('object');
		expect(result.externalLinks).to.include.keys('rss', 'stitcher', 'audioboom');

		expect(result.media).to.be.an('object');
		expect(result.media).to.include.keys('mediaType', 'url');
	});
});
