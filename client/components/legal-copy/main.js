'use strict';

//todo - It might be better to embed this in the HTML rather than hard-code it here??
const tsAndCsLink = 'http://help.ft.com/legal/ft-com-terms-and-conditions/';
const copyrightLink = 'http://help.ft.com/legal/copyright-policy/';
const supportEmail = 'ftsales.support@ft.com';
const msgText = `High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article. See our T&Cs and Copyright Policy for more detail. Email ${supportEmail} to buy additional rights.`;
const msgHtml = `High quality global journalism requires investment. Please share this article with others using the link below, do not cut & paste the article.  See our <a href="${tsAndCsLink}">T&Cs</a> and <a href="${copyrightLink}">Copyright Policy</a> for more detail. Email <a href="mailto:${supportEmail}">${supportEmail}</a> to buy additional rights.`;

const supportsClipboard = e => e.clipboardData || window.clipboardData;
const hasEventClipboardSupport = e => !!(e.clipboardData && e.clipboardData.setData);
const getSelectionText = () => window.getSelection().toString();
const countWords = text => text.split(/\s+/).length;

let altPressed = false;
const ALT = 18;

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

	// Helps detect copy event without interfering with Text-to-speech software
	document.body.addEventListener('keydown', interceptKeys);
	document.body.addEventListener('copy', handleCopy);
};

// Alt+Esc triggers 'copy' event in chrome 56 and under
// A lot of text-to-speech software relies on these keys to read out text to the user.
function interceptKeys (e) {

	// Remember if alt was pressed
	if (e.keyCode === ALT) {
		altPressed = true;

		// Clean up after 10 seconds
		setTimeout(function () {
			altPressed = false;
		}, 10000);
	}
}

// Trigger onCopy only if alt hasn't been pressed immediately prior
function handleCopy (e) {
	if (!altPressed) {
		onCopy(e);
	}
	altPressed = false;
};
