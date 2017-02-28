const fetchres = require('fetchres');
const Gallery = require('o-gallery');
import {broadcast} from 'n-ui-foundations';

module.exports = function (els) {
	[].slice.call(els).forEach(function (el) {
		const uuid = el.getAttribute('data-uuid');
		const syncid = el.getAttribute('data-syncid');
		if (uuid) {
			const picturesSeen = [];
			let totalPictures;
			const fireBeacon = function (picture) {
				if (picturesSeen.indexOf(picture) > -1) {
					return;
				}
				picturesSeen.push(picture);
				const data = {
					action: 'gallery',
					category: 'page',
					meta: {
						picture: picture,
						totalPictures: totalPictures,
						percentageThrough: (100 / totalPictures) * (picturesSeen.length + 1)
					},
					context: {
						product: 'next',
						source: 'next-article'
					}
				};
				broadcast('oTracking.event', data);
			};
			fetch('/embedded-components/slideshow/' + uuid + '?syncid=' + syncid, { credentials: 'same-origin' })
				.then(fetchres.text)
				.then(function (data) {
					const container = document.createElement('div');
					container.setAttribute('class', 'article__gallery');
					container.innerHTML = data;
					el.parentNode.replaceChild(container, el);
					return container;
				})
				.then(function (el) {
					el.addEventListener('oGallery.itemSelect', function (ev) {
						if (ev.target.classList.contains('o-gallery--slideshow')) {
							fireBeacon(ev.detail.itemID + 1);
						}
					});
					el.addEventListener('oGallery.ready', function (ev) {
						totalPictures = ev.target.querySelectorAll('.o-gallery__item').length;
						fireBeacon(1);
					});
					return Gallery.init(el);
				})
				.catch(function (err) {
					setTimeout(function () {
						throw err;
					});
				});
		}
	});
};
