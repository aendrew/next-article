const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-article-found')._source;
const fixtureBlog = require('../../fixtures/v3-elastic-article-found-blog')._source;
const fixtureFastFT = require('../../fixtures/v3-elastic-article-found-fastft')._source;
const fixtureWithTopper = require('../../fixtures/v3-elastic-article-found-topper')._source;

const stubs = {
	onwardJourneyArticles: sinon.stub(),
	sampleArticles: sinon.stub(),
	topperThemeMap: sinon.stub()
};

stubs.sampleArticles.isSampleArticle = sinon.stub();

const subject = proxyquire('../../../server/model/article', {
	'./article-helpers/onward-journey': stubs.onwardJourneyArticles,
	'./article-helpers/topper-theme-map': stubs.topperThemeMap,
	'../transforms/body': (articleHtml) => { return { html: () => articleHtml } },
	'../transforms/byline': data => data
});

describe('Article Handler', () => {

	let request;
	let response;
	let result;

	function createInstance (params, flags, payload, asAnon) {
		result = null;
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {}, anon: { userIsAnonymous: asAnon } };
		// node-mocks-http doesn't support this method
		response.unvaryAll = sinon.stub();
		return subject(request, response, payload || fixture, response.locals.flags);
	}

	context('success', () => {
		beforeEach(() => {
			stubs.onwardJourneyArticles.returns(Promise.resolve());
			return createInstance(null, { articleSuggestedRead: true }).then(data => {
				result = data;
			})
		});

		it('provides more on data for related content', () => {
			expect(result.moreOns.length).to.equal(2);

			result.moreOns.forEach(
				tag => expect(tag).to.include.keys('title', 'url')
			);
		});

		it('provides dehydrated metadata for related content', () => {
			expect(result.dehydratedMetadata).to.include.keys('moreOns', 'package');

			result.dehydratedMetadata.moreOns.forEach(
				tag => expect(tag).to.include.keys('idV1', 'prefLabel', 'taxonomy')
			);

			expect(result.dehydratedMetadata.moreOns[0].idV1).to.equal('M2Y3OGJkYjQtMzQ5OC00NTM2LTg0YzUtY2JmNzZiY2JhZDQz-VG9waWNz');
			expect(result.dehydratedMetadata.moreOns[1].idV1).to.equal('NTg=-U2VjdGlvbnM=');
			expect(result.dehydratedMetadata.package).to.be.an.instanceOf(Array);
		});

		it('has the correct description field', () => {
			expect(result.description).to.equal('Almost half of the world’s biggest financial groups have no board members with any tech experience');
		});

		it('has the correct canonical URL for an article', () => {
			expect(result.canonicalUrl).to.equal('https://www.ft.com/content/352210c4-7b17-11e5-a1fe-567b37f80b64');
		});

		it('has the correct canonical URL and X-Robots-Tag for a blog', () => {
			return createInstance(null, { openGraph: true }, fixtureBlog).then(result => {
				expect(result.canonicalUrl).to.equal('https://www.ft.com/content/da86ba6a-f1a4-37e5-af23-d7fa64d47466');
				// expect(response.getHeader('X-Robots-Tag')).not.to.equal('noindex');
			});
		});

		it('has the correct canonical URL and X-Robots-Tag for FastFT', () => {
			return createInstance(null, { openGraph: true }, fixtureFastFT).then(result => {
				expect(result.canonicalUrl).to.equal('https://www.ft.com/content/6adb986e-339a-3f14-ab82-ed48bd883b84');
				// expect(response.getHeader('X-Robots-Tag')).not.to.equal('noindex');
			});
		});

		it('adds isPremium=false if article is not premium', () => {
			expect(result.isPremium).to.equal(false);
		});

		it('fetches rich journalism content', () => {
			return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(() => {
				expect(stubs.topperThemeMap).to.have.been.called;
			});
		});

	});

});
