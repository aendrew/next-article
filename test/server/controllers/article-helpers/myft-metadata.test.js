const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixtureEsFound = require('../../../fixtures/v3-elastic-article-found').docs[0]._source;

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
		return subject(request, response, fixtureEsFound, response.locals.flags);
	}

	beforeEach(() => {
		let flags = {
			openGraph: true
		};

		return createInstance({query: {
			myftTopics: 'NTc=-U2VjdGlvbnM=,NTQ=-U2VjdGlvbnM='
		}}, flags).then(data => result = data);
	});

	it('it should promote users myft tags to be displayed', () => {
		expect(result.tags.find(tag => tag.idV1 === 'NTc=-U2VjdGlvbnM=')).to.exist;
		expect(result.tags.find(tag => tag.idV1 === 'NTQ=-U2VjdGlvbnM=')).to.exist;
	});

});
