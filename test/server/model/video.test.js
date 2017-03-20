const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');

const fixture = require('../../fixtures/v3-elastic-video-found')._source;

const stubs = {
	onwardJourney: sinon.stub(),
	openGraph: sinon.stub(),
	videoDuration: sinon.stub()
};

const videoHandler = proxyquire('../../../server/model/video', {
	'../controllers/article-helpers/onward-journey': stubs.onwardJourney,
	'../controllers/article-helpers/open-graph': stubs.openGraph,
	'../transforms/video-duration': stubs.videoDuration,
});

describe('Video Handler', () => {
	let request;
	let response;

	function createInstance (params, flags) {
		request = httpMocks.createRequest(params);
		response = httpMocks.createResponse();
		response.locals = { flags: flags || {} };
		// node-mocks-http doesn't support this method
		response.unvaryAll = sinon.stub();
		return videoHandler(request, response, fixture, response.locals.flags);
	}

	it('provides related data for video', () => {
		return createInstance(null, { videoArticlePage: true }).then(result => {
			expect(result.autoplay).to.be.false;
			expect(result.dehydratedMetadata.upNextTag).to.be.ok;
			expect(result.videoData).to.be.an('object');
			expect(result.videoData.renditions).to.be.an('array');
			// expect(result.externalLinks).to.include.keys('itunes', 'stitcher', 'audioboom');
			// expect(result.media).to.include.keys('mediaType', 'url');
		});
	});
});
