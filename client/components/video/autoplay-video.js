import { lazyLoad as lazyLoadImages } from 'n-image';
import oViewport from 'o-viewport';
import OVideo from 'o-video';

import playCheck from './play-check';

const removeCoreFallback = videoEl => {
	[...videoEl.querySelectorAll('.video__core-fallback')].forEach(fallbackVideoEl => {
		fallbackVideoEl.parentNode.removeChild(fallbackVideoEl);
	});
};

function eventForwarder (ev) {
	const { detail: { category, action } = {} } = ev;
	if (category !== 'video') {
		return;
	}
	switch (action) {
		case 'adStart':
		case 'playing':
			this.playing();
			break;
		case 'pause':
			this.paused();
			break;
		case 'ended':
			this.ended();
			break;
	}
}

export default class {

	constructor (videoEl, { showAds = false, classes = ['video'] } = {}) {
		this.videoEl = videoEl;
		this.video = new OVideo(videoEl, {
			placeholder: true,
			classes,
			advertising: showAds
		});
		this.videoPlaceholderElement = this.videoEl.parentNode.querySelector('.video__placeholder');
		this.upNextTimer;
	}

	init () {
		removeCoreFallback(this.videoEl);
		document.body.addEventListener('oTracking.event', eventForwarder.bind(this));

		return Promise.all([playCheck(), this.video.init()])
			.then(([canPlay]) => {
				if (canPlay) {
					// NOTE: confusingly, #getVisibility returns true if hidden
					if (oViewport.getVisibility() === true) {
						const visibilityHandler = ({ detail: { hidden } = {} }) => {
							if (!hidden) {
								this.video.play();
								document.body.removeEventListener('oViewport.visibility', visibilityHandler);
							}
						};
						oViewport.listenTo('visibility');
						document.body.addEventListener('oViewport.visibility', visibilityHandler);
					} else {
						this.video.play();
					}
				} else {
					const videoPlaceholderListener = () => {
						this.video.play();
						this.videoPlaceholderElement.removeEventListener('click', videoPlaceholderListener);
					};
					this.videoPlaceholderElement.addEventListener('click', videoPlaceholderListener);
				}
			});
	}

	playing () {
		this.videoPlaceholderElement.classList.add('video__placeholder__played');
		this.videoPlaceholderElement.classList.add('video__placeholder__playing');
		clearTimeout(this.upNextTimer);
	}

	paused () {
		this.videoPlaceholderElement.classList.remove('video__placeholder__playing');
	}

	ended () {
		const upNextItem = document.querySelector('li.video__up-next__list-item:first-of-type');
		const upNextPlaceholderSlot = document.querySelector('.js-placeholder-up-next');
		if (upNextItem && upNextPlaceholderSlot) {
			const rolloverUpNext = upNextItem.cloneNode(true);
			rolloverUpNext.removeAttribute('data-o-grid-colspan');
			// remove image lazy-loading marker
			[...rolloverUpNext.querySelectorAll('[data-n-image-lazy-load-js]')].forEach(lazyLoadingImageEl => {
				lazyLoadingImageEl.removeAttribute('data-n-image-lazy-load-js');
				// TODO: more appropriate responsive images sizes
				lazyLoadingImageEl.setAttribute('sizes', '300px')
			});

			upNextPlaceholderSlot.innerHTML = '';
			upNextPlaceholderSlot.appendChild(rolloverUpNext);

			this.videoPlaceholderElement.classList.add('video__placeholder__ended');
			this.videoPlaceholderElement.classList.remove('video__placeholder__playing');

			lazyLoadImages({ root: upNextPlaceholderSlot });

			this.upNextTimer = setTimeout(() => {
				const upNextLink = upNextPlaceholderSlot.querySelector('.o-teaser__heading a');
				upNextLink.setAttribute('data-trackable', 'autoplay');
				upNextLink.click();
			}, 5000);
		}
	}

}
