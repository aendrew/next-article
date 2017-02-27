const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-article-found').docs[0]._source;
const fixtureBlog = require('../../fixtures/v3-elastic-article-found-blog').docs[0]._source;
const fixtureFastFT = require('../../fixtures/v3-elastic-article-found-fastft').docs[0]._source;
const fixturePremium = require('../../fixtures/v3-elastic-article-found-premium').docs[0]._source;
const fixtureWithTopper = require('../../fixtures/v3-elastic-article-found-topper').docs[0]._source;

const stubs = {
	onwardJourneyArticles: sinon.stub(),
	sampleArticles: sinon.stub(),
};
stubs.sampleArticles.isSampleArticle = sinon.stub();

const subject = proxyquire('../../../server/controllers/article', {
	'./article-helpers/onward-journey': stubs.onwardJourneyArticles,
	'../transforms/body': (articleHtml) => { return { html: () => articleHtml } },
	'../transforms/byline': data => data
});

describe('Article Controller', () => {

	let request;
	let response;
	let next;
	let result;

	function createInstance (params, flags, payload, internalContentPayload, asAnon) {
		next = sinon.stub();
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {}, anon: { userIsAnonymous: asAnon } };

		// node-mocks-http doesn't support this method
		response.unvaryAll = sinon.stub();

		return subject(request, response, next, payload || fixture, internalContentPayload);
	}

	context('success', () => {
		beforeEach(() => {
			stubs.onwardJourneyArticles.returns(Promise.resolve());

			result = null;

			return createInstance(null, { articleSuggestedRead: true }).then(() => {
				result = response._getRenderData()
			});
		});

		it('returns a successful response', () => {
			expect(next.callCount).to.equal(0);
			expect(response.statusCode).to.equal(200);
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

		it('does not add X-Robots-Tag headers for Methode articles', () => {
			return createInstance(null, { openGraph: true }, fixturePremium).then(() => {
				expect(response.getHeader('X-Robots-Tag')).to.be.undefined;
			});
		});

		it('has the correct description field', () => {
			expect(result.description).to.equal('Almost half of the world’s biggest financial groups have no board members with any tech experience');
		});

		it('has the correct canonical URL for an article', () => {
			expect(result.canonicalUrl).to.equal('https://www.ft.com/content/352210c4-7b17-11e5-a1fe-567b37f80b64');
		});

		it('has the correct canonical URL and X-Robots-Tag for a blog', () => {
			return createInstance(null, { openGraph: true }, fixtureBlog).then(() => {
				let result = response._getRenderData()
				expect(result.canonicalUrl).to.equal('http://blogs.ft.com/gavyndavies/2016/09/11/what-investors-should-know-about-r-star/');
				expect(response.getHeader('X-Robots-Tag')).to.equal('noindex');
			});
		});

		it('has the correct canonical URL and X-Robots-Tag for FastFT', () => {
			return createInstance(null, { openGraph: true }, fixtureFastFT).then(() => {
				let result = response._getRenderData()
				expect(result.canonicalUrl).to.equal('http://www.ft.com/fastft/2016/09/13/linde-cfo-denoke-out-a-day-after-praxair-deal-talks-end/');
				expect(response.getHeader('X-Robots-Tag')).to.equal('noindex');
			});
		});


		it('adds isPremium=false if article is not premium', () => {
			expect(result.isPremium).to.equal(false);
		});

	});

	context('fragment layout', () => {
		beforeEach(() => {
			result = null;

			return createInstance({ query: { fragment: 1 } }).then(() => {
				result = response._getRenderData()
			});
		});

		it('renders supports rendering with fragment layout', () => {
			expect(response._getRenderView()).to.equal('fragment');
		});
	});

	context('suggestions fail', () => {
		beforeEach(() => {
			stubs.onwardJourneyArticles.returns(Promise.reject());

			result = null;

			return createInstance(null, { articleSuggestedRead: true }).then(() => {
				result = response._getRenderData()
			});
		});

		it('returns a 50x', () => {
			expect(next.callCount).to.equal(1);
		});
	});

	context('Has rich journalism content', () => {

		it('sets the topper on the view model if flag is on', () => {
			return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(() => {
				let result = response._getRenderData();
				expect(result.topper.headline).to.equal('Mosul: Voices from a war zone');
				expect(result.topper.theme).to.equal('full-bleed-image-center');
				expect(result.topper.themeImageRatio).to.equal('full-bleed');
				expect(response.statusCode).to.equal(200);
			});
		});

		it('does not set topper if flag is off', () => {
			return createInstance(null, { articleTopper: false }, fixtureWithTopper).then(() => {
				let result = response._getRenderData()
				expect(result.topper).to.be.null;
				expect(response.statusCode).to.equal(200);
			});
		})

		it('does not accept topper with an unknown theme', () => {
			return createInstance(null, { articleTopper: true }, { metadata: [], topper: { theme: 'some-crazy-theme' }}).then(() => {
				let result = response._getRenderData()
				expect(result.topper).to.be.null;
				expect(response.statusCode).to.equal(200);
			});
		});;
	});

	context('article preview layout', () => {
		beforeEach(() => {
			result = null;

			return createInstance({ headers: { 'ft-access-preview': 'TRUE' }}, { inArticlePreview: true }, null, null, true).then(() => {
				result = response._getRenderData()
			});
		});

		it('renders with an inline barrier', () => {
			expect(result.inlineBarrier.shouldShow).to.equal(true);
		});

		it('will not render lightSignup if inArticlePreview flag is on', () => {
			expect(result.lightSignup.show).to.not.equal(true);
		});

	});


});
