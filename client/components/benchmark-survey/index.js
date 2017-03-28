/**
 * Infobox linking to FT.com user survey
 * @flags benchmarkSurvey
 */

import template from './template';

export default function benchmarkSurvey (flags, opts = {
	sideboxId: 'benchmark-survey-Mar-2017',
	headline: 'How do you rate FT.com?',
	copy: 'Answer a short survey to help us improve',
	cta: 'Start survey',
	ctaLink: 'https://www.ftfeedbackforum.com/R.aspx?a=1227&as=PL5Bk1JF4F',
	tcs: false,
}) {
	let hasLocalStorage;
	try {
		hasLocalStorage = window.localStorage ? true : false;
	} catch (e) { // Throws "Security Error (DOM Exception 18)" in Safari
		hasLocalStorage = false;
		return;
	}
	const el = document.createElement('aside');
	el.classList.add('benchmark-survey');

	const parent = document.querySelector('.read-next-bottom').parentNode;
	parent.insertBefore(el, parent.querySelector('.read-next-bottom'));

	let shownCount = Number(window.localStorage.getItem(`${opts.sideboxId}-show-count`)) || 0;
	const isRemoved = window.localStorage.getItem(`${opts.sideboxId}-ad-removed`) || false;

	if (hasLocalStorage && !isRemoved && shownCount <= 5 ) {
		return new Promise((resolve) => {
			let surveyLoadEvents = [
				checkDepthOnInitialScrollEvent(opts),
				initObserver({
					targetSelector: '.read-next-bottom',
					threshold: 0
				})
			];

			el.innerHTML = template(opts);
			window.localStorage.setItem(`${opts.sideboxId}-show-count`, shownCount++);

			el.querySelector('.benchmark-survey--cta')
				.addEventListener('click', () => {
					window.location.href = opts.ctaLink;
				});

			el.querySelector('.benchmark-survey--close-button')
				.addEventListener('click', () => {
					el.remove();
					window.localStorage.setItem(`${opts.sideboxId}-ad-removed`, true);
				});

			return Promise.race(surveyLoadEvents)
			.then(reason => {
				el.classList.add('visible');
				// resolve with first event to trigger
				resolve({
					el,
					opts,
					info: {
						hasLocalStorage,
						reason,
						shownCount,
					}
				});
			});
		});
	}
};

function initObserver (opts) {
	return new Promise(resolve => {
		const intersectionTarget = document.querySelector(opts.targetSelector);

		if (!intersectionTarget) {
			resolve('No element found to attach IntersectionObserver');
		} else if(!window.IntersectionObserver) {
			resolve('IntersectionObserver not supported');
		} else {
			const observer = new IntersectionObserver(
				function (changes) {
					intersectionCallback(this, changes, resolve);
				},
				{ rootMargin: `${opts.threshold}px` }
			);
			// callback will resolve
			observer.observe(intersectionTarget);
		}
	});
}

const intersectionCallback = (observer, changes, resolve) => {
	changes.forEach(change => {
		resolve('intersection callback');
		observer.unobserve(change.target);
	});
};

function checkDepthOnInitialScrollEvent ({targetSelector='.read-next-bottom', threshold=600}={}) {
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
