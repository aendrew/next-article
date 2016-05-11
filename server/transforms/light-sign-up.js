'use strict';

module.exports = function ($, flags, options) {
	if (!flags || !flags.lightSignUp || (options && options.fragment)) return $;

	const pars = $('p');
	const variant = flags.lightSignUp;
	const sectionData = options.metadata.primarySection || null;
	let mailingList = {
		name: 'default',
		prefLabel: 'default'
	}

	if (sectionData && sectionData.name && sectionData.prefLabel) {
		mailingList = Object.assign(mailingList, sectionData);
	}

	if (variant === 'top') positionComponent(1, true);
	if (variant === 'mid') positionComponent(5, true);
	if (variant === 'end') positionComponent(pars.length, false);

	return $;

	function positionComponent (position, checkNextP) {
		pars.each((index, par) => {
			let indexMatches = ((index + 1) >= position);
			let isOrphan = !par.parent;
			let hasNextP = (par.next && par.next.name === 'p');
			if (indexMatches && isOrphan && (hasNextP || !checkNextP)) {
				$(par).after(`<div class="n-light-signup__container" data-n-light-signup-list-name="${mailingList.name}" data-n-light-signup-list-pref-label="${mailingList.prefLabel}"></div>`);
				return false;
			}
		});
	}

};
