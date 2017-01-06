'use strict';

//todo - It might be better to embed this in the HTML rather than hard-code it here??
const tsAndCsLink = 'http://help.ft.com/legal/ft-com-terms-and-conditions/';
const copyrightLink = 'http://help.ft.com/legal/copyright-policy/';
const supportEmail = 'ftsales.support@ft.com';
const msgText = `High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article. See our Ts&Cs and Copyright Policy for more detail. Email ${supportEmail} to buy additional rights.`;
const msgHtml = `
	High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article.
	See our <a href="${tsAndCsLink}"T>s&Cs</a> and <a href="${copyrightLink}">Copyright Policy</a> for more detail. Email <a href="mailto:${supportEmail}">${supportEmail}</a> to buy additional rights.`
;

const supportsClipboard = e => e.clipboardData || window.clipboardData;
const hasEventClipboardSupport = e => !!(e.clipboardData && e.clipboardData.setData);
const getSelectionText = () => window.getSelection().toString();
const countWords = text => text.split(/\s+/).length;

function setClipboard (e, html, text){
	if(hasEventClipboardSupport(e)){
		e.clipboardData.setData('text/html', html);
		e.clipboardData.setData('text/plain', text);
	}else{
		window.clipboardData.setData('Text', text);
	}

	e.preventDefault();
}

function getHTMLMessage (selectedText){
	return `${msgHtml} <br> <a href="${location.href}">${location.href}</a><br><br> ${selectedText}`;
}

function getTextMessage (selectedText){
	return `
	${msgText}
	${location.href}

	${selectedText}
`;
}

function onCopy (e){
	if(!supportsClipboard(e)){
		return;
	}

	const selectedText = getSelectionText();
	const wordCount = countWords(selectedText);

	if(wordCount > 30){
		const text = getTextMessage(selectedText);
		const html = getHTMLMessage(selectedText);
		setClipboard(e, html, text);
	}
}

module.exports = function (flags) {
	if(!flags.get('articleCopyLegalNotice')){
		return;
	}

	const articleBody = document.querySelector('[data-legal-copy]');

	if(!articleBody) {
		return
	}

	articleBody.addEventListener('copy', onCopy);
};
