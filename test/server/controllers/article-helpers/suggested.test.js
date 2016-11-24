const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const subject = proxyquire('../../../../server/controllers/article-helpers/suggested', {
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
	{id: 'aff90924-5a01-11e5-9846-de406ccb37f2', source: 'primaryTag'},
	{id: '3186f3dc-5310-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
	{id: '8dfcd43e-507b-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
	{id: 'e9b56844-4ece-11e5-b029-b9d50a74fd14', source: 'primaryTag'},
	{id: '066a5068-4d98-11e5-b558-8a9722977189', source: 'primaryTag'}
];

describe('Suggested reads', () => {

	let suggestedReads;

	context('Parent has a story package of 5 articles', () => {

		it('all suggested reads are sourced from the story package', () => {
			suggestedReads = subject(primaryTagArticles, storyPackageArticles);
			suggestedReads.map((article) => {
				expect(article.source).to.equal('storyPackage');
			})
		});

	});

	context('Parent has a story package but too small to populate suggested reads', () => {

		it('all suggested reads are sourced from the story package', () => {
			suggestedReads = subject(primaryTagArticles, storyPackageArticles.slice(0,2));
			suggestedReads.slice(0, 2).map((article) => {
				expect(article.source).to.equal('storyPackage');
			})
			suggestedReads.slice(2, 5).map((article) => {
				expect(article.source).to.equal('primaryTag');
			});
		});

	});

	context('Parent has no story package', () => {

		it('all suggested reads are sourced from the primary tag', () => {
			suggestedReads = subject(primaryTagArticles, []);
			suggestedReads.map((article) => {
				expect(article.source).to.equal('primaryTag');
			})
		});

	});

});
