module.exports = function ($, flags) {
	const pars = $('p');
	const midAd = (adIndex) =>
		adIndex === 0 ?
			`<div class="o-ads in-article-advert advert"
				data-o-ads-name="mpu"
				data-o-ads-center="true"
				data-o-ads-label="true"
				data-o-ads-targeting="pos=mid;"
				data-o-ads-formats-default="MediumRectangle,Responsive"
				data-o-ads-formats-small="MediumRectangle,Responsive"
				data-o-ads-formats-medium="MediumRectangle,Responsive"
				data-o-ads-formats-large="${flags.threeAdProposition ? 'false' : 'Responsive'}"
				data-o-ads-formats-extra="${flags.threeAdProposition ? 'false' : 'Responsive'}"
				data-o-ads-collapse-empty="true"
				aria-hidden="true"></div>` :
		`<div class="o-ads in-article-advert advert"
				data-o-ads-name="second-mpu"
				data-o-ads-center="true"
				data-o-ads-label="true"
				data-o-ads-targeting="pos=mid;"
				data-o-ads-formats-default="MediumRectangle,Responsive"
				data-o-ads-formats-small="MediumRectangle,Responsive"
				data-o-ads-formats-medium="false"
				data-o-ads-formats-large="false"
				data-o-ads-formats-extra="false"
				data-o-ads-collapse-empty="true"
				aria-hidden="true"></div>`;
	;


	if(flags.threeAdProposition && pars.length <= 3) {
		//If article shorter than three pars, insert an ad right at the end
		$('p').last().after(midAd);
	} else {

		const maxAdsToRender = 2;
		let nextAvailableIndex = 1;
		let adsRendered = 0;

		for(let index = 0; index < pars.length; index++) {
			const par = pars[index];
			const isBetweenParagraphs = par.next && par.next.name === 'p' && !par.parent && par.prev && par.prev.name !== 'aside';

			if(index > nextAvailableIndex && isBetweenParagraphs && adsRendered < maxAdsToRender) {
				$(par).after(midAd(adsRendered++));

				if(flags.threeAdProposition) {
					nextAvailableIndex = index + 5; //insert an Ad after another 6 paragraphs
				} else {
					break; // no more ads to render
				}
			}
		}
	}

	return $;
};
