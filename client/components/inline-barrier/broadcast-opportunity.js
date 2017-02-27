import { broadcast } from 'n-ui-foundations';

module.exports = (subtype) => {
	const appNameEl = document.querySelector('[data-next-app]');
	const appVersionEl = document.querySelector('[data-next-version]');
	const context = {
		product: 'next',
		app: appNameEl && appNameEl.getAttribute('data-next-app'),
		appVersion: appVersionEl && appVersionEl.getAttribute('data-next-version')
	};
	const acquisitionContextEls = document.querySelectorAll('[data-acquisition-context]');
	const offersEls = document.querySelectorAll('[data-offer-id]');

	broadcast('oTracking.event', Object.assign({
		category: 'barrier',
		action: 'view',
		opportunity: {
			type: 'barrier',
			subtype
		},
		type: 'barrier',
		acquisitionContext: Array.from(acquisitionContextEls).map(e => e.getAttribute('data-acquisition-context')),
		offers: Array.from(offersEls).map(e => e.getAttribute('data-offer-id'))
	}, context))
};
