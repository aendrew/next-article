/**
* !WIP Proof of Concept
*
* For now we simply render an inline barrier page similar to fastft.
* In future this could become an n/o-component
*/

import { broadcast } from 'n-ui/utils';

const broadcastOpportunity = (subtype) => {
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

const populateWithPsp = (el) => fetch('/products?fragment=true&inline=true&narrow=true&in-article=true', { credentials: 'same-origin' })
	.then(response => {
		if (response.ok) {
			return response.text().then(html => {
				const parsedHtml = new DOMParser().parseFromString(html, 'text/html');
				const coreWrapper = el.querySelector('.inline-barrier__content');
				const pspEl = parsedHtml.querySelector('.barrier');

				if (!el || !pspEl || !coreWrapper) { return; }

				//Remove duplicate ID so pa11y passes
				pspEl.removeAttribute('id');
				const pspTitle = pspEl.querySelector('.barrier-grid__heading-pretext');

				if (pspTitle) {
					// Horrible hacks to modify the PSP title text, for a slightly dirty MVT
					const titleContainer = pspTitle.parentElement;
					const nonH1Title = document.createElement('p');
					nonH1Title.className = 'barrier-grid__heading barrier-grid__heading-pretext';
					nonH1Title.innerHTML = 'Want to read more?';
					const sub = document.createElement('p');
					sub.innerHTML = '<span class="barrier-grid__article-title">Subscribe by choosing a package below:</span>';
					titleContainer.insertAdjacentElement('beforeend', nonH1Title);
					titleContainer.insertAdjacentElement('beforeend', sub);
					pspTitle.remove();
				}

				el.classList.remove('inline-barrier--no-prices');
				el.replaceChild(pspEl, coreWrapper);

				broadcastOpportunity('inline-psp');
			});
		}
	})
	});

const populateWithTrial = (el) => fetch(`https://next-signup-api.ft.com/offer/41218b9e-c8ae-c934-43ad-71b13fcb4465?countryCode=${el.dataset.countryCode}`, {
	headers: {
		'x-api-env': 'prod'
	}
})
	.then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Network response was not ok.');
		}
	})
	.then(json => json.data)
	.then(({offer}) => {
		const priceables = [...document.querySelectorAll('.js-barrier-trial-price')];
		const trialOffer = offer.charges.find(charge => charge.billing_period === 'trial');
		//TODO: investigate localization of symbol/value ordering
		priceables.forEach(priceable => priceable.innerHTML = `${trialOffer.amount.symbol}${trialOffer.amount.value.replace('.00', '')}`);
		el.classList.remove('inline-barrier--no-prices');

		broadcastOpportunity('inline-trial');
	})
	.catch(() => {
		// eslint-disable-next-line no-console
		console.error('Failed to retrieve/process trial offer data');
	})
	.then(() => {
		el.classList.add('inline-barrier--done');
	});

export default (flags) => {
	const el = document.querySelector('.inline-barrier');

	if (el && el.dataset.nType === 'standard' && flags.get('inArticlePreview') === 'psp') {
		populateWithPsp(el);
	}
	else if (el && el.dataset.nType === 'standard' && el.dataset.countryCode && flags.get('inArticlePreview') === 'trial') {
		populateWithTrial(el);
	}
}
