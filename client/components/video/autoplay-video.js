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

const defaults = {
	advertising: false,
	classes: [ 'video' ],
	// TODO: add A/B test variants
	upNextStyle: false
}

export default class {

	constructor (videoEl, options = {}) {
		this.options = Object.assign({}, defaults, options);

		this.videoEl = videoEl;

		this.video = new OVideo(videoEl, {
			placeholder: true,
			classes: this.options.classes,
			advertising: this.options.advertising
		});

		this.videoPlaceholderElement = this.videoEl.parentNode.querySelector('.video__placeholder');
	}

	init () {
		removeCoreFallback(this.videoEl);
		document.body.addEventListener('oTracking.event', eventForwarder.bind(this));

		this.setupUpNext();

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
		this.videoPlaceholderElement.classList.add('video__placeholder--played');
		this.videoPlaceholderElement.classList.add('video__placeholder--playing');
		this.videoPlaceholderElement.classList.remove('video__placeholder--ended');
	}

	paused () {
		this.videoPlaceholderElement.classList.remove('video__placeholder--playing');
	}

	ended () {
		this.videoPlaceholderElement.classList.add('video__placeholder--ended');
		this.videoPlaceholderElement.classList.remove('video__placeholder--playing');
	}

	setupUpNext () {
		// is the up next component being shown
		this.upNextShown = false;

		// have the events been set up
		this.upNextSetup = false;

		// reference to autoplay countdown
		this.upNextTimer = false;

		const autoplay = (link) => {
			link.setAttribute('data-trackable', 'autoplay');
			link.click();
		};

		const beforeEndHandler = (e) => {
			// duration and currentTime are both in seconds
			if (!this.upNextShown && (e.target.duration - e.target.currentTime) <= 5) {
				const next = this.appendUpNext();

				if (next) {
					// play next video immediately on end
					e.target.addEventListener('ended', () => autoplay(next));
				}
			}
		};

		const onEndedHandler = () => {
			const next = this.appendUpNext();

			if (next) {
				// this timer may be cancelled
				this.upNextTimer = setTimeout(() => autoplay(next), 5000);
			}
		};

		const onPlayingHandler = (e) => {
			if (this.upNextSetup === false) {
				if (this.options.upNextStyle) {
					e.target.addEventListener('timeupdate', beforeEndHandler);
				} else {
					e.target.addEventListener('ended', onEndedHandler);
				}

				this.upNextSetup = true;
			}

			// stop displaying up next if the video is played again
			if (this.upNextShown) {
				this.removeUpNext();
			}

			// Allow users to scrub back to replay video
			if (this.upNextTimer) {
				clearTimeout(this.upNextTimer);
				this.upNextTimer = null;
			}
		};

		this.videoEl.addEventListener('playing', onPlayingHandler, true);
	}

	appendUpNext () {
		const slot = document.querySelector('.video__autoplay-up-next');
		const item = document.querySelector('.video__up-next__list-item');

		if (!item || !slot) return;

		const clone = item.firstElementChild.cloneNode(true);

		// grab the link
		const link = clone.querySelector('.js-teaser-heading-link');

		// we need to re-setup image lazyloading
		const image = clone.querySelector('[data-n-image-lazy-load-js]');
		image.removeAttribute('data-n-image-lazy-load-js');

		slot.appendChild(clone);

		// load the image already!
		lazyLoadImages({ root: slot });

		slot.classList.add('video__autoplay-up-next--shown');

		this.upNextShown = true;

		// next up items are lazy loaded so we'll return a useful reference if we got this far
		return link;
	}

	removeUpNext () {
		const slot = document.querySelector('.video__autoplay-up-next');
		slot.classList.remove('video__autoplay-up-next--shown');
		slot.removeChild(slot.lastChild);
		this.upNextShown = false;
	}

}
