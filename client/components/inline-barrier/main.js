/**
* !WIP Proof of Concept
*
* For now we simply render an inline barrier page similar to fastft.
* In future this could become an n/o-component
*/

const populateWithPsp = (el) => fetch('/products?fragment=true&inline=true&narrow=true', { credentials: 'same-origin' })
	.then(response => {
		if (response.ok) {
			return response.text().then(html => {
				const parsedHtml = new DOMParser().parseFromString(html, 'text/html');
				const pspEl = parsedHtml.querySelector('.barrier');
				//Remove duplicate ID so pa11y passes
				pspEl && pspEl.removeAttribute('id');
				const pspTitle = pspEl && pspEl.querySelector('.barrier-grid__heading-pretext');

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
				el.insertAdjacentElement('beforeend', pspEl);
			});
		}
	});

const populateWithTrial = (el) => fetch(`https://next-signup-api.ft.com/offer/41218b9e-c8ae-c934-43ad-71b13fcb4465?countryCode=GBR`, {
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
	else if (el && el.dataset.nType === 'standard' && flags.get('inArticlePreview') === 'trial') {
		populateWithTrial(el);
	}
}
