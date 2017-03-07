import {broadcast} from 'n-ui-foundations';
const superstore = require('superstore-sync');

const engagementKey = 'next.comments.engagement';
let initialCommentEngagement;

function isWithinNDays (timestamp, n) {
	return (Date.now() - timestamp) < (1000 * 60 * 60 * 24 * n)
}

function getCommentEngagement () {
	let value = superstore.local.get(engagementKey)
	if (!value) {
		return 'none';
	}

	// if has actively sought aout/interacted with comments in the last 30 days
	if (value.active && isWithinNDays(value.active, 30)) {
		return 'active';
	}

	if (value.passive) {
		// if scrolled as far as comments once in the last 5 days or 4 times in the last month
		if (isWithinNDays(value.passive[0], 5) ||	value.passive.filter(timestamp => isWithinNDays(timestamp, 30)).length > 3) {
			return 'passive';
		}
	}

	return 'previous';
}

function logCommentEngagement (type) {
	let value = superstore.local.get(engagementKey)
	value = value || {active: null, passive: []};
	if (type === 'active') {
		value.active = Date.now();
	} else {
		value.passive.unshift(Date.now())
		if (value.passive.length > 10) {
			value.passive = value.passive.slice(0, 10);
		}
	}
	superstore.local.set(engagementKey, value)
}

function getInitialEngagement () {
	if (!initialCommentEngagement) {
		initialCommentEngagement = getCommentEngagement();
	}
	return initialCommentEngagement;
}


module.exports = {
	init: () => {
		getInitialEngagement();

		if (window.IntersectionObserver) {
			const rumIndicatorEl = document.querySelector('.comments__rum-indicator');
			const rumObserver = new IntersectionObserver(
				() => {
					window.FT.commentsRumInView = Date.now();

					broadcast('oTracking.event', {
						action: 'view',
						category: 'comments',
						context: {
							product: 'next',
							source: 'next-article',
							uiIsDelayed: !window.FT.commentsRumLoaded,
							userEngagement: initialCommentEngagement
						}
					});
					logCommentEngagement('passive')
					rumObserver.unobserve(rumIndicatorEl);
				},
				{ rootMargin: '0px' }
			);
			rumObserver.observe(rumIndicatorEl);
		}

		document.body.addEventListener('oComments.widget.renderComplete', () => {
			window.FT.commentsRumLoaded = Date.now();
			// TODO - record number of comments fetched
			broadcast('oTracking.event', {
				category: 'comments',
				action: 'ready',
				context: {
					timeToLoad: window.FT.commentsRumLoaded - window.FT.commentsRumLoadStart,
					userIsViewing: !!window.FT.commentsRumInView,
					timeUserWaitedToView: window.FT.commentsRumInView ? window.FT.commentsRumLoaded - window.FT.commentsRumInView : 0,
					userEngagement: initialCommentEngagement
				}
			});
		})

		Array.from(document.querySelectorAll('[href="#comments"]')).forEach(el => {
			el.addEventListener('click', () => logCommentEngagement('active'));
		})

		document.body.addEventListener('oComments.tracking.postComment', () => logCommentEngagement('active'));

		document.body.addEventListener('oComments.tracking.likeComment', () => logCommentEngagement('active'));

		document.body.addEventListener('oComments.tracking.shareComment', () => logCommentEngagement('active'));

	},
	getInitialEngagement: getInitialEngagement

};
