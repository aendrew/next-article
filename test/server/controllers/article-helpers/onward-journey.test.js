const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const stubs = {
	fetchGraphqlData: sinon.stub(),
	readNext: sinon.stub(),
	suggestedReads: sinon.stub()
};

const subject = proxyquire('../../../../server/controllers/article-helpers/onward-journey', {
	'../../lib/fetch-graphql-data': stubs.fetchGraphqlData,
	'./read-next': stubs.readNext,
	'./suggested': stubs.suggestedReads,
	'@financial-times/n-content-decorator': (article) => article
});

const storyPackageArticles = [
	{id: 'aff90924-5a01-11e5-9846-de406ccb37f2', source: 'storyPackage'},
	{id: '3186f3dc-5310-11e5-b029-b9d50a74fd14', source: 'storyPackage'},
	{id: '8dfcd43e-507b-11e5-b029-b9d50a74fd14', source: 'storyPackage'},
	{id: 'e9b56844-4ece-11e5-b029-b9d50a74fd14', source: 'storyPackage'},
	{id: '066a5068-4d98-11e5-b558-8a9722977189', source: 'storyPackage'}
];

const primaryTagArticles = [
		{id: 'a581b44e-5acb-11e5-a28b-50226830d644', parent: true},
		{id: 'aff90924-5a01-11e5-9846-de406ccb37f2', source: 'primaryTag'},
		{id: '3186f3dc-5310-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
		{id: '8dfcd43e-507b-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
		{id: 'e9b56844-4ece-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
		{id: '066a5068-4d98-11e5-b558-8a9722977189', source: 'primaryTag'}
];

const articleId = 'a581b44e-5acb-11e5-a28b-50226830d644';

const fixture = {
	article: {
		primaryTag: {
			latestContent: primaryTagArticles
		},
		storyPackage: storyPackageArticles
	}
};

const publishedDate = '2015-09-10T18:32:34.000Z';

describe('Onward Journey', () => {

	let result;

	beforeEach(() => {
		stubs.fetchGraphqlData.reset();
		stubs.readNext.reset();
		stubs.suggestedReads.reset();
		stubs.fetchGraphqlData.returns(Promise.resolve(fixture));
		stubs.readNext.returns('readNext');
		stubs.suggestedReads.returns('suggestedReads');
		return subject(articleId, publishedDate)
			.then(res => result = res);
	});

	it('Fetches the data from next-api', () => {
		expect(stubs.fetchGraphqlData.calledOnce).to.be.true;
	});

	it('dedupes the parent article from the topic articles', () => {
		const topicArticles = stubs.readNext.getCall(0).args[0];
		topicArticles.map(article => {
			expect(article.id).to.not.equal(articleId);
		});
	});

	it('calls the read next helper', () => {
		expect(stubs.readNext.calledOnce).to.be.true;
	});

	it('calls the suggested reads helper', () => {
		expect(stubs.suggestedReads.calledOnce).to.be.true;
	});

	it('returns the readNext and suggestedReads', () => {
		expect(result).to.have.keys(['readNext', 'suggestedReads']);
	});

});
