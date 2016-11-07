'use strict';

function supportsClipboard (e) { return e.clipboardData || window.clipboardData; }
function hasEventClipboardSupport (e) { return e.clipboardData && !!e.clipboardData.setData }

module.exports = function (flags) {
	const articleBody = document.querySelector('[data-legal-copy]');

	if(!articleBody) { return }
	if (!flags.get('articleCopyLegalNotice')) { return }

	const tsAndCsLink = 'http://help.ft.com/legal/ft-com-terms-and-conditions/';
	const copyrightLink = 'http://help.ft.com/legal/copyright-policy/';
	const supportEmail = 'ftsales.support@ft.com';

	const msgText = `High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article. See our Ts&Cs and Copyright Policy for more detail. Email ${supportEmail} to buy additional rights.`;
	const msgHtml = `High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article. See our <a href="${tsAndCsLink}" target="_blank">Ts&Cs</a> and <a href="${copyrightLink}" target="_blank">Copyright</a> Policy for more detail. Email <a href="mailto:${supportEmail}">${supportEmail}</a> to buy additional rights.`;

	articleBody.addEventListener('copy', (e) => {
		if(!supportsClipboard(e)) { return }

		if(hasEventClipboardSupport(e)) {
			e.clipboardData.setData('text/html', msgHtml);
		} else {
			window.clipboardData.setData('Text', msgText);
		}

		e.preventDefault();
	});
}
