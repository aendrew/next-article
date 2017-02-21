const seriesMarkup = `PREVIOUS < HOME > NEXT`

module.exports = function series ($, flags, options) {
	if (!flags || !flags.contentPackages || (options && options.fragment)) return $;

	const pars = $('p');
	if (pars.length < 6) return $;

	positionComponent(pars.length / 2);
	return $;

	function positionComponent (position) {
		pars.each((index, par) => {
			let indexMatches = ((index + 1) >= position);
			let isOrphan = !par.parent;
			let hasNextP = (par.next && par.next.name === 'p');
			if (indexMatches && isOrphan && hasNextP) {
				$(par).after(seriesMarkup);
				return false;
			}
		});
	}
};
