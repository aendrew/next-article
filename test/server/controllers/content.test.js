const nock = require('nock');
const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixtureInteractives = require('../../fixtures/interactive-graphics');
const fixturePodcast = require('../../fixtures/v3-elastic-podcast-found');
const fixtureArticle = require('../../fixtures/v3-elastic-article-found');
const fixtureNotFound = require('../../fixtures/v3-elastic-not-found');
// const fixturePremium = require('../../fixtures/v3-elastic-article-found-premium').docs[0]._source;

const fixtureOnwardJourney = require('../../fixtures/onward-journey');
const fixtureOnwardJourneyInPackage = require('../../fixtures/onward-journey-in-package');

const dependencyStubs = {
	igPoller: { getData: () => fixtureInteractives },
	podcast: sinon.spy(),
	video: sinon.spy(),
	article: sinon.spy(),
	interactive: sinon.spy(),
	falconUrl: sinon.stub(),
	onwardJourney: sinon.stub(),
	modelHandler: sinon.stub()
};

nock.disableNetConnect();

const subject = proxyquire('../../../server/controllers/content', {
	'../lib/ig-poller': dependencyStubs.igPoller,
	'./article-helpers/falcon-url': dependencyStubs.falconUrl,
	'../model': {getHandler: dependencyStubs.modelHandler},
	'./article-helpers/onward-journey': dependencyStubs.onwardJourney
});

