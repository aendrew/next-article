module.exports = function ($, flags, options) {
	if (!flags || !flags.lightSignupInArticle || (options && options.fragment)) return $;

	const pars = $('p');

	positionComponent(1);

	return $;

	function positionComponent (position) {
		pars.each((index, par) => {
			let indexMatches = ((index + 1) >= position);
			let isOrphan = !par.parent;
			let hasNextP = (par.next && par.next.name === 'p');
			if (indexMatches && isOrphan && hasNextP) {
				$(par).after('<div class="p402_hide" data-o-email-only-signup-position-mvt aria-hidden="true"></div>');
				return false;
			}
		});
	}

};
