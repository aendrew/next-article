const expect = require('chai').expect;
const subject = require('../../../server/lib/choose-stylesheets');

describe('Choosing the right stylesheets for', () => {

	it('content package articles', () => {
		const stylesheets = subject({ package: { theme: 'blah' } });
		expect(stylesheets.inline).to.eql(['shared-head', 'expander', 'package-head', 'topper-themed']);
		expect(stylesheets.lazy).to.eql(['main', 'package-lazy', 'teasers']);

		//expander should be before package CSS because cascade
		expect(stylesheets.inline.indexOf('expander')).to.be.below(stylesheets.inline.indexOf('package-head'));
	});

	it('content package landing pages', () => {
		const stylesheets = subject({ type: 'package'});
		expect(stylesheets.inline).to.eql(['shared-head', 'expander', 'package-head', 'topper-themed']);
		expect(stylesheets.lazy).to.eql(['main', 'package-lazy', 'teasers']);
	});

	it('articles with basic topper', () => {
		const stylesheets = subject({ topper: { layout: 'basic', template: 'basic' }});
		expect(stylesheets.inline).to.eql(['shared-head', 'teasers']);
		expect(stylesheets.lazy).to.eql(['main']);
	});

	it('articles with branded topper', () => {
		const stylesheets = subject({ topper: { layout: 'branded', template: 'basic' }});
		expect(stylesheets.inline).to.eql(['shared-head', 'topper-themed', 'teasers']);
		expect(stylesheets.lazy).to.eql(['main']);
	});

	it('articles with themed topper', () => {
		const stylesheets = subject({ topper: { layout: 'offset', template: 'full-bleed-offset' }});
		expect(stylesheets.inline).to.eql(['shared-head', 'topper-themed']);
		expect(stylesheets.lazy).to.eql(['main', 'teasers']);

	});

	it('video pages', () => {

		const stylesheets = subject({ type: 'video' });
		expect(stylesheets.inline).to.eql(['shared-head', 'video']);
		expect(stylesheets.lazy).to.eql(['main', 'teasers']);
	});

	it('articles with a video', () => {

		const stylesheets = subject({ type: 'article', contentStats: { videos: 1 }});
		expect(stylesheets.inline).to.eql(['shared-head']);
		expect(stylesheets.lazy).to.eql(['main', 'video', 'teasers']);
	});

	it('articles with a gallery', () => {

		const stylesheets = subject({ type: 'article', bodyHTML: '<blah><ft-slideshow type=blah/></blah>'});
		expect(stylesheets.inline).to.eql(['shared-head']);
		expect(stylesheets.lazy).to.eql(['main', 'teasers', 'gallery']);
	});

	it('articles with a expandable promo box', () => {
		const stylesheets = subject({ type: 'article', bodyHTML: '<balh><div data-o-component="o-expander"></div>'});
		expect(stylesheets.inline).to.eql(['shared-head']);
		expect(stylesheets.lazy).to.eql(['main', 'expander', 'teasers']);
	});

	it('articles with light signup', () => {
		const stylesheets = subject({ lightSignup: { show: true }});
		expect(stylesheets.inline).to.eql(['shared-head']);
		expect(stylesheets.lazy).to.eql(['main', 'teasers', 'light-signup']);
	});

	it('in article barriers', () => {
		const stylesheets = subject({ inArticleBarrierHTML: 'some-html' });
		expect(stylesheets.inline).to.eql(['shared-head']);
		expect(stylesheets.lazy).to.eql(['main', 'teasers', 'barrier']);
	});

	it('some combination', () => {
		const stylesheets = subject({ type: 'package', bodyHTML: 'ft-slideshow', lightSignup: { show: true }, topper: { layout: 'offset', template: 'full-bleed-offset' }});
		expect(stylesheets.inline).to.eql(['shared-head', 'expander', 'package-head', 'topper-themed']);
		expect(stylesheets.lazy).to.eql(['main', 'package-lazy', 'teasers', 'gallery', 'light-signup']);
	});

});
