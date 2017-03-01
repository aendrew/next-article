const nock = require('nock');
const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixtureInteractives = require('../../fixtures/interactive-graphics');
const fixturePodcast = require('../../fixtures/v3-elastic-podcast-found');
const fixtureArticle = require('../../fixtures/v3-elastic-article-found');
const fixtureNotFound = require('../../fixtures/v3-elastic-not-found');

const fixtureOnwardJourney = require('../../fixtures/onward-journey');
const fixtureOnwardJourneyInPackage = require('../../fixtures/onward-journey-in-package');

const dependencyStubs = {
	igPoller: { getData: () => fixtureInteractives },
	podcast: sinon.spy(),
	video: sinon.spy(),
	article: sinon.spy(),
	interactive: sinon.spy(),
	shellpromise: sinon.stub(),
	onwardJourney: sinon.stub()
};

nock.disableNetConnect();

const subject = proxyquire('../../../server/controllers/negotiation', {
	'../lib/ig-poller': dependencyStubs.igPoller,
	'./podcast': dependencyStubs.podcast,
	'./video': dependencyStubs.video,
	'./article': dependencyStubs.article,
	'./interactive': dependencyStubs.interactive,
	'shellpromise': dependencyStubs.shellpromise,
	'./article-helpers/onward-journey': dependencyStubs.onwardJourney
});

describe('Negotiation Controller', function () {

	let request;
	let response;
	let next;

	function createInstance (params, flags) {
		next = sinon.stub();
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		return subject(request, response, next);
	}

	it('sets surrogate-key', () => {
		createInstance({
			params: {
				id: '012f81d6-2e2b-11e5-8873-775ba7c2ea3d'
			}
		})
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

		it('defers to the interactive controller', function () {
			expect(dependencyStubs.interactive.callCount).to.equal(1);
			expect(response.statusCode).to.not.equal(404);
		});
	});

	describe('when the requested article is a podcast', function () {
		beforeEach(function () {

			nock('https://next-elastic.ft.com')
				.post('/v3_api_v2/item/_mget')
				.reply(200, fixturePodcast);

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			});

		});

		afterEach(function () {
			dependencyStubs.podcast.reset();
		});

		it('defers to the podcast controller', function () {
			expect(dependencyStubs.podcast.callCount).to.equal(1);
			expect(response.statusCode).to.not.equal(404);
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
							webUrl: 'http://video.ft.com/5030468875001',
							provenance: []
						}
					}]
				});

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			});
		});

		afterEach(function () {
			dependencyStubs.video.reset();
		});

		it('defers to the video controller', function () {
			expect(dependencyStubs.video.callCount).to.equal(1);
			expect(response.statusCode).to.not.equal(404);
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
							webUrl: 'http://video.ft.com/5030468875001',
							provenance: []
						}
					}]
				});

			return createInstance({
				params: {
					id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
				}
			});
		});

		afterEach(function () {
			dependencyStubs.video.reset();
		});

		it('defers to the video controller', function () {
			expect(dependencyStubs.video.callCount).to.equal(1);
			expect(response.statusCode).to.not.equal(404);
		});
	});
	describe('when dealing with an article', function () {
		context('and it is found', function () {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.article.reset();
			});

			it('defers to the article controller', function () {
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(response.statusCode).to.not.equal(404);
			});
		});

		context('when it exists on ft.com', function () {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureNotFound);

				dependencyStubs.shellpromise.returns(
					Promise.resolve('Location:http://www.ft.com/path/to/article')
				);

				return createInstance({
					params: {
						id: '8f88c930-d00a-11da-80fb-0000779e2340'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.shellpromise.returns(undefined);
				dependencyStubs.article.reset();
			});

			it('redirects to ft.com', function () {
				expect(dependencyStubs.article.callCount).to.equal(0);
				expect(response.statusCode).to.equal(302);
			});
		});

		context('when it does not exist', function () {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureNotFound);

				dependencyStubs.shellpromise.returns(
					Promise.resolve(Promise.resolve(''))
				);

				return createInstance({
					params: {
						id: '00000000-0000-0000-0000-000000000000'
					}
				});

			});

			afterEach(function () {
				dependencyStubs.shellpromise.returns(undefined);
				dependencyStubs.article.reset();
			});

			it('responds with a 404', function () {
				expect(dependencyStubs.article.callCount).to.equal(0);
				expect(response.statusCode).to.equal(404);
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
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
			});

			it('defers to the article controller after setting read next data', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][3].readNextArticle.title).to.equal('FT Health: Welcome to our new newsletter');
				expect(dependencyStubs.article.args[0][3].readNextArticles.length).to.equal(5);
				expect(response.statusCode).to.not.equal(404);
			});

		});


		context('and onward journey fetch fail', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.reject());
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
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
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true, contentPackages: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
			});

			it('defers to the article controller after setting read next and package data', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][3].readNextArticle.title).to.equal('The End of the Asian Century by Michael Auslin – strategic games');
				expect(dependencyStubs.article.args[0][3].readNextArticles.length).to.equal(5);
				expect(dependencyStubs.article.args[0][3].package.title).to.equal('The best books of 2016');
				expect(dependencyStubs.article.args[0][3].context.current.title).to.equal('Economics');
				expect(response.statusCode).to.not.equal(404);
			});

		});


		context('and onward journey fetch fail', () => {
			beforeEach(function () {

				nock('https://next-elastic.ft.com')
					.post('/v3_api_v2/item/_mget')
					.reply(200, fixtureArticle);

				dependencyStubs.onwardJourney.returns(Promise.reject());
				return createInstance({
					params: {
						id: '352210c4-7b17-11e5-a1fe-567b37f80b64'
					}
				}, { articleSuggestedRead: true, contentPackages: true });

			});

			afterEach(function () {
				dependencyStubs.onwardJourney.reset();
				dependencyStubs.article.reset();
			});

			//TODO: is this correct behaviour?
			it('renders the article without the read nexts or navigation', function () {
				expect(dependencyStubs.onwardJourney.callCount).to.equal(1);
				expect(dependencyStubs.article.callCount).to.equal(1);
				expect(dependencyStubs.article.args[0][3].readNextArticle).to.be.undefined;
				expect(dependencyStubs.article.args[0][3].readNextArticles).to.be.undefined;
				expect(dependencyStubs.article.args[0][3].package).to.be.undefined;
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
