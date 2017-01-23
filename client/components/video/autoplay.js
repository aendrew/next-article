'use strict';

const lazyLoadImages = require('n-image').lazyLoad;
const oViewport = require('n-ui/viewport');

const videoPlaceholderElement = document.querySelector('.video__placeholder');
let upNextTimer = false;
let videoHasEverPlayed = false;

module.exports = oVideo => {
	oVideo.init().then(() => {
		videoPlaceholderElement.addEventListener('click', oVideo.play.bind(oVideo));

		// If the Page Visibility API is supported, and the window is hidden now,
		// defer autoplay until the window becomes visible
		if (document.hidden || document.webkitHidden) {
			oViewport.listenTo('visibility');
			document.body.addEventListener('oViewport.visibility', event => {
				if (event.detail && !event.detail.hidden && !videoHasEverPlayed) {
					oVideo.play();
				}
			});

		// If there's no visibility API support or the window is visible start playing
		} else {
			oVideo.play();
		}
	});
};

module.exports.init = () => {
	document.body.addEventListener('oTracking.event', eventForwarder);
	const placeholderVideos = document.querySelectorAll('.video__core-fallback');
	Array.from(placeholderVideos).forEach(video => {
		video.parentNode.removeChild(video);
	});
};

function eventForwarder (event) {
	const trackingDetails = event.detail;
	if (!trackingDetails || trackingDetails.category !== 'video') {
		return;
	}

	switch (trackingDetails.action) {
		case 'adStart':
		case 'playing':
			videoPlaying();
			break;

		case 'pause':
			videoPaused();
			break;

		case 'ended':
			videoEnded();
			break;

		default:
			// Ignore event
	}
}

function videoPlaying () {
	videoPlaceholderElement.classList.add('video__placeholder__played');
	videoPlaceholderElement.classList.add('video__placeholder__playing');
	clearTimeout(upNextTimer);
	videoHasEverPlayed = true;
}

function videoPaused () {
	videoPlaceholderElement.classList.remove('video__placeholder__playing');
}

function videoEnded () {
	const upNextItem = document.querySelector('li.video__up-next__list-item:first-of-type');
	const upNextPlaceholderSlot = document.querySelector('.js-placeholder-up-next');
	if (upNextItem && upNextPlaceholderSlot) {
		const rolloverUpNext = upNextItem.cloneNode(true);
		rolloverUpNext.removeAttribute('data-o-grid-colspan');

		upNextPlaceholderSlot.innerHTML = '';
		upNextPlaceholderSlot.appendChild(rolloverUpNext);

		videoPlaceholderElement.classList.add('video__placeholder__ended');
		videoPlaceholderElement.classList.remove('video__placeholder__playing');

		lazyLoadImages({ root: upNextPlaceholderSlot });

		upNextTimer = setTimeout(() => {
			const upNextPlaceholderSlot.querySelector('.o-teaser__heading a');
			upNextPlaceholderSlot.setAttribute('data-trackable', 'autoplay')
			upNextPlaceholderSlot.click();
		}, 5000);
	}
}
