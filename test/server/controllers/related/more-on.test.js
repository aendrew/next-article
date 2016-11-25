const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const stubs = {
	getRelatedArticles: sinon.stub()
};
const subject = proxyquire('../../../../server/controllers/related/more-on', {
	'../../lib/get-related-articles': stubs.getRelatedArticles
});

const resetStubs = () => {
	stubs.getRelatedArticles.reset();
};

const articlesMoreOnOne = [
	{ id: '117bbe2c-9417-11e5-b190-291e94b77c8f' },
	{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af' },
	{ id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af' },
	{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af' },
	{ id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af' }
];
const articlesMoreOnTwo = [
	{ id: '34afedae-92f1-11e5-9e3e-eb48769cecab', moreOnTwo: true },
	{ id: '42b8ab40-93cb-11e5-9e3e-eb48769cecab', moreOnTwo: true },
	{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
	{ id: '3f4f748a-9375-11e5-9e3e-eb48769cecab', moreOnTwo: true },
	{ id: 'cd24b80e-92c8-11e5-94e6-c5413829caa5', moreOnTwo: true },
	{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
	{ id: '5149fd6a-91fc-11e5-bd82-c1fb87bef7af', dupe: true, moreOnTwo: true },
	{ id: 'c7baeed0-91f9-11e5-94e6-c5413829caa5', moreOnTwo: true },
	{ id: '915fe6b6-91c6-11e5-bd82-c1fb87bef7af', moreOnTwo: true },
	{ id: 'cd99c5f0-91b9-11e5-94e6-c5413829caa5', moreOnTwo: true }
];
const articlesMoreOnThree = [
	{ id: '34afedae-92f1-11e5-9e3e-eb48769cecab', dupe: true, moreOnThree: true },
	{ id: '42b8ab40-93cb-11e5-9e3e-eb48769aaaaa', moreOnThree: true },
	{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true },
	{ id: '3f4f748a-9375-11e5-9e3e-eb48769cecab', dupe: true, moreOnThree: true },
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
	{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af', dupe: true, moreOnThree: true }
];

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
		response.render = sinon.stub();
		return subject(request, response);
	}

	describe('first more on', () => {

		before(() => {

			resetStubs();

			stubs.getRelatedArticles.returns(
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

		it('call makes one call to get-related-articles module', () => {
			expect(stubs.getRelatedArticles.callCount).to.eql(1);
		});

		it('sets surrogate-key', () => {
			expect(response._headers['surrogate-key']).to.equal('idV1:TnN0ZWluX0dMX0FS-R0w= idV1:MjY=-U2VjdGlvbnM=');
		})

	});

	describe('second more-on', () => {

		before(() => {

			resetStubs();

			let options;

			stubs.getRelatedArticles.onCall(0).returns(Promise.resolve(articlesMoreOnOne));
			stubs.getRelatedArticles.onCall(1).returns(Promise.resolve(articlesMoreOnTwo));

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

		it('call makes two calls to get-related-articles module', () => {
			expect(stubs.getRelatedArticles.callCount).to.equal(2);
		});

		context('items that are output', () => {

			it('return 5 articles per more-on', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				expect(moreOnItems.length).to.equal(5);
			});

			it('it should dedupe articles between more-ons', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				moreOnItems.map(article => expect(article.dupe).to.not.exist);
			});

			it('it should only return articles appropriate to the tag ID', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				moreOnItems.map(article => expect(article.moreOnTwo).to.be.true);
			});

		});

		it('sets surrogate-key', () => {
			expect(response._headers['surrogate-key']).to.equal('idV1:TnN0ZWluX0dMX0FS-R0w= idV1:MjY=-U2VjdGlvbnM=');
		})

	});

	describe('third more-on', () => {

		before(() => {

			resetStubs();

			let options;

			stubs.getRelatedArticles.onCall(0).returns(Promise.resolve(articlesMoreOnOne));
			stubs.getRelatedArticles.onCall(1).returns(Promise.resolve(articlesMoreOnTwo));
			stubs.getRelatedArticles.onCall(2).returns(Promise.resolve(articlesMoreOnThree));

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
			expect(stubs.getRelatedArticles.callCount).to.equal(3);
		});

		context('items that are output', () => {

			it('return 5 articles per more-on', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				expect(moreOnItems.length).to.equal(5);
			});

			it('should not contain the parent article', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				moreOnItems.map(article => expect(article.parent).to.not.exist);
			});

			it('should dedupe articles between more-ons', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				moreOnItems.map(article => expect(article.dupe).to.not.exist);
			});

			it('should only return articles appropriate to the tag ID', () => {
				const moreOnItems = response.render.getCall(0).args[1].items;
				moreOnItems.map(article => expect(article.moreOnThree).to.be.true);
			});

		});

		it('sets surrogate-key', () => {
			expect(response._headers['surrogate-key']).to.equal('idV1:TnN0ZWluX0dMX0FS-R0w= idV1:MjY=-U2VjdGlvbnM= idV1:Th1rdM0re0n1D=');
		})

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

		before(() => {

			resetStubs();

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
			expect(stubs.getRelatedArticles.calledWithExactly('TnN0ZWluX0dMX0FS-R0w=', 11, '64492528-91d2-11e5-94e6-c5413829caa5')).to.be.true;
		});

	});

});