describe('Content Controller', function () {

	let request;
	let response;
	let next;

	function createInstance (params, flags) {
		next = sinon.stub();
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		// node-mocks-http doesn't support this method
		response.unvaryAll = sinon.stub();
		return subject(request, response, next);
	}

	it('sets surrogate-key', () => {
		createInstance({
			params: {
				id: '012f81d6-2e2b-11e5-8873-775ba7c2ea3d'
			}
		});
		expect(response._headers['surrogate-key']).to.equal('contentUuid:012f81d6-2e2b-11e5-8873-775ba7c2ea3d');
		dependencyStubs.interactive.reset();
	})

	describe('when the requested ID maps to an interactive', function () {
		beforeEach(function () {
			return createInstance({
				params: {
					id: '012f81d6-2e2b-11e5-8873-775ba7c2ea3d'
				}
			});
		});

		afterEach(function () {
			dependencyStubs.interactive.reset();
		});

		it('redirects to the interactive URL', function () {
			expect(dependencyStubs.interactive.callCount).to.equal(0);
			expect(response.statusCode).to.equal(302);
			expect(response._getRedirectUrl()).to.equal('http://ig.ft.com/sites/2015/local-cuts-checker/');
		});
	});

	describe('when the requested article is a podcast', function () {

		beforeEach(function () {

			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, fixturePodcast);

			dependencyStubs.modelHandler.withArgs('podcast').returns(dependencyStubs.podcast)
			dependencyStubs.onwardJourney.returns(Promise.resolve());

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			}, { articleSuggestedRead: true });

		});

		afterEach(function () {
			dependencyStubs.modelHandler.reset();
			dependencyStubs.podcast.reset();
			dependencyStubs.onwardJourney.reset();
		});

		it('returns a successful response', function () {
			expect(response.statusCode).to.equal(200);
			expect(dependencyStubs.podcast.callCount).to.equal(1);
		});

	});

	describe('when the requested article is a video', function () {
		beforeEach(function () {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							type: 'video',
							webUrl: 'http://video.ft.com/5030468875001',
							provenance: []
						}
					}]
				});

			dependencyStubs.modelHandler.withArgs('video').returns(dependencyStubs.video);

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			});
		});

		afterEach(function () {
			dependencyStubs.video.reset();
			dependencyStubs.modelHandler.reset();
		});

		it('defers to the video handler', function () {
			expect(dependencyStubs.video.callCount).to.equal(1);
			expect(response.statusCode).to.not.equal(404);
		});
	});

	describe('when the requested content is a placeholder', function () {
		beforeEach(function () {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							type: 'placeholder',
							url: 'http://howtospendit.ft.com/whatever',
							provenance: [],
							type: 'placeholder'
						}
					}]
				});

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			});
		});

		it('redirects to the url', function () {
			expect(response.statusCode).to.equal(302);
		});
	});

	describe('when dealing with an article', function () {
		context('and it is found', function () {
			beforeEach(function () {
				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);

				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
			});

			it('defers to the article controller', function () {
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(response.statusCode).to.not.equal(404);
			});
		});

		context('fragment layout', function () {
			let modelStub = sinon.stub();
			beforeEach(function () {
				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);
				modelStub.returns(Promise.resolve({
					contentType: 'article',
					template: 'content',
					layout: 'wrapper'
				}));
				dependencyStubs.modelHandler.withArgs('article').returns(modelStub);

				return createInstance({
					params: { id: '352210c4-7b17-11e5-a1fe-567b37f80b64' },
					query: { fragment: 1 }
				});

			});

			afterEach(function () {
				modelStub.reset();
				dependencyStubs.modelHandler.reset();
			});

			it('defers to the article controller', function () {
				expect(dependencyStubs.modelHandler.callCount).to.equal(1);
				expect(modelStub.callCount).to.equal(1);
				expect(response._getRenderView()).to.equal('fragment');
				expect(response.statusCode).to.equal(200);
			});
		});

		context('when it exists on ft.com', function () {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureNotFound);

				dependencyStubs.falconUrl.returns(
					Promise.resolve('http://www.ft.com/path/to/article')
				);
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);

				return createInstance({
					params: {
						id: '8f88c930-d00a-11da-80fb-0000779e2340'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
				dependencyStubs.falconUrl.returns(undefined);
			});

			it('redirects to ft.com', function () {
				expect(response._getRedirectUrl()).to.equal('http://www.ft.com/path/to/article')
				expect(response.statusCode).to.equal(302);
				expect(dependencyStubs.modelHandler.callCount).to.equal(0);
				expect(dependencyStubs.article.callCount).to.equal(0);
			});
		});

		// it('does not add X-Robots-Tag headers for Methode articles', () => {
		// 	createInstance(null, { openGraph: true }, fixturePremium);
		// 	expect(response.getHeader('X-Robots-Tag')).to.be.undefined;
		// });

		context('when it does not exist', function () {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureNotFound);

				dependencyStubs.falconUrl.returns(
					Promise.resolve(null)
				);
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);

				return createInstance({
					params: {
						id: '00000000-0000-0000-0000-000000000000'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
				dependencyStubs.falconUrl.returns(undefined);
			});

			it('responds with a 404', function () {
				expect(response._getRedirectUrl()).to.equal('');
				expect(response.statusCode).to.equal(404);
				expect(dependencyStubs.article.callCount).to.equal(0);
			});
		});
	});


	describe('with suggested read flag on', () => {
		context('and onward journey fetch success', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.resolve(fixtureOnwardJourney));
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);

				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
			});

			it('defers to the article controller after setting read next data', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][2].readNextArticle.title).to.equal('FT Health: Welcome to our new newsletter');
				expect(dependencyStubs.article.args[0][2].readNextArticles.length).to.equal(5);
				expect(response.statusCode).to.not.equal(404);
			});

		});

		context('and onward journey fetch fail', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.reject());
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
			});

			it('renders the article without the read nexts', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][3].readNextArticle).to.be.undefined;
				expect(dependencyStubs.article.args[0][3].readNextArticles).to.be.undefined;
				expect(response.statusCode).to.not.equal(404);
			});

		});

	});

	describe('with content packages flag on', () => {
		context('and onward journey fetch success', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.resolve(fixtureOnwardJourneyInPackage));
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);

				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true, contentPackages: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
			});

			it('defers to the article controller after setting read next and package data', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][2].readNextArticle.title).to.equal('The End of the Asian Century by Michael Auslin – strategic games');
				expect(dependencyStubs.article.args[0][2].readNextArticles.length).to.equal(5);
				expect(dependencyStubs.article.args[0][2].package.title).to.equal('The best books of 2016');
				expect(dependencyStubs.article.args[0][2].context.current.title).to.equal('Economics');
				expect(response.statusCode).to.not.equal(404);
			});

		});

		context('and onward journey fetch fail', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.reject());
				dependencyStubs.modelHandler.withArgs('article').returns(dependencyStubs.article);
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true, contentPackages: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
				dependencyStubs.modelHandler.reset();
			});

			//TODO: is this correct behaviour?
			it('renders the article without the read nexts or navigation', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][2].readNextArticle).to.be.undefined;
				expect(dependencyStubs.article.args[0][2].readNextArticles).to.be.undefined;
				expect(dependencyStubs.article.args[0][2].package).to.be.undefined;
				expect(response.statusCode).to.not.equal(404);
			});

		});


	});

	describe('for unsupported Next pages', () => {

		it('ftalphaville should redirect back to FT.com', () => {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							webUrl: 'http://ftalphaville.ft.com/2016/07/04/2168234/ft-opening-quote-86/'
						}
					}]
				});

			return createInstance({
				params: { id: 'uuid' }
			})
				.then(() => {
					expect(response.statusCode).to.equal(301);
				});
		});

		it('markets live should redirect back to FT.com', () => {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							webUrl: 'http://ftalphaville.ft.com/marketslive/2015-10-27/'
						}
					}]
				});

			return createInstance({
				params: { id: 'uuid' }
			})
				.then(() => {
					expect(response.statusCode).to.equal(301);
					expect(response._getRedirectUrl()).to.include('http://ftalphaville.ft.com/marketslive/2015-10-27/');
					expect(response._getRedirectUrl()).to.include('?ft_site=falcon&desktop=true');
				});
		});

		it('live blogs should redirect back to FT.com', () => {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							webUrl: 'http://blogs.ft.com/westminster/liveblogs/2016-06-28-2/'
						}
					}]
				});

			return createInstance({
				params: { id: 'uuid' }
			})
				.then(() => {
					expect(response.statusCode).to.equal(302);
					expect(response._getRedirectUrl()).to.include('http://blogs.ft.com/westminster/liveblogs/2016-06-28-2/');
					expect(response._getRedirectUrl()).to.include('?ft_site=falcon&desktop=true');
				});
		});

		it('redirects syndicated / wires content to ft.com', () => {
			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, {
					docs: [{
						found: true,
						_source: {
							originatingParty: 'Reuters',
							webUrl: 'http://www.ft.com/cms/s/0/bd729e4c-644d-11e6-8310-ecf0bddad227.html'
						}
					}]
				});

			return createInstance({
				params: { id: 'uuid' }
			})
				.then(() => {
					expect(response.statusCode).to.equal(302);
					expect(response._getRedirectUrl()).to.include('http://www.ft.com/cms/s/0/bd729e4c-644d-11e6-8310-ecf0bddad227.html');
					expect(response._getRedirectUrl()).to.include('?ft_site=falcon&desktop=true');
				});
		});
	});

});
