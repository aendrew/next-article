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
	}
}

export default class {

	constructor (videoEl, { showAds = false, classes = ['video'] } = {}) {
		this.videoEl = videoEl;
		this.video = new OVideo(videoEl, {
			placeholder: true,
			classes,
			advertising: false
		});

		this.videoPlaceholderElement = this.videoEl.parentNode.querySelector('.video__placeholder');
	}

	init () {
		removeCoreFallback(this.videoEl);
		document.body.addEventListener('oTracking.event', eventForwarder.bind(this));

		return Promise.all([playCheck(), this.video.init()])
			.then(([canPlay]) => {
				if (canPlay) {
					this.setupAutoplayTest();

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

	setupAutoplayTest () {
		// This is for an A/B test to see if displaying the 'next up' component before
		// the video ends is more effective than display one after the video ends.
		const autoplay = (link) => {
			link.setAttribute('data-trackable', 'autoplay');
			link.click();
		};

		const firstPlayHandler = (e) => {
			// TODO: flag
			if (true) {
				e.target.addEventListener('timeupdate', beforeEndHandler);
			} else {
				e.target.addEventListener('ended', onEndHandler);
			}

			e.currentTarget.removeEventListener('playing', firstPlayHandler, true);
		};

		const beforeEndHandler = (e) => {
			if ((e.target.duration - e.target.currentTime) <= 5) {
				const next = this.showUpNext();

				if (next) {
					e.target.removeEventListener('timeupdate', beforeEndHandler);
					e.target.addEventListener('ended', () => autoplay(next));
				}
			}
		};

		const onEndHandler = (e) => {
			const next = this.showUpNext();

			if (next) {
				this.upNextTimer = setTimeout(() => autoplay(next), 5000);
			}
		};

		this.videoEl.addEventListener('playing', firstPlayHandler, true);
	}

	playing () {
		this.videoPlaceholderElement.classList.add('video__placeholder__played');
		this.videoPlaceholderElement.classList.add('video__placeholder__playing');

		// Allow users to scrub back to replay video
		this.upNextTimer && clearTimeout(this.upNextTimer);
	}

	paused () {
		this.videoPlaceholderElement.classList.remove('video__placeholder__playing');
	}

	showUpNext () {
		const item = document.querySelector('.video__up-next__list-item');
		const slot = document.querySelector('.js-placeholder-up-next');

		if (!item || !slot) return;

		const clone = item.firstElementChild.cloneNode(true);

		// grab the link
		const link = clone.querySelector('.js-teaser-heading-link');

		slot.appendChild(clone);

		// load the image already!
		// TODO: fix this
		lazyLoadImages({ root: clone });

		this.videoPlaceholderElement.classList.add('video__placeholder__ended');
		this.videoPlaceholderElement.classList.remove('video__placeholder__playing');

		// next up items are lazy loaded so we'll return something useful if we got this far
		return link;
	}

}
