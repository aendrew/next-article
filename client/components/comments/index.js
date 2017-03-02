import tracking from './tracking';
import lazyLoad from '../lazy-load';

const oGrid = require('o-grid');
const commentsIcon = require('./icon');
const commentsSkeleton = require('./skeleton');

const loadSources = (sources) => {
	sources.forEach(source => {
		const fileType = source.split('.').pop();
		let element;
		if (fileType === 'js') {
			element = document.createElement('script');
			element.src = source;
		} else {
			element = document.createElement('link');
			element.setAttribute('rel', 'stylesheet');
			element.href = source;
		}
		document.head.appendChild(element);
	});
};

function loadComments (commentsEl, opts) {

	const sources = [commentsEl.getAttribute('data-comments-js'), commentsEl.getAttribute('data-comments-css')];

	return lazyLoad(commentsEl, opts)
	.then(() => {
		// TIP: pass `reason` to debug
		window.FT.commentsRumLoadStart = Date.now();
		loadSources(sources);
	});

}

module.exports = {
	init: () => {

		window.FT = window.FT || {};

		const commentsEl = document.getElementById('comments');

		commentsIcon.init();
		commentsSkeleton.init();

		let loadOpts = {lazy: false};
		// if the user has followed a link to the comments section don't lazy load
		if (/#lf-content|#comments|#lf-comments/.test(window.location.hash)) {
			// fix for double hash bug https://jira.ft.com/browse/NFT-598
			location.hash = location.hash.replace(/.*(#lf-content|#comments|#lf-comments)/, '$1');
		} else if (location.search.indexOf('lf-content') > -1) {
			// do nothing
		} else {
			const initialEngagement = tracking.getInitialEngagement();

			if (initialEngagement !== 'active') {
				// lazy load comments using default behaviour
				loadOpts.lazy = true;

				// Use additional observer eariler in the page
				// for mobile to trigger load earlier
				if(['default', 'S'].indexOf(oGrid.getCurrentLayout()) > -1) {
					loadOpts.targetSelector = '.n-content-copyright';
					loadOpts.threshold = initialEngagement === 'passive' ? 600 : 0;
				}
			}
		}

		loadComments(commentsEl, loadOpts);

		tracking.init();
	}
};
