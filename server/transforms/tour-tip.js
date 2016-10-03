const getRandomTourTipHtml = require('../lib/get-random-tour-tip-html');

function removeInsignificantElsFromChain (els, options) {

	// remove from chain any els that can be ignored when finding position because they're invisible or whatever
	//
	// insignificant elements:
	//  - light sign up (but only when user us anonymous)

	function isSignificant (el) {
		if(!el || !el.attribs) {
			return false;
		}
		const elIsLightSignUp = Object.keys(el.attribs).includes('data-o-email-only-signup-position-mvt');

		return !elIsLightSignUp || (options.userIsAnonymous && elIsLightSignUp);
	}

	function getNextSignificantEl (el) {
		return el && (isSignificant(el.next) ? el.next : el.next && el.next.next);
	}

	function getPrevSignificantEl (el) {
		return el && (isSignificant(el.prev) ? el.prev : el.prev && el.prev.prev);
	}

	els.each((index, el) => {
		el.next = getNextSignificantEl(el);
		el.prev = getPrevSignificantEl(el);
	});

	return els;
}

function positionComponent ($, position) {
	$('p').each((index, par) => {

		const indexMatches = ((index + 1) >= position);
		const isOrphan = !par.parent;

		const hasTwoFollowingPs = par.next && par.next.next && par.next.name === 'p' && par.next.next.name === 'p';
		const secondPIsNotJustIntroForQuote = par.next && par.next.next && (!par.next.next.next || par.next.next.next.name !== 'blockquote');
		const prevIsPOrNothing = index <= 1 || !par.prev || par.prev.name === 'p';
		const prevPrevIsPOrNothing = index <= 2 || !par.prev || !par.prev.prev || par.prev.prev.name === 'p';

		if (indexMatches && isOrphan && hasTwoFollowingPs && secondPIsNotJustIntroForQuote && prevIsPOrNothing && prevPrevIsPOrNothing) {
			$(par).after(getRandomTourTipHtml());
			return false;
		}
	});
}

module.exports = function ($, flags, options = {}) {
	if (flags && flags.nextFtTour && flags.nextFtTourTipArticlePage && !options.fragment) {
		removeInsignificantElsFromChain($('*'), options);
		positionComponent($, 6);
	}
	return $;
};
