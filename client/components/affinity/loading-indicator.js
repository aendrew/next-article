const createIndicator = {
	init: function () {

		if(document.querySelector('.loading-indicator-rhr')) {
			const rhrLoading = document.createElement('div');
			const rhrLoadingInner = document.createElement('div');
			const rhrLoadingPod = document.createElement('div');
			const rhrLoadingEl = document.querySelector('.loading-indicator-rhr');

			rhrLoading.className = 'loading-indicator';
			rhrLoading.setAttribute('data-loading-indicator', 'affinity');
			rhrLoadingInner.className = 'loading-indicator__inner';
			rhrLoadingPod.className = 'loading-indicator__text';

			rhrLoadingInner.appendChild(rhrLoadingPod);
			rhrLoading.innerHTML += rhrLoadingInner.outerHTML;
			rhrLoading.innerHTML += rhrLoadingInner.outerHTML;
			rhrLoading.innerHTML += rhrLoadingInner.outerHTML;
			rhrLoadingEl.parentNode.insertBefore(rhrLoading, rhrLoadingEl.nextSibling);
		}

		if(document.querySelector('.loading-indicator-bottom')) {
			const bottomLoading = document.createElement('div');
			const bottomLoadingInner = document.createElement('div');
			const bottomLoadingAvatar = document.createElement('div');
			const bottomLoadingPod = document.createElement('div');
			const bottomLoadingEl = document.querySelector('.loading-indicator-bottom');

			bottomLoading.className = 'loading-indicator';
			bottomLoading.setAttribute('data-loading-indicator', 'affinity');
			bottomLoadingInner.className = 'loading-indicator__inner';
			bottomLoadingAvatar.className = 'loading-indicator__avatar';
			bottomLoadingPod.className = 'loading-indicator__text';

			bottomLoadingInner.appendChild(bottomLoadingAvatar);
			bottomLoadingInner.appendChild(bottomLoadingPod);
			bottomLoading.innerHTML += bottomLoadingInner.outerHTML;
			bottomLoading.innerHTML += bottomLoadingInner.outerHTML;
			bottomLoading.innerHTML += bottomLoadingInner.outerHTML;
			bottomLoadingEl.parentNode.insertBefore(bottomLoading, bottomLoadingEl.nextSibling);
		}

	}
}

module.exports = createIndicator;
