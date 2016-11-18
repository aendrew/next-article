const fetchres = require('fetchres');
const oDate = require('n-ui/date');
const lazyLoadImages = require('n-image').lazyLoad;
import * as serviceWorker from 'n-service-worker';

const $ = selector => [].slice.call(document.querySelectorAll(selector));

function createPromise (el, url) {
	return fetch(url, { credentials: 'same-origin' })
		.then(fetchres.text)
		.then(resp => {
			if (!resp) {
				throw new Error('No response');
			}
			el.innerHTML = resp;
			oDate.init(el);
		})
		.catch(() => {});
}

module.exports.init = () => {

	const articleEl = document.querySelector('.article');
	const dehydratedMetadata = document.getElementById('dehydrated-metadata');

	if (!articleEl || !dehydratedMetadata) {
		return;
	}

	const articleId = articleEl.getAttribute('data-content-id');

	// If there is no articleId don't try to load related content
	if (!articleId) {
		return;
	}

	let fetchPromises = [];
	const hydratedMetadata = JSON.parse(dehydratedMetadata.innerHTML);

	if (hydratedMetadata.package && hydratedMetadata.package.length) {
		let storyIds = hydratedMetadata.package.map(article => article.id);
		let url = `/article/${articleId}/story-package?articleIds=${storyIds.join()}&count=5`;

		fetchPromises = fetchPromises.concat(
			$('.js-story-package').map(el => createPromise(el, url))
		);
	}

	let specialReport = hydratedMetadata.moreOns && hydratedMetadata.moreOns.find(tag => tag.taxonomy === 'specialReports');

	if (specialReport) {
		let url = `/article/${articleId}/special-report?tagId=${encodeURI(specialReport.idV1)}&count=5`;

		fetchPromises = fetchPromises.concat(
			$('.js-special-report').map(el => createPromise(el, url))
		);
	}

	const moreOns = $('.js-more-on');

	if (moreOns.length) {
		let url = `/article/${articleId}/more-on?count=3`;

		let tagIds = hydratedMetadata.moreOns.map((moreOn) => {
			return encodeURI(moreOn.idV1);
		}).join(',');

		fetchPromises = fetchPromises.concat(
			moreOns.map((el, i) => {
				let query = `tagIds=${tagIds}&index=${i}`;
				return createPromise(el, `${url}&${query}`);
			})
		);
	}

	return Promise.all(
		fetchPromises.map(p => p.catch(() => null))
	)
		.then(() => {
			lazyLoadImages();
			serviceWorker
				.message({
					type: 'cacheContent',
					content: [...document.querySelectorAll('.more-on .pod__item-wrapper--lead .pod__item__headline-link')]
						.map(linkEl => ({ url: linkEl.getAttribute('href') }))
				})
				.catch(() => { });
		});
};
