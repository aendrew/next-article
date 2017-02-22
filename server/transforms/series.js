module.exports = function series ($, flags, options) {
	if (!flags || !flags.contentPackages || (options && options.fragment) || (options && !options.contentPackage)) return $;

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
				$(par).after(seriesMarkup(options.contentPackage.package));
				return false;
			}
		});
	}
};

function seriesMarkup (pkg) {
	return `<section data-o-component="o-expander" class="package__mid-article o-expander" data-o-expander-shrink-to="hidden"
		data-o-expander-collapsed-toggle-text="" data-o-expander-expanded-toggle-text="">
		<h1>Series</h1><h1>${pkg.title}</h1>
		<p>${pkg.description}</p>
		<h1>Explore the whole series</h1><button class="o-expander__toggle"></button>
		<ul class="o-expander__content">
			${pkg.contains.map(item => `<li>${item.title}</li>`).join('')}
		</ul>
	</section>`
}
