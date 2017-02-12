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

				el.insertAdjacentElement('beforeend', pspEl);
			});
		}
	});

export default (flags) => {
	const el = document.querySelector('.inline-barrier');

	if (el && el.dataset.nType === 'standard' && flags.get('inArticlePreview') === 'psp') {
		populateWithPsp(el);
	}
}
