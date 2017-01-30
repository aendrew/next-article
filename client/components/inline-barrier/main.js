/**
* !WIP Proof of Concept
*
* For now we simply render an inline barrier page similar to fastft.
* In future this could become an n/o-component
*/

const populateWithBarrier = (el) => {
	return fetch('/products?fragment=true&inline=true&narrow=true', { credentials: 'same-origin' })
		.then(response => {
			if (response.ok) {
				return response.text().then(html => {
					el.insertAdjacentHTML('beforeend', html);
					el.classList.remove('n-util-visually-hidden');
				});
			}
		});
}

export default () => {
	const el = document.querySelector('#inline-barrier');

	if (el && el.dataset.nType === 'standard') {
		populateWithBarrier(el);
	}
}
