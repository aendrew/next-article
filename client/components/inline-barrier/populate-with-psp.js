module.exports = (el) => fetch('/products?fragment=true&inline=true&narrow=true&in-article=true', { credentials: 'same-origin' })
	.then(response => {
		if (!response.ok) {
			throw new Error(`Request for PSP fragment returned a bad response. Status: ${response.status}`);
		}
		return response.text();
	})
	.then(html => {
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

		el.replaceChild(pspEl, coreWrapper);
	});
