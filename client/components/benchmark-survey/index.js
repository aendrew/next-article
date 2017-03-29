/**
 * Infobox linking to FT.com user survey
 * @flags benchmarkSurvey
 */

import template from './template';
import Overlay from 'o-overlay';

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

	let shownCount = Number(window.localStorage.getItem(`${opts.sideboxId}-show-count`)) || 0;
	const isRemoved = window.localStorage.getItem(`${opts.sideboxId}-ad-removed`) || false;

	if (hasLocalStorage && !isRemoved && shownCount <= 5 ) {
		return new Promise((resolve) => {
			const surveyOverlay = new Overlay('benchmark-survey', {
				html: template(opts),
				modal: false,
				parentNode: '.n-layout__row--content > .o-grid-container > .o-grid-row',
				nested: true,
				noFocus: true,
			});


			let surveyLoadEvents = [
				checkDepthOnInitialScrollEvent(opts),
				initObserver({
					targetSelector: '.read-next-bottom',
					threshold: 0
				})
			];

			Promise.race(surveyLoadEvents)
				.then(reason => {
					surveyOverlay.open();
					window.localStorage.setItem(`${opts.sideboxId}-show-count`, ++shownCount);

					document.addEventListener('oOverlay.ready', () => {
						const el = surveyOverlay.wrapper;

						el.querySelector('.o-overlay--benchmark-survey__close-button')
							.addEventListener('click', () => {
								window.localStorage.setItem(`${opts.sideboxId}-ad-removed`, true);
								surveyOverlay.close();
							});

						el.classList.add('visible');
						// resolve with first event to trigger
						resolve({
							surveyOverlay,
							opts,
							info: {
								hasLocalStorage,
								reason,
								shownCount,
							}
						});
					});
				});
			});
	} else {
		return;
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
