const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-article-found').docs[0]._source;
const fixtureBlog = require('../../fixtures/v3-elastic-article-found-blog').docs[0]._source;
const fixtureFastFT = require('../../fixtures/v3-elastic-article-found-fastft').docs[0]._source;
const fixtureWithTopper = require('../../fixtures/v3-elastic-article-found-topper').docs[0]._source;
const fixtureWithNewPackageModel = require('../../fixtures/v3-elastic-article-found-new-package-model').docs[0]._source;

const stubs = {
	onwardJourneyArticles: sinon.stub(),
	sampleArticles: sinon.stub(),
};

stubs.sampleArticles.isSampleArticle = sinon.stub();

const subject = proxyquire('../../../server/model/article', {
	'./article-helpers/onward-journey': stubs.onwardJourneyArticles,
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

	});

	context('Has rich journalism content', () => {

		it('sets the topper on the view model if flag is on', () => {
			return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(result => {
				expect(result.topper.headline).to.equal('Mosul: Voices from a war zone');
				expect(result.topper.layout).to.equal('full-bleed-image-center');
				expect(result.topper.themeImageRatio).to.equal('full-bleed');
			});
		});

		it('does not set topper if flag is off', () => {
			return createInstance(null, { articleTopper: false }, fixtureWithTopper).then(result => {
				expect(result.topper.layout).to.equal('branded');
				expect(result.topper.template).to.equal('basic');
			});
		})

		it('does not accept topper with an unknown theme', () => {
			return createInstance(null, { articleTopper: true }, { metadata: [], topper: { theme: 'some-crazy-theme' }}).then(result => {
				expect(result.topper.layout).to.equal(null);
				expect(result.topper.template).to.equal('basic');
			});
		});

		context('images', () => {
			it('are set by article lead images field', () => {
				return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(result => {
					expect(result.topper.images.length).to.equal(3);
				});
			});
		});

		context('layout', () => {
			it('is set by topper layout field', () => {
				return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(result => {
					expect(result.topper.layout).to.equal('branded');
				});
			});
		});

		context('background colour', () => {
			it('is set to pink if theme is full-bleed-offset', () => {
				return createInstance(null, { articleTopper: true }, { metadata: [], topper: { theme: 'full-bleed-offset' }}).then(result => {
					expect(result.topper.backgroundColour).to.equal('pink');
				});
			});

			it('is set to pink if no backgroundColour', () => {
				return createInstance(null, { articleTopper: true }, { metadata: [], topper: { theme: 'split-text-left' }}).then(result => {
					expect(result.topper.backgroundColour).to.equal('pink');
				});
			});

			it('is set by editorial if theme is not full-bleed-offset', () => {
				return createInstance(null, { articleTopper: true }, fixtureWithTopper).then(result => {
					expect(result.topper.backgroundColour).to.equal('warm-1');
				});
			});

			it('is set to slate if package theme is \'extra\'', () => {
				return createInstance(null, { contentPackages: true }, fixtureWithTopper).then(result => {
					expect(result.topper.backgroundColour).to.equal('slate');
				});
			});

			it('is set to warm-1 if package theme is \'basic\'', () => {
				return createInstance(null, { contentPackages: true }, fixtureWithNewPackageModel).then(result => {
					expect(result.topper.backgroundColour).to.equal('warm-1');
					expect(result.topper.backgroundColour).to.equal('warm-1');
				});
			});
		});
	});

});
