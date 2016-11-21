const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const stubs = {
	fetchGraphQlData: sinon.stub(),
	contentDecorator: sinon.stub(),
	ReactServer: {
		renderToStaticMarkup: sinon.stub()
	},
	getSection: sinon.stub()
};

const subject = proxyquire('../../../../server/controllers/related/story-package', {
	'../../lib/fetch-graphql-data': stubs.fetchGraphQlData,
	'@financial-times/n-content-decorator': stubs.contentDecorator,
	'react-dom/server': stubs.ReactServer,
	'../../../config/sections': stubs.getSection
});

stubs.contentDecorator.returnsArg(0);
stubs.ReactServer.renderToStaticMarkup.returns('section');
stubs.getSection.returns('sectionProps');

const resetStubs = () => {
	stubs.fetchGraphQlData.reset();
	stubs.ReactServer.renderToStaticMarkup.reset();
	stubs.contentDecorator.reset();
	stubs.getSection.reset();
};

const articlesStoryPackage = {
	article: {
		storyPackage: [
			{id: '117bbe2c-9417-11e5-b190-291e94b77c8f', mainImage: true},
			{id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', mainImage: true},
			{id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af', mainImage: true},
			{id: '64492528-91d2-11e5-94e6-c5413829caa5', mainImage: true},
			{id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', mainImage: true}
		]
	}
};

describe('Story Package', () => {

	let request;
	let response;
	let options;

	function createInstance (options, flags) {
		request = httpMocks.createRequest(options);
		response = httpMocks.createResponse();
		response.cache = sinon.stub();
		response.vary = sinon.stub();
		response.unvary = sinon.stub();
		response.unvaryAll = sinon.stub();
		response.locals = { flags: flags || {} };
		return subject(request, response);
	}

	describe('processing a valid story package ', () => {

		before(() => {

			resetStubs();

			stubs.fetchGraphQlData.returns(
				Promise.resolve(articlesStoryPackage)
			);
			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'}
			};

			return createInstance(options);

		});

		it('makes one call to next-api', () => {
			expect(stubs.fetchGraphQlData.callCount).to.equal(1);
		});

		it('maps the article model for each article returned', () => {
			expect(stubs.contentDecorator.callCount).to.equal(5);
		});

		it('gets the section for the story package', () => {
			expect(stubs.ReactServer.renderToStaticMarkup.callCount).to.equal(1);
		});

		it('sets surrogate-key', () => {
			expect(response._headers['surrogate-key']).to.equal('contentId:117bbe2c-9417-11e5-b190-291e94b77c8f contentId:79d6ce3a-93bd-11e5-bd82-c1fb87bef7af contentId:eecf7c4a-92d3-11e5-bd82-c1fb87bef7af contentId:64492528-91d2-11e5-94e6-c5413829caa5 contentId:6f8c134e-91d9-11e5-bd82-c1fb87bef7af');
		})

		it('should return an OK status code', () => {
			expect(response.statusCode).to.equal(200);
		});

	});

	describe('no article id provided', () => {

		before(() => {

			resetStubs();

			let options;

			options = {
				params: {}
			};

			return createInstance(options);

		});

		it('should return a 400 status code', () => {
			expect(response.statusCode).to.equal(400);
		});

	});

	describe('it passes through the count to the graphql query if set', () => {

		const expectedArgs = {
			uuid: '64492528-91d2-11e5-94e6-c5413829caa5',
			limit: 2
		}

		before(() => {

			resetStubs();

			let options;


			stubs.fetchGraphQlData.returns(
				Promise.resolve(articlesStoryPackage)
			);

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					count: '2'
				}
			};

			return createInstance(options);

		});

		it('it sends the right number of articles to ES', () => {
			const argsSent = stubs.fetchGraphQlData.getCall(0).args;
			expect(argsSent[1]).to.deep.equal(expectedArgs);
		});

	});

});
