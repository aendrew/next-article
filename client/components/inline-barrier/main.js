/**
* !WIP Proof of Concept
*
* For now we simply render an inline barrier page similar to fastft.
*/

const populateWithBarrier = (el) => {
	return fetch('/products?fragment=true&inline=true&narrow=true', { credentials: 'same-origin' })
		.then(response => {
			if (response.ok) {
				return response.text().then(html => {
					el.insertAdjacentHTML('beforeend', html);
					el.classList.remove('n-util-visually-hidden');
				});
			} else {
				return response.text().then(() => {throw('Could not fetch barrier content')});
			}
		})
		.catch(() => {
			// console.log(error.toString());
		});
}

export default () => {
	const el = document.querySelector('#inline-barrier');

	if (el && el.dataset.nType === 'standard') {
		populateWithBarrier(el);
	}
}
