require('chai').should();
const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const stubs = {
	fetchGraphqlData: sinon.stub()
};

const subject = proxyquire('../../../../server/controllers/article-helpers/read-next', {
	'../../lib/fetch-graphql-data': stubs.fetchGraphqlData,
	'@financial-times/n-content-decorator': (article) => article
});

const fixtures = {
	withStoryPackage: {
		article: {
			primaryTag: {
				latestContent: [
					{
						id: '9a2b7608-5746-11e5-9846-de406ccb37f2',
						lastPublished: '2015-10-10T17:18:07.000Z'
					},
					{
						id: '9a2b7608-5746-11e5-9846-de406XXXXXXX',
						lastPublished: '2015-04-10T17:18:07.000Z'
					}
				]
			},
			storyPackage: [
				{
					id: '41129eec-5b9d-11e5-a28b-50226830d644',
					lastPublished: '2015-09-16T11:44:13.000Z'
				}
			]
		}
	},
	noStoryPackage: {
		article: {
			primaryTag: {
				latestContent: [
					{
						id: '9a2b7608-5746-11e5-9846-de406ccb37f2',
						lastPublished: '2015-10-10T17:18:07.000Z'
					},
					{
						id: '9a2b7608-5746-11e5-9846-de406XXXXXXX',
						lastPublished: '2015-04-10T17:18:07.000Z'
					}
				]
			},
			storyPackage: []
		}
	}
};

describe('Read next', function () {

	let results;

	describe('Parent has a story package, but Topic article more recent than parent', function () {

		before(function () {
			stubs.fetchGraphqlData.reset();
			stubs.fetchGraphqlData.returns(Promise.resolve(fixtures.withStoryPackage));
			return subject('xxxxxxxxxxxx', '2015-09-10T18:32:34.000Z')
				.then(result => results = result);
		});

		it('read next should be based on topic as more recent', function () {
			expect(results.id).to.equal(fixtures.withStoryPackage.article.primaryTag.latestContent[0].id);
		});

		it('should flag the read next article as more recent than the parent', function () {
			expect(results.moreRecent).to.be.true;
		});

	});

	describe('Parent has a story package, Topic articles older than parent', function () {

		before(function () {
			stubs.fetchGraphqlData.reset();
			stubs.fetchGraphqlData.returns(Promise.resolve(fixtures.withStoryPackage));
			return subject('xxxxxxxxxxxx', '2015-11-10T18:32:34.000Z')
				.then(result => results = result);
		});

		it('read next should be based on story package as topic not more recent than parent', function () {
			expect(results.id).to.equal(fixtures.withStoryPackage.article.storyPackage[0].id);
		});

		it('should not flag the read next article as more recent than the parent', function () {
			expect(results.moreRecent).to.not.exist;
		});

	});

	describe('Parent has no story package, Topic article more recent than parent', function () {

		before(function () {
			stubs.fetchGraphqlData.reset();
			stubs.fetchGraphqlData.returns(Promise.resolve(fixtures.noStoryPackage));
			return subject('xxxxxxxxxxxx', '2015-09-10T18:32:34.000Z')
				.then(result => results = result);
		});

		it('read next should be based on topic as no story package', function () {
			expect(results.id).to.equal(fixtures.noStoryPackage.article.primaryTag.latestContent[0].id);
		});

		it('should flag the read next article as more recent than the parent', function () {
			expect(results.moreRecent).to.be.true;
		});

	});

	describe('Parent has no story package, Topic articles older than parent', function () {

		before(function () {
			stubs.fetchGraphqlData.reset();
			stubs.fetchGraphqlData.returns(Promise.resolve(fixtures.noStoryPackage));
			return subject('xxxxxxxxxxxx', '2015-11-10T18:32:34.000Z')
				.then(result => results = result);
		});

		it('read next should be based on topic as no story package', function () {
			expect(results.id).to.equal(fixtures.noStoryPackage.article.primaryTag.latestContent[0].id);
		});

		it('should not flag the read next article as more recent than the parent', function () {
			expect(results.moreRecent).to.not.exist;
		});

	});

	describe('Deduping parent from most recent primaryTag articles', () => {

		before(function () {
			stubs.fetchGraphqlData.reset();
			stubs.fetchGraphqlData.returns(Promise.resolve(fixtures.noStoryPackage));
			return subject('9a2b7608-5746-11e5-9846-de406ccb37f2', '2015-09-10T18:32:34.000Z')
				.then(result => results = result);
		});

		it('read next should be based on topic as more recent', function () {
			expect(results.id).to.equal(fixtures.withStoryPackage.article.primaryTag.latestContent[1].id);
		});

		it('should not flag the read next article as more recent than the parent', function () {
			expect(results.moreRecent).to.not.exist;
		});

	});

});
