const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');
const relatedContentQuery = require('../../../../server/graphql-queries/related-content');

const stubs = {
	api: sinon.stub(),
	ReactServer: {
		renderToStaticMarkup: sinon.stub()
	},
	contentDecorator: sinon.stub(),
	getSection: sinon.stub()
};
const subject = proxyquire('../../../../server/controllers/related/more-on', {
	'../../lib/fetch-graphql-data': stubs.api,
	'@financial-times/n-content-decorator': stubs.contentDecorator,
	'react-dom/server': stubs.ReactServer,
	'../../../config/sections': stubs.getSection
});

stubs.contentDecorator.returnsArg(0);
stubs.ReactServer.renderToStaticMarkup.returns('section');
stubs.getSection.returns('sectionProps');

const resetStubs = () => {
	stubs.api.reset();
	stubs.ReactServer.renderToStaticMarkup.reset();
	stubs.contentDecorator.reset();
	stubs.getSection.reset();
};

const articlesMoreOnOne = {
	search: [
		{ id: '117bbe2c-9417-11e5-b190-291e94b77c8f', mainImage: true },
		{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', mainImage: true },
		{ id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af' },
		{ id: '64492528-91d2-11e5-94e6-c5413829caa5', parent: true },
		{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af' },
		{ id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af' }
	]
};
const articlesMoreOnTwo = {
	search: [
		{ id: '34afedae-92f1-11e5-9e3e-eb48769cecab', moreOnTwo: true },
		{ id: '42b8ab40-93cb-11e5-9e3e-eb48769cecab', mainImage: true, moreOnTwo: true },
		{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
		{ id: '3f4f748a-9375-11e5-9e3e-eb48769cecab', moreOnTwo: true },
		{ id: '64492528-91d2-11e5-94e6-c5413829caa5', parent: true, moreOnTwo: true },
		{ id: 'cd24b80e-92c8-11e5-94e6-c5413829caa5', moreOnTwo: true },
		{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
		{ id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
		{ id: 'c7baeed0-91f9-11e5-94e6-c5413829caa5', moreOnTwo: true },
		{ id: '915fe6b6-91c6-11e5-bd82-c1fb87bef7af', moreOnTwo: true },
		{ id: 'cd99c5f0-91b9-11e5-94e6-c5413829caa5', moreOnTwo: true }
	]
};
const articlesMoreOnThree = {
	search: [
		{ id: '34afedae-92f1-11e5-9e3e-eb48769cecab', dupe: true, moreOnThree: true },
		{ id: '42b8ab40-93cb-11e5-9e3e-eb48769aaaaa', mainImage: true, moreOnThree: true },
		{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
		{ id: '3f4f748a-9375-11e5-9e3e-eb48769cecab', dupe: true, moreOnThree: true },
		{ id: '64492528-91d2-11e5-94e6-c5413829caa5', parent: true, moreOnThree: true },
		{ id: 'cd24b80e-92c8-11e5-94e6-c5413829aaaa', moreOnThree: true },
		{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
		{ id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
		{ id: 'c7baeed0-91f9-11e5-94e6-c5413829caa5', dupe: true, moreOnThree: true },
		{ id: '915fe6b6-91c6-11e5-bd82-c1fb87beaaaa', moreOnThree: true },
		{ id: 'cd99c5f0-91b9-11e5-94e6-c5413829aaaa', moreOnThree: true },
		{ id: '117bbe2c-9417-11e5-b190-291e94b77c8f', dupe: true, moreOnThree: true },
		{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87beaaaa', moreOnThree: true },
		{ id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
		{ id: '64492528-91d2-11e5-94e6-c5413829aaaa', moreOnThree: true },
		{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
		{ id: '5149fd6a-91fc-11e5-bd82-c1fb87beaaaa', moreOnThree: true }
	]
};

describe('More Ons', () => {

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

	describe('first more on', () => {

		before(() => {

			resetStubs();

			stubs.api.returns(
				Promise.resolve(articlesMoreOnOne)
			);
			options = {
				params: { id: '64492528-91d2-11e5-94e6-c5413829caa5' },
				query: {
					tagIds: 'TnN0ZWluX0dMX0FS-R0w=,MjY=-U2VjdGlvbnM=',
					count: '5',
					index: '0'
				}
			};

			return createInstance(options);

		});

		it('call makes one call to fetch-graphql-data module', () => {
			expect(stubs.api.callCount).to.eql(1);
		});

		it('return 5 articles per more-on', () => {
			expect(stubs.contentDecorator.callCount).to.equal(5);
		});

		it('should not contain the parent article', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.parent).to.not.exist;
			}
		});

		it('should get the section setup', () => {
			expect(stubs.getSection.calledOnce).to.be.true;
		});

		it('should use react to render the section to static html', () => {
			expect(stubs.ReactServer.renderToStaticMarkup.calledOnce).to.be.true;
		});

	});

	describe('second more-on', () => {

		before(() => {

			resetStubs();

			let options;

			stubs.api.onCall(0).returns(Promise.resolve(articlesMoreOnOne));
			stubs.api.onCall(1).returns(Promise.resolve(articlesMoreOnTwo));

			options = {
				params: { id: '64492528-91d2-11e5-94e6-c5413829caa5' },
				query: {
					tagIds: 'TnN0ZWluX0dMX0FS-R0w=,MjY=-U2VjdGlvbnM=',
					count: '5',
					index: '1'
				}
			};

			return createInstance(options);

		});

		it('call makes two calls to fetch-graphql-data module', () => {
			expect(stubs.api.callCount).to.equal(2);
		});

		it('return 5 articles per more-on', () => {
			expect(stubs.contentDecorator.callCount).to.equal(5);
		});

		it('it should not contain the parent article', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.parent).to.not.exist;
			}
		});

		it('it should dedupe articles between more-ons', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.dupe).to.not.exist;
			}
		});

		it('it should only return articles appropriate to the tag ID', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.moreOnTwo).to.be.true;
			}
		});

	});

	describe('third more-on', () => {

		before(() => {

			resetStubs();

			let options;

			stubs.api.onCall(0).returns(Promise.resolve(articlesMoreOnOne));
			stubs.api.onCall(1).returns(Promise.resolve(articlesMoreOnTwo));
			stubs.api.onCall(2).returns(Promise.resolve(articlesMoreOnThree));

			options = {
				params: { id: '64492528-91d2-11e5-94e6-c5413829caa5' },
				query: {
					tagIds: 'TnN0ZWluX0dMX0FS-R0w=,MjY=-U2VjdGlvbnM=,Th1rdM0re0n1D=',
					count: '5',
					index: '2'
				}
			};

			return createInstance(options);

		});

		it('call makes three calls to fetch-graphql-data module', () => {
			expect(stubs.api.callCount).to.equal(3);
		});

		it('return 5 articles per more-on', () => {
			expect(stubs.contentDecorator.callCount).to.equal(5);
		});

		it('should not contain the parent article', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.parent).to.not.exist;
			}
		});

		it('should dedupe articles between more-ons', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.dupe).to.not.exist;
			}
		});

		it('should only return articles appropriate to the tag ID', () => {
			for (let articleCount = 1; articleCount < stubs.contentDecorator.callCount; articleCount++) {
				const article = stubs.contentDecorator.getCall(articleCount).args[0];
				expect(article.moreOnThree).to.be.true;
			}
		});

		it('should get the section setup', () => {
			expect()
		});

	});

	describe('limiting the number of more-ons that can be requested', () => {

		before(() => {

			let options;

			options = {
				params: { id: '64492528-91d2-11e5-94e6-c5413829caa5' },
				query: {
					tagIds: 'F1r5t,S3c0nd,Th1rd,F0urth,F1fth,S1xth',
					count: '5',
					index: '5'
				}
			};

			return createInstance(options);

		});

		it('should return an error if an index higher than 4 is requested', () => {
			expect(response.statusCode).to.equal(400);
		});

	});

	describe('limiting the number of articles per more on', () => {

		let expectedFetchGraphQlDataArgs = { tagId: 'TnN0ZWluX0dMX0FS-R0w=', limit: 11 };

		before(() => {

			resetStubs();

			stubs.api.returns(Promise.resolve(articlesMoreOnOne));

			options = {
				params: { id: '64492528-91d2-11e5-94e6-c5413829caa5' },
				query: {
					tagIds: 'TnN0ZWluX0dMX0FS-R0w=',
					count: '12',
					index: '0'
				}
			};

			return createInstance(options);
		});

		it('should limit the request to 10 (+ 1 for deduping purposes) if more than 10 articles per more on are requested', () => {
			expect(stubs.api.calledWithExactly(relatedContentQuery, expectedFetchGraphQlDataArgs)).to.be.true;
		});

	});

});
