import React from 'react';
import ReactDOM from 'react-dom';
import { EmailArticleData, emailArticleModes, EmailArticleView } from 'n-email-article';
import OShare from 'o-share';

exports.init = function () {
	const shareContainer = document.querySelector('[data-o-component=o-share]');
	if (shareContainer && !shareContainer.classList.contains('data-o-share--js')) {
		new OShare(shareContainer);
	}

	const emailArticle = {}; // we will lazily load the email article stuff when they're needed
	[...document.querySelectorAll('[data-n-article-email-clickable]')].forEach(button => {
		button.addEventListener('click', () => {
			const attr = button.getAttribute('data-n-article-email-free-article');
			const isFreeArticle = attr === true || attr === 'true';
			const mode = isFreeArticle ? emailArticleModes.FREE : emailArticleModes.GIFT_OR_SUB;
			// lazily load the data
			if (!emailArticle.data) emailArticle.data = new EmailArticleData(mode);
			const id = button.getAttribute('data-n-article-email-container');
			const isTop = id === 'top';
			// lazily load the view
			if (!emailArticle[id]) {
				const props = {
					mode: mode,
					isTop: isTop,
					store: emailArticle.data.store,
					actions: emailArticle.data.actions,
					dispatch: emailArticle.data.dispatch
				};
				emailArticle[id] = React.createElement(EmailArticleView, props);
				const container = document.querySelector(`[data-n-article-email-${id}-container]`);
				ReactDOM.render(emailArticle[id], container);
			}
			// toggle showing/hiding of the view
			emailArticle.data.dispatch(emailArticle.data.actions[isTop ? 'toggleOpenTop' : 'toggleOpenBottom']());
		});
	});

};
