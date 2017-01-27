/**
* !WIP Proof of Concept
*
* For now we simply render an inline barrier page similar to fastft.
*/

const populateWithBarrier = () => {
	return fetch('/products?fragment=true&inline=true&narrow=true', { credentials: 'same-origin' })
		.then(response => {
			if (response.ok) {
				return response.text().then(html => {
					document.querySelector('#inline-barrier').insertAdjacentHTML('beforeend', html);
					document.querySelector('#inline-barrier').classList.remove('n-util-visually-hidden');
				});
			} else {
				return response.text().then(text => {throw(`Could not barrier content`)});
			}
		})
		.catch(error => {
			console.log(error.toString());
		});
}

export default (flags) => {
	const el = document.querySelector('#inline-barrier');
	if (el) {
		populateWithBarrier();
	}
}
