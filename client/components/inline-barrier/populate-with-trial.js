module.exports = (el) => fetch(`https://next-signup-api.ft.com/offer/41218b9e-c8ae-c934-43ad-71b13fcb4465?countryCode=${el.dataset.countryCode}`, {
	headers: {
		'x-api-env': 'prod'
	}
})
	.then(response => {
		if (!response.ok) {
			throw new Error(`Request for trial offer data returned a bad response. Status: ${response.status}`);
		}
		return response.json();
	})
	.then(json => json.data)
	.then(({offer}) => {
		const coreWrapper = el.querySelector('.inline-barrier__content');
		const enhancedTrialTemplate = document.querySelector('#js-barrier-trial');

		if (!el || !enhancedTrialTemplate || !coreWrapper) { return; }

		coreWrapper.innerHTML = enhancedTrialTemplate.innerHTML;
		const trialPriceables = [...coreWrapper.querySelectorAll('.js-barrier-trial-price')];
		const postTrialPriceables = [...coreWrapper.querySelectorAll('.js-barrier-trial-after-price')];

		const trialOffer = offer.charges.find(charge => charge.billing_period === 'trial');
		//FIXME: make sure this is the right object: why different amounts from psp page?
		const postTrialOffer = offer.charges.find(charge => charge.billing_period === 'monthly');
		//TODO: investigate localization of symbol/value ordering

		trialPriceables.forEach(priceable => priceable.innerHTML = `${trialOffer.amount.symbol}${trialOffer.amount.value.replace('.00', '')}`);
		postTrialPriceables.forEach(priceable => priceable.innerHTML = `${postTrialOffer.display_amount.weekly.symbol}${postTrialOffer.display_amount.weekly.value}`);
	});
