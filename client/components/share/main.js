import React from 'react';
import ReactDOM from 'react-dom';
import { EmailArticleData, emailArticleModes, EmailArticleView } from '@financial-times/n-email-article';
import OShare from 'o-share';

exports.init = function (flags) {

	const shareContainers = document.querySelectorAll('[data-o-component=o-share]');

	for (let i = 0; i < shareContainers.length; i++) {

		if (shareContainers[i] && !shareContainers[i].classList.contains('data-o-share--js')) {

			new OShare(shareContainers[i]);

		}

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
					dispatch: emailArticle.data.dispatch,
					customMessage: flags.articleShareEmailCustomMessage
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
