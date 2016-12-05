'use strict';

const lazyLoadImages = require('n-image').lazyLoad;

const videoPlaceholderElement = document.querySelector('.video__placeholder');
let upNextTimer = false;

module.exports = oVideo => {
	oVideo.init().then(() => {
		oVideo.play();
		videoPlaceholderElement.addEventListener('click', oVideo.play.bind(oVideo));
	})
};

module.exports.init = () => {
	document.body.addEventListener('oTracking.event', eventForwarder);
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
			upNextPlaceholderSlot.querySelector('a').click();
		}, 5000);
	}
}
