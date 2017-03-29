const nock = require('nock');
const sinon = require('sinon');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const fixture = require('../../fixtures/capi-v1-slideshow');

const subject = require('../../../server/controllers/slideshow');

describe('Slideshow Controller', () => {
	let request;
	let response;
	let next;
	let result;

	function createInstance (params) {
		next = sinon.stub();
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = {};
		return subject(request, response, next);
	}

	context('when content is found', () => {
		beforeEach(() => {
			result = null;

			nock('https://api.ft.com')
				.get('/content/items/v1/12345')
				.query(true)
				.reply(200, fixture);

			return createInstance({ params: { id: 12345 } }).then(() => {
				result = response._getRenderData();
			});
		});

		it('returns a successful response', () => {
			expect(next.callCount).to.equal(0);
			expect(response.statusCode).to.equal(200);
		});

		it('extracts slideshow slides', () => {
			expect(result.slides).to.be.an('array');
			expect(result.slides.length).to.equal(8);
			expect(result.slides[0]).to.include.keys('slideNumber', 'url', 'alt', 'caption');
		});

		it('extracts slideshow title', () => {
			expect(result.title).to.equal('Bethlehem mosaic angels restored to glory');
		});
	});

	context('when content is invalid', () => {
		beforeEach(() => {
			result = null;

			nock('https://api.ft.com')
				.get('/content/items/v1/12345')
				.query(true)
				.reply(200, { item: { assets: null } });

			return createInstance({ params: { id: 12345 } });
		});

		it('responds with a 404', () => {
			expect(response.statusCode).to.equal(404);
		});
	});

	context('when content is not found', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get('/content/items/v1/12345')
				.query(true)
				.reply(404);

			return createInstance({ params: { id: 12345 } });
		});

		it('responds with a 404', () => {
			expect(response.statusCode).to.equal(404);
		});
	});

	context('when there is an error', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get('/content/items/v1/12345')
				.query(true)
				.reply(200, '{i am "not" json}');

			return createInstance({ params: { id: 12345 } });
		});

		it('responds with a 50x', () => {
			expect(next.callCount).to.equal(1);
		});
	});
});
