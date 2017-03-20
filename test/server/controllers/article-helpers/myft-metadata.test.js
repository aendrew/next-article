const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../../fixtures/v3-elastic-article-found')._source;

const subject = proxyquire('../../../../server/model/content', {
	'../controllers/article-helpers/suggested': () => Promise.resolve(),
	'../transforms/body': (articleHtml) => { return { html: () => articleHtml } }
});

describe('myFT metadata', () => {

	let request;
	let response;
	let result;

	function createInstance (params, flags) {
		result = null;
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		return subject(request, response, fixture, response.locals.flags);
	}

	beforeEach(() => {
		let flags = {
			openGraph: true
		};

		return createInstance({query: {
			myftTopics: 'NTc=-U2VjdGlvbnM=,NjM=-U2VjdGlvbnM='
		}}, flags).then(data => result = data);
	});

	it('it should promote users myft tags to be displayed', () => {
		expect(result.tags.find(tag => tag.idV1 === 'NTc=-U2VjdGlvbnM=')).to.exist;
		expect(result.tags.find(tag => tag.idV1 === 'NjM=-U2VjdGlvbnM=')).to.exist;
	});

});
