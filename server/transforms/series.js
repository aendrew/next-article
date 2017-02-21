module.exports = function series ($, flags, options) {
	if (!flags || !flags.contentPackages || (options && options.fragment) || (options && !options.contentPackage)) return $;

	const pars = $('p');
	if (pars.length < 6) return $;

	positionComponent(pars.length / 2);
	return $;

	function positionComponent (position) {
		const context = options.contentPackage.context;
		const seriesMarkup = `<section class="package__context">
			<a class="package__context-element package__link" href="${context.prev.url}"><h3>Previous:</h3><h4>${context.prev.title}</h4></a>
			<a class="package__context-element package__link" href="${context.home.url}"><h3>Home:</h3><h4>${context.home.title}</h4></a>
			<a class="package__context-element package__link" href="${context.next.url}"><h3>Next:</h3><h4>${context.next.title}</h4></a>
		</section>`;

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
