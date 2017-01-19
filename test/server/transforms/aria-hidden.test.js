const cheerio = require('cheerio');
const ariaHiddenTransform = require('../../../server/transforms/aria-hidden');

require('chai').should();

describe('Adding aria-hidden to items that break main content flow, in order to aid comprehension via screen readers', () => {
	it('should add `aria-hidden="true"` to pull quotes', () => {
		const $ = cheerio.load(
			'<blockquote class="n-content-pullquote"><div class="n-content-pullquote__content"><p>New Place is an intriguing sight, but without any provable connection to Shakespeare’s own garden</p></div></blockquote>',
			{ decodeEntities: false }
		);
		const transformed$ = ariaHiddenTransform($);

		transformed$.html().should.equal(
			'<blockquote class="n-content-pullquote" aria-hidden="true"><div class="n-content-pullquote__content"><p>New Place is an intriguing sight, but without any provable connection to Shakespeare’s own garden</p></div></blockquote>'
		);
	});

	it('should add `aria-hidden="true"` to related-content boxes', () => {
		const $ = cheerio.load(
			'<aside class="n-content-related-box p402_hide" role="complementary" data-trackable="related-box"><div class="n-content-related-box__headline">More</div><div class="n-content-related-box__content"><p><a href="http://rankings.ft.com/businessschoolrankings/european-business-school-rankings-2016" data-trackable="link">Interactive table</a><br>View our ranking of the top European business schools</p><p><a href="/content/46a27db8-afe4-11e6-9c37-5787335499a0" data-trackable="link">Methodology and key</a><br>Ranking measures the quality and breadth of programmes</p><p><a href="/content/5477e424-afde-11e6-9c37-5787335499a0" data-trackable="link">Meet the dean</a><br>Bocconi University’s Gianmario Verona</p></div></aside>',
			{ decodeEntities: false }
		);
		const transformed$ = ariaHiddenTransform($);

		transformed$.html().should.equal(
			'<aside class="n-content-related-box p402_hide" role="complementary" data-trackable="related-box" aria-hidden="true"><div class="n-content-related-box__headline">More</div><div class="n-content-related-box__content"><p><a href="http://rankings.ft.com/businessschoolrankings/european-business-school-rankings-2016" data-trackable="link">Interactive table</a><br>View our ranking of the top European business schools</p><p><a href="/content/46a27db8-afe4-11e6-9c37-5787335499a0" data-trackable="link">Methodology and key</a><br>Ranking measures the quality and breadth of programmes</p><p><a href="/content/5477e424-afde-11e6-9c37-5787335499a0" data-trackable="link">Meet the dean</a><br>Bocconi University’s Gianmario Verona</p></div></aside>'
		);
	});

	it('should add `aria-hidden="true"` to teaserified related-content boxes', () => {
		const $ = cheerio.load('<aside class="n-content-related-box n-content-related-box--no-border p402_hide" role="complementary" data-trackable="related-box"><div class="standalone-teaser-heading">Read more</div><div class="o-teaser o-teaser--large" data-o-component="o-teaser" data-trackable="teaser"><div class="o-teaser__content"><div class="o-teaser__meta"></div><h3 class="o-teaser__heading"><a href="/content/3ba3ebe8-afdc-11e6-9c37-5787335499a0" data-trackable="main-link">MBA graduate makes a material difference in sustainable fashion</a></h3><p class="o-teaser__standfirst">St Gallen programme gave Megan McGill the skills to tailor a new career</p><div class="o-teaser__timestamp"><time data-o-component="o-date" class="o-date" data-o-date-format="time-ago-limit-4-hours" datetime="" title="January 16, 2017 11:18 am" data-o-date-js="" aria-label=""></time></div></div></div></aside>',
			{ decodeEntities: false }
		);
		const transformed$ = ariaHiddenTransform($);

		transformed$.html().should.equal('<aside class="n-content-related-box n-content-related-box--no-border p402_hide" role="complementary" data-trackable="related-box" aria-hidden="true"><div class="standalone-teaser-heading">Read more</div><div class="o-teaser o-teaser--large" data-o-component="o-teaser" data-trackable="teaser"><div class="o-teaser__content"><div class="o-teaser__meta"></div><h3 class="o-teaser__heading"><a href="/content/3ba3ebe8-afdc-11e6-9c37-5787335499a0" data-trackable="main-link">MBA graduate makes a material difference in sustainable fashion</a></h3><p class="o-teaser__standfirst">St Gallen programme gave Megan McGill the skills to tailor a new career</p><div class="o-teaser__timestamp"><time data-o-component="o-date" class="o-date" data-o-date-format="time-ago-limit-4-hours" datetime="" title="January 16, 2017 11:18 am" data-o-date-js="" aria-label=""></time></div></div></div></aside>'
		);
	});
});
