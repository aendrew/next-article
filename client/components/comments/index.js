import oGrid from 'n-ui/grid';
import tracking from './tracking';

const commentsIcon = require('./icon');
const commentsSkeleton = require('./skeleton');

/*
 * We must check in this way because window.scrollY is not
 * readily available on page load. Furthermore it helps us
 * cover the scenario in which the user scrolls too far/fast
 *
 * If there isnt an optional observer target then default to
 * the #comments with a threshold of 600
 */
function checkDepthOnInitialScrollEvent ({targetSelector='#comments', threshold=600}={}) {
	return new Promise(resolve => {

		let checkComplete = false;

		const wHeight = window.innerHeight;
		const target = document.querySelector(targetSelector);
		const distanceToTop = target.getBoundingClientRect().top;
		// This is going to be slightly off given advert loads etc, but
		// is sufficient for checking the edge cases for which we are covering
		const triggerOffest = distanceToTop - threshold - wHeight;

		const scrollEventHandler = () => {
			if (!checkComplete) {
				checkComplete = true;
				tearDownAndReturn(window.scrollY >= triggerOffest);
			}
		};

		const tearDownAndReturn = (alreadyPassedThreshold) => {
			window.removeEventListener('scroll', scrollEventHandler);
			if (alreadyPassedThreshold) resolve('checkDepthOnInitialScrollEvent');
		};

		window.addEventListener('scroll', scrollEventHandler);

	});
}

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

const intersectionCallback = (observer, changes, resolve) => {
	changes.forEach(change => {
		resolve('intersection callback');
		observer.unobserve(change.target);
	});
};

function initObserver (opts) {
	return new Promise(resolve => {
		const intersectionTarget = document.querySelector(opts.targetSelector);

		if (!intersectionTarget) {
			resolve('No element found to attach IntersectionObserver');
		}
		else if(!window.IntersectionObserver) {
			resolve('IntersectionObserver not supported');
		}
		else {
			const observer = new IntersectionObserver(
				function (changes) {
					intersectionCallback(this, changes, resolve);
				},
				{ rootMargin: `${opts.threshold}px` }
			);
			// callback will resolve
			observer.observe(intersectionTarget);
		}

	})
}

function loadComments (commentsEl, opts) {

	const sources = [commentsEl.getAttribute('data-comments-js'), commentsEl.getAttribute('data-comments-css')];

	return new Promise(resolve => {

		if (!opts.lazy) {
			/*
			 * Lazy Load = false
			 * Load comments and resolve parent promise
			 */
			resolve('dont lazy load');
		}
		else {
			/*
			 * Lazy Load = true
			 * Can be trigged for mutiple reasons
			 *
			 * We check the scroll depth upon the first scroll
			 * event to avoid scenario whereby the user has
			 * already passed the intersection target.
			 * As would be the case if:
			 *  - reloading from the bottom of the page
			 *  - race condition meant the IntersectionObserver
			 * had not been loaded / configured
			 *  - scrolling fast enough to "skip" the threshold
			 * in which the intersect would occur
			 *
			 * ALSO set up a back up / default intersection observor
			 * for edge cases in which user reaches comments without
			 * a load event triggering
			 */
			let commentLoadEvents = [
				checkDepthOnInitialScrollEvent(opts),
				initObserver({
					targetSelector: '#comments',
					threshold: 600
				})
			];
			/*
			 * optional additional intersection observer
			 */
			if (opts.targetSelector) {
				commentLoadEvents.push(initObserver(opts));
			}

			return Promise.race(commentLoadEvents)
			.then(reason => {
				// resolve with first event to trigger
				resolve('race ended: ' + reason);
			});

		}

	})
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
