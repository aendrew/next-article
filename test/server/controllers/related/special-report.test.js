require('chai').should();

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const stubs = {
	getRelatedArticles: sinon.stub(),
	fetchGraphQlData: sinon.stub()
};
const subject = proxyquire('../../../../server/controllers/related/special-report', {
	'../../lib/get-related-articles': stubs.getRelatedArticles,
	'../../lib/fetch-graphql-data': stubs.fetchGraphQlData
});

const articlesSpecialReport = [
	{id: '117bbe2c-9417-11e5-b190-291e94b77c8f', primaryTag: {idV1: '1', name: 'Not Special Report', taxonomy: 'genre'}},
	{id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', mainImage: 'first'},
	{id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af', mainImage: 'second'},
	{id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', primaryTag: {prefLabel: 'Special Report', taxonomy: 'specialReports'}},
	{id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af'}
];

let options;
let request;
let response;
let result;

describe('Special Report', () => {

	function createInstance (options) {
		request = httpMocks.createRequest(options);
		response = httpMocks.createResponse();
		response.cache = sinon.stub();
		response.vary = sinon.stub();
		response.unvary = sinon.stub();
		response.unvaryAll = sinon.stub();
		return subject(request, response);
	}



	describe('getting most recent articles in a special report', () => {

		before(() => {

			stubs.getRelatedArticles.returns(Promise.resolve(articlesSpecialReport));
			stubs.fetchGraphQlData.returns(Promise.resolve({ specialReport: { prefLabel: 'Argentina' }}));
			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					tagId: 'TnN0ZWluX0dMX0FS-R0w=',
					count: '5'
				}
			};

			return createInstance(options).then(() => {
				result = response._getRenderData()
			});

		});

		it('sets surrogate-key', () => {
			response._headers['surrogate-key'].should.equal('idV1:TnN0ZWluX0dMX0FS-R0w=');
		})

		it('should return a list of 5 articles', () => {
			result.articles.should.have.length(5);
		});

		it('should extract the image from the first article with an image', () => {
			result.mainImage.should.equal('first');
		});

		it('should get the special report id and name from the first article with a primaryTag with taxonomy specialReports', () => {
			result.idV1.should.eql('TnN0ZWluX0dMX0FS-R0w=');
			result.prefLabel.should.equal('Argentina');
		});

		it('should not return the parent article in the list', () => {
			result.articles.filter(article => article.parent).should.have.length(0);
		});

	});


	describe('not sending through a tag id', () => {

		before(() => {

			stubs.search = sinon.stub()

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					count: '5'
				}
			};

			return createInstance(options);

		});

		it('should return a staus of 400', () => {
			response.statusCode.should.eql(400);
		});
	});

	describe('no articles returned', () => {

		before(() => {

			stubs.search = sinon.stub().returns(Promise.resolve([]));

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					tagId: 'Arand0mTag',
					count: '5'
				}
			};

			return createInstance(options);

		});

		it('should return a status code of 200', () => {
			response.statusCode.should.eql(200);
		});

	});

});
