
/*
 * We must check in this way because window.scrollY is not
 * readily available on page load. Furthermore it helps us
 * cover the scenario in which the user scrolls too far/fast
 *
 * If there isnt an optional observer target then default to
 * the #comments with a threshold of 600
 */
function checkDepthOnInitialScrollEvent (target, { threshold = 600 }) {
	return new Promise(resolve => {

		let checkComplete = false;

		const wHeight = window.innerHeight;
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

const intersectionCallback = (observer, changes, resolve) => {
	changes.forEach(change => {
		resolve('intersection callback');
		observer.unobserve(change.target);
	});
};

function initObserver (intersectionTarget, { threshold = 600 }) {
	return new Promise(resolve => {

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
				{ rootMargin: `${threshold}px` }
			);
			// callback will resolve
			observer.observe(intersectionTarget);
		}

	})

};


module.exports = (el, opts) => {
	return new Promise(resolve => {
		if(!opts.lazy) {
			/*
			 * Lazy Load = false
			 * Load comments and resolve parent promise
			 */
			resolve('dont lazy load');
		} else {

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

			 let loadEvents = [
				checkDepthOnInitialScrollEvent(el, opts),
				initObserver(el, opts)
			];

			if(opts.targetSelector) {
				loadEvents.push(initObserver(document.querySelector(opts.targetSelector), opts));
			}

			return Promise.race(loadEvents)
				.then(reason => {
					resolve('race ended: ' + reason);
				});
		}
	});
};
