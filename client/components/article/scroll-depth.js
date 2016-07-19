import trackEvent from '../utils/tracking';

const fireBeacon = percentage => {
	var data = {
		action: 'scrolldepth',
		category: 'page',
		meta: {
			percentagesViewed: percentage
		},
		context: {
			product: 'next',
			source: 'next-article'
		}
	};
	trackEvent(data);
};

const intersectionCallback = (observer, changes) => {
	changes.forEach(change => {
		const scrollDepthMarkerEl = change.target;
		fireBeacon(scrollDepthMarkerEl.getAttribute('data-percentage'));
		observer.unobserve(scrollDepthMarkerEl);
		scrollDepthMarkerEl.parentNode.removeChild(scrollDepthMarkerEl);
	});
};

export default (flags, { percentages = [25, 50, 75, 100], articleBodySelector = '.article__body'} = { }) => {
	const articleBody = document.querySelector(articleBodySelector);
	if (flags.get('articleScrollDepthTracking') && articleBody) {
		const observer = new IntersectionObserver(
			function (changes) {
				intersectionCallback(this, changes);
			}
		);
		percentages.forEach(percentage => {
			// add a scroll depth marker element
			const targetEl = document.createElement('div');
			targetEl.className = 'article__body__scroll-depth-marker';
			targetEl.style.top = `${percentage}%`;
			targetEl.setAttribute('data-percentage', percentage);
			articleBody.appendChild(targetEl);
			observer.observe(targetEl);
		});
	}
};
