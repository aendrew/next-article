const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const subject = proxyquire('../../../../server/controllers/article-helpers/read-next', {
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
	{id: 'aff90924-5a01-11e5-9846-de406ccb37f2', lastPublished: '2015-10-10T04:53:24Z', source: 'primaryTag'},
	{id: '3186f3dc-5310-11e5-b029-b9d50a74fd14', lastPublished: '2015-08-10T04:53:24Z', source: 'primaryTag'},
	{id: '8dfcd43e-507b-11e5-b029-b9d50a74fd14', lastPublished: '2015-07-10T04:53:24Z', source: 'primaryTag'},
	{id: 'e9b56844-4ece-11e5-b029-b9d50a74fd14', lastPublished: '2015-06-10T04:53:24Z', source: 'primaryTag'},
	{id: '066a5068-4d98-11e5-b558-8a9722977189', lastPublished: '2015-05-10T04:53:24Z', source: 'primaryTag'}
];

describe('Read next', function () {

	let readNext;

	context('Parent has a story package, but Topic article more recent than parent', function () {

		before(() => {
			readNext = subject(primaryTagArticles, storyPackageArticles, '2015-09-10T18:32:34.000Z')
		});

		it('read next should be based on topic as more recent', function () {
			expect(readNext.id).to.equal(primaryTagArticles[0].id);
		});

		it('should flag the read next article as more recent than the parent', function () {
			expect(readNext.moreRecent).to.be.true;
		});

	});

	describe('Parent has a story package, Topic articles older than parent', function () {

		before(() => {
			readNext = subject(primaryTagArticles, storyPackageArticles, '2015-11-10T18:32:34.000Z')
		});

		it('read next should be based on story package as topic not more recent than parent', function () {
			expect(readNext.id).to.equal(storyPackageArticles[0].id);
		});

		it('should not flag the read next article as more recent than the parent', function () {
			expect(readNext.moreRecent).to.not.exist;
		});

	});

	describe('Parent has no story package, Topic article more recent than parent', function () {

		before(() => {
			readNext = subject(primaryTagArticles, [], '2015-09-10T18:32:34.000Z')
		});

		it('read next should be based on topic as no story package', function () {
			expect(readNext.id).to.equal(primaryTagArticles[0].id);
		});

		it('should flag the read next article as more recent than the parent', function () {
			expect(readNext.moreRecent).to.be.true;
		});

	});

	describe('Parent has no story package, Topic articles older than parent', function () {

		before(() => {
			readNext = subject(primaryTagArticles, [], '2015-11-10T18:32:34.000Z')
		});

		it('read next should be based on topic as no story package', function () {
			expect(readNext.id).to.equal(primaryTagArticles[0].id);
		});

		it('should not flag the read next article as more recent than the parent', function () {
			expect(readNext.moreRecent).to.not.exist;
		});

	});

});
