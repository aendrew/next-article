import { $ } from 'n-ui/utils';
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

const upNextTemplate = (data) => (`
	<a class="video__autoplay-up-next video__autoplay-up-next--${data.variant}" data-trackable="manual" href="${data.href}">
		<i class="video__autoplay-up-next__icon"></i>
		<h2 class="video__autoplay-up-next__label">
			<span aria-hidden="true">Up Next</span>
			<span class="n-util-visually-hidden">Related videos</span>
		</h2>
		<p class="video__autoplay-up-next__heading">${data.heading}</p>
		<span class="video__autoplay-up-next__duration">${data.duration}</span>
	</a>
`);

const defaults = {
	advertising: false,
	classes: [ 'video' ],
	// TODO: add A/B test variants
	upNextVariant: false
};

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

	init ({ autoplay = false } = {}) {
		removeCoreFallback(this.videoEl);
		document.body.addEventListener('oTracking.event', eventForwarder.bind(this));

		this.setupUpNext();
		const getCanPlay = autoplay ? playCheck() : Promise.resolve(false);

		return Promise.all([getCanPlay, this.video.init()])
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
		// this is where we'll append the component
		this.upNextSlot = $('.js-video-autoplay-up-next');

		// is the up next component being shown
		this.upNextIsShown = false;

		// reference to autoplay countdown if active
		this.upNextTimeout = false;

		const autoplay = (link) => {
			link.setAttribute('data-trackable', 'autoplay');
			link.click();
		};

		const beforeEndHandler = (e) => {
			// duration and currentTime are both in seconds
			const timeUntilEnd = e.target.duration - e.target.currentTime;

			if (!this.upNextIsShown && timeUntilEnd <= 5) {
				const next = this.appendUpNext();

				// play next video immediately on end
				next && e.target.addEventListener('ended', () => autoplay(next));
			}
		};

		const onEndedHandler = () => {
			const next = this.appendUpNext();

			if (next && this.options.upNextVariant !== 'no-autoplay') {
				// this timeout may be cancelled
				this.upNextTimeout = setTimeout(() => autoplay(next), 5000);
			}
		};

		const onPlayingHandler = () => {
			// stop displaying up next if the video is played again
			if (this.upNextIsShown) {
				this.removeUpNext();
			}

			// Allow users to scrub back to replay video
			clearTimeout(this.upNextTimeout);
		};

		const onFirstPlayHandler = (e) => {
			if (this.options.upNextVariant === 'before-end') {
				e.target.addEventListener('timeupdate', beforeEndHandler);
			} else {
				e.target.addEventListener('ended', onEndedHandler);
			}

			this.videoEl.removeEventListener('playing', onFirstPlayHandler, true);

			e.target.addEventListener('playing', onPlayingHandler);
		};

		if (this.upNextSlot) {
			this.videoEl.addEventListener('playing', onFirstPlayHandler, true);
		}
	}

	appendUpNext () {
		// the up next list is lazy loaded so we'll fetch it lazily now...
		const item = $('.js-up-next .o-teaser');

		if (!item) return;

		const data = {
			href: $('.js-teaser-heading-link', item).href,
			heading: $('.js-teaser-heading-link', item).textContent,
			duration: $('.o-teaser__duration', item).textContent,
			variant: this.options.upNextVariant
		};

		this.upNextSlot.innerHTML = upNextTemplate(data);

		this.upNextIsShown = true;

		// return the new content so the caller knows we were successful 👌
		return this.upNextSlot.firstElementChild;
	}

	removeUpNext () {
		this.upNextSlot.innerHTML = '';
		this.upNextIsShown = false;
	}

}
