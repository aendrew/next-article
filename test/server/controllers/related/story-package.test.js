const expect = require('chai').expect;

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const stubs = {
	api: {
		content: sinon.stub()
	},
	articleModel: sinon.stub(),
	ReactServer: {
		renderToStaticMarkup: sinon.stub()
	},
	getSection: sinon.stub()
};

const subject = proxyquire('../../../../server/controllers/related/story-package', {
	'next-ft-api-client': stubs.api,
	'ft-n-content-model': stubs.articleModel,
	'react-dom/server': stubs.ReactServer,
	'../../../config/sections': stubs.getSection
});

stubs.articleModel.returnsArg(0);
stubs.ReactServer.renderToStaticMarkup.returns('section');
stubs.getSection.returns('sectionProps');

const resetStubs = () => {
	stubs.api.content.reset();
	stubs.ReactServer.renderToStaticMarkup.reset();
	stubs.articleModel.reset();
	stubs.getSection.reset();
};

const articleIds = ['117bbe2c-9417-11e5-b190-291e94b77c8f',
'79d6ce3a-93bd-11e5-bd82-c1fb87bef7af',
'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af',
'64492528-91d2-11e5-94e6-c5413829caa5',
'6f8c134e-91d9-11e5-bd82-c1fb87bef7af'].join(',');

const articlesStoryPackage = [
	{id: '117bbe2c-9417-11e5-b190-291e94b77c8f', mainImage: true},
	{id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', mainImage: true},
	{id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af', mainImage: true},
	{id: '64492528-91d2-11e5-94e6-c5413829caa5', mainImage: true},
	{id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', mainImage: true}
];


describe('Story Package', () => {

	let request;
	let response;
	let options;

	function createInstance(options, flags) {
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

			stubs.api.content.returns(
				Promise.resolve(articlesStoryPackage)
			);
			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					articleIds: articleIds,
					count: '5'
				}
			};

			return createInstance(options);

		});

		it('makes one call to ES', () => {
			expect(stubs.api.content.callCount).to.equal(1);
		});

		it('maps the article model for each article returned', () => {
			expect(stubs.articleModel.callCount).to.equal(5);
		});

		it('gets the section for the story package', () => {
			expect(stubs.ReactServer.renderToStaticMarkup.callCount).to.equal(1);
		});

		it('should return an OK status code', () => {
			expect(response.statusCode).to.equal(200);
		});

	});

	describe('no article ids provided', () => {

		before(() => {

			resetStubs();

			let options;

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					count: '5'
				}
			};

			return createInstance(options);

		});

		it('should return a 400 status code', () => {
			expect(response.statusCode).to.equal(400);
		});

	});

	describe('count set to fewer than number of articles', () => {

		const expectedContentArgs = {
			index: 'v3_api_v2',
			uuid: ['117bbe2c-9417-11e5-b190-291e94b77c8f',
			'79d6ce3a-93bd-11e5-bd82-c1fb87bef7af']
		}

		before(() => {

			resetStubs();

			let options;


			stubs.api.content.returns(
				Promise.resolve(articlesStoryPackage)
			);

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					articleIds: articleIds,
					count: '2'
				}
			};

			return createInstance(options);

		});

		it('it sends the right number of articles to ES', () => {
			expect(stubs.api.content.calledWithExactly(expectedContentArgs)).to.be.true;
		});

	});

	describe('converting an even number of articles to odd for display', () => {

		before(() => {

			resetStubs();

			let options;


			stubs.api.content.returns(
				Promise.resolve(articlesStoryPackage.slice(0,4))
			);

			options = {
				params: {id: '64492528-91d2-11e5-94e6-c5413829caa5'},
				query: {
					articleIds: articleIds,
					count: '4'
				}
			};

			return createInstance(options);

		});

		it('it sends the right number of articles to ES', () => {
			expect(stubs.articleModel.callCount).to.equal(3);
		});

	});

});
