const createIndicator = {
	init: function () {
		const loadingIndicator = document.createElement('div');
		const loadingIndicatorInner = document.createElement('div');
		const loadingIndicatorAvatar = document.createElement('div');
		const loadingIndicatorPod = document.createElement('div');
		const indicatorEl = document.querySelector('.loading-indicator-bottom');

		loadingIndicator.className = 'loading-indicator';
		loadingIndicator.setAttribute('data-loading-indicator', 'affinity');
		loadingIndicatorInner.className = 'loading-indicator__inner';
		loadingIndicatorAvatar.className = 'loading-indicator__avatar';
		loadingIndicatorPod.className = 'loading-indicator__text';

		loadingIndicatorInner.appendChild(loadingIndicatorAvatar);
		loadingIndicatorInner.appendChild(loadingIndicatorPod);
		loadingIndicator.innerHTML += loadingIndicatorInner.outerHTML;
		loadingIndicator.innerHTML += loadingIndicatorInner.outerHTML;
		loadingIndicator.innerHTML += loadingIndicatorInner.outerHTML;
		indicatorEl.parentNode.insertBefore(loadingIndicator, indicatorEl.nextSibling);
	}
}

module.exports = createIndicator;
