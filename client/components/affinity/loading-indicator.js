const util = require('n-ui/utils');

/**
* createIndicator - loading bars to display while content is lazy loading, currently specific to affinity
**/
const createIndicator = {
	/**
  * @param {Integer} amount Number of lines to return
	* @return {String} html string for lines
	**/
	createLineBlocks: (amount) => {
		const lineHtml = '<div class="loading-indicator__inner"><div class="loading-indicator__text"></div></div>';
		let htmlString = '';
		for (let i = 0; i < amount; i++) {
			htmlString += lineHtml;
		}
		return htmlString;
	},

	/**
	* @return {String} html string for loading element
	**/
	createLoadingEl: () => {
		const htmlNode = document.createElement('div');
		htmlNode.className = 'loading-indicator';
		htmlNode.setAttribute('data-loading-indicator', 'affinity');
		return htmlNode;
	},

	/**
	* add loading elements
	**/
	init: function () {
		const rhrEl = document.querySelector('#affinity-rhs');
		const bottomEl = document.querySelector('#affinity-bottom');
		if(rhrEl) {
			const rhrLoading = createIndicator.createLoadingEl();
			rhrLoading.innerHTML = createIndicator.createLineBlocks(3);
			rhrEl.appendChild(rhrLoading);
		}

		if(bottomEl) {
			const bottomLoading = createIndicator.createLoadingEl();
			bottomLoading.innerHTML = createIndicator.createLineBlocks(1);
			bottomEl.appendChild(bottomLoading);
		}
	},

	/**
	* remove loading elements
	**/
	destroy: () => {
		const indicators = util.$$('[data-loading-indicator="affinity"]');
		indicators.forEach((indicator) => {
			indicator.parentNode.removeChild(indicator);
		});
	}
}

module.exports = createIndicator;
