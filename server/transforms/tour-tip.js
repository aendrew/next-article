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
	const paragraphs = $.root().children('p');

	const match = paragraphs.filter(i => {
		if (i + 1 < position) return false;

		const p = paragraphs.eq(i);

		const hasThreeFollowingPs = p.nextUntil(':not(p)').length >= 3;
		const prevIsPOrNothing = p.prev().length === 0 || p.prev().is('p');

		return hasThreeFollowingPs && prevIsPOrNothing;
	});

	match.first().after(getRandomTourTipHtml());
}

module.exports = function ($, flags, options = {}) {
	const flagsOn = flags && flags.nextFtTour && flags.nextFtTourTipArticlePage;
	const anonymous = typeof options.userIsAnonymous === 'undefined' || options.userIsAnonymous;

	if (flagsOn && !options.fragment && !anonymous) {
		removeInsignificantElsFromChain($('*'), options);
		positionComponent($, 6);
	}
	return $;
};
