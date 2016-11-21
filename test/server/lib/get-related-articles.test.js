const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const stubs = {
	getRelatedArticles: sinon.stub(),
	NoRelatedResultsException: sinon.stub(),
	logger: {
		default: {
			error: sinon.stub()
		}
	}
};
const subject = proxyquire('../../../server/lib/get-related-articles', {
	'./fetch-graphql-data': stubs.getRelatedArticles,
	'./no-related-results-exception': stubs.NoRelatedResultsException,
	'@financial-times/n-logger': {
		default: {
			error: stubs.logger.default.error
		}
	}
});

const resetStubs = () => {
	stubs.getRelatedArticles.reset();
	stubs.NoRelatedResultsException.reset();
};

const relatedArticles = { search:
	[
		{ id: '117bbe2c-9417-11e5-b190-291e94b77c8f' },
		{ id: '79d6ce3a-93bd-11e5-bd82-c1fb87bef7af' },
		{ id: 'eecf7c4a-92d3-11e5-bd82-c1fb87bef7af' },
		{ id: '64492528-91d2-11e5-94e6-c5413829caa5', parent: true },
		{ id: '6f8c134e-91d9-11e5-bd82-c1fb87bef7af' }
	]
};

describe('Get Related Articles', () => {

	let result;

	context('successful behaviour', () => {

		context('with a dupe of the parent', () => {

			beforeEach(() => {
				resetStubs();
				stubs.getRelatedArticles.returns(Promise.resolve(relatedArticles));
				return subject('AtagId', 4, '64492528-91d2-11e5-94e6-c5413829caa5')
				.then(res => result = res);
			});

			it('passes through the tag id and the count to the graphql query', () => {
				expect(stubs.getRelatedArticles.getCall(0).args[1]).to.deep.equal({tagId: 'AtagId', limit: 5});
			});

			it('dedupes the parent article from the list returned', () => {
				expect(result.length).to.equal(4);
				result.map(article => {
					expect(article.parent).to.not.exist;
				});
			});

		});

		context('with no parent dupe', () => {

			beforeEach(() => {
				resetStubs();
				stubs.getRelatedArticles.returns(Promise.resolve(relatedArticles));
				return subject('AtagId', 4, 'idthatisnotdupedintheresults')
				.then(res => result = res);
			});

			it('returns no more than requested in the count', () => {
				expect(result.length).equals(4);
			});

		});

	});

	context('error behaviour', () => {

		beforeEach(() => {
			resetStubs();
			stubs.getRelatedArticles.returns(Promise.resolve([]));
			return subject('AtagId', 'idthatisnotdupedintheresults', 4)
			.then(res => result = res);
		});

		it('throws an No Related Results Exception if no content returned', () => {
			expect(stubs.NoRelatedResultsException.callCount).to.equal(1);
			expect(result).to.deep.equal([]);
		});

	});

});
