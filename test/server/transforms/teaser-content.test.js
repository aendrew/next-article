const cheerio = require('cheerio');
const expect = require('chai').expect;
const teaserContentTransform = require('../../../server/transforms/teaser-content');

// True example in order to ensure encoding etc is not lost
const mockContent = '<p><a href="https://www.ft.com/theresa-may" data-trackable="link">Theresa May</a> will reveal her blueprint for Britain&#x2019;s industrial strategy next week, pitching how she will, in her own words, &#x201C;get the whole economy firing&#x201D;. </p><div class="p402_hide" data-o-email-only-signup-position-mvt="" aria-hidden="true"></div><p>One of her early moves as prime minister was to rebrand the business ministry as the Department for Business, Energy and Industrial Strategy. She picked <a href="/content/40665648-c6e3-11e6-8f29-9445cac8966f" data-trackable="link">Greg Clark</a>, a sceptic of free markets, as her business secretary. </p><p>But Monday marks the moment when Mrs May will have to start explaining what her vision means in practice &#x2014; and how it might differ from that of her predecessors. </p><div class="o-ads in-article-advert advert" data-o-ads-name="mpu" data-o-ads-center="true" data-o-ads-label="true" data-o-ads-targeting="pos=mid;" data-o-ads-formats-default="MediumRectangle,Responsive" data-o-ads-formats-small="MediumRectangle,Responsive" data-o-ads-formats-medium="MediumRectangle,Responsive" data-o-ads-formats-large="Responsive" data-o-ads-formats-extra="Responsive" data-o-ads-collapse-empty="true" aria-hidden="true"></div><p>The discussion document will feature various &#x201C;pillars&#x201D; on issues such as training, research and development, &#x201C;<a href="http://blog.hefce.ac.uk/2016/09/27/industrial-strategy-what-challenges-for-place/" data-trackable="link" target="_blank">place</a>&#x201D;, and infrastructure. It will be pitched as an attempt to support not only business but also consumers and workers. </p><p>Previous governments have had passing flirtations with the idea of steering British industry. For example, Baron Brabazon of Tara, an <a href="https://www.thisdayinaviation.com/tag/john-theodore-cuthbert-moore-brabazon-1st-baron-brabazon-of-tara/" data-trackable="link" target="_blank">aviation pioneer</a> who learnt to fly in 1908, was put in charge of developing Britain&#x2019;s civilian aviation industry during the second world war. </p><figure class="n-content-image n-content-image--center p402_hide" style="width: 600px; max-width: 100%;"><div class="n-image-wrapper n-image-wrapper--placeholder" style="padding-bottom: 69.33%;"><img alt="" class="n-image" role="presentation" srcset="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F016f2ad8-de70-11e6-86ac-f253db7791c6?source=next&amp;fit=scale-down&amp;width=600 600w, https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F016f2ad8-de70-11e6-86ac-f253db7791c6?source=next&amp;fit=scale-down&amp;width=315 315w" sizes="(min-width: 46.25em) 600px, calc(100vw - 20px)"></div><figcaption class="n-content-image__caption">John Moore-Brabazon in his Wright aeroplane at the Aero Club&apos;s ground at Eastchurch in 1910 &#xA9; Topical Press/Getty Images</figcaption></figure><p>His committee charged two state-owned airlines to build four aircraft prototypes, with its first model, the Bristol Brabazon Mark I &#x2014; a huge luxury transatlantic airliner &#x2014; receiving zero orders and becoming obsolete before its maiden flight. </p><p>But the project was not entirely in vain: it delivered years of work to Bristol Aerospace Company, allowing it to build its technical expertise at Filton &#x2014; which is still a key centre for the aerospace industry. </p><p>Critics of state intervention in industry often cite the nationalisation of the bankrupt British Leyland in 1975. That was the year that left-winger Tony Benn, then the industry secretary, published a pamphlet called &#x201C;A Ten-Year Industrial Strategy for Britain&#x201D;. </p><p>The ethos was turned on its head by the arrival in Downing Street of Margaret Thatcher, who was more focused on privatising state-owned industries than forcing the state on private industry. </p><figure class="n-content-image n-content-image--center p402_hide" style="width: 600px; max-width: 100%;"><div class="n-image-wrapper n-image-wrapper--placeholder" style="padding-bottom: 67.83%;"><img alt="" class="n-image" role="presentation" srcset="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F0069bdd8-de70-11e6-86ac-f253db7791c6?source=next&amp;fit=scale-down&amp;width=600 600w, https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F0069bdd8-de70-11e6-86ac-f253db7791c6?source=next&amp;fit=scale-down&amp;width=315 315w" sizes="(min-width: 46.25em) 600px, calc(100vw - 20px)"></div><figcaption class="n-content-image__caption">Too big to fail: the Thatcher government spent &#xA3;2.9bn on British Leyland between 1979 and 1988 &#xA9; PA Images</figcaption></figure><p>Her distaste for propping up lame duck industries was only sharpened by having to spend &#xA3;2.9bn on the &#x201C;too big to fail&#x201D; British Leyland between 1979 and 1988. Not that she abandoned intervention altogether: her government provided subsidies that led to the formation of Airbus in the UK. </p><p>For Tony Blair&#x2019;s government, meanwhile, the idea of industrial intervention smacked of the old school socialism that he was desperate to shed. It was not until the dusk of New Labour that Lord Mandelson, industry secretary, sought to revive industrial intervention on a strategic basis. </p><p>His successor <a href="/content/5a89f04a-9099-11e2-a456-00144feabdc0" data-trackable="link">Vince Cable</a> sought to build on that work after the coalition was formed in 2010: his schemes included projects to help the car industry, the development of new engines and the rolling out of &#x201C;Catapault&#x201D; early stage research centres. </p><figure class="n-content-image n-content-image--center p402_hide" style="width: 600px; max-width: 100%;"><div class="n-image-wrapper n-image-wrapper--placeholder" style="padding-bottom: 93.67%;"><img alt="" class="n-image" role="presentation" srcset="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2Ff8cba59c-de6e-11e6-9d7c-be108f1c1dce?source=next&amp;fit=scale-down&amp;width=600 600w, https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2Ff8cba59c-de6e-11e6-9d7c-be108f1c1dce?source=next&amp;fit=scale-down&amp;width=315 315w" sizes="(min-width: 46.25em) 600px, calc(100vw - 20px)"></div><figcaption class="n-content-image__caption">Lord Mandelson, then Labour&apos;s industry secretary, sought to revive industrial intervention on a strategic basis &#xA9; Reuters</figcaption></figure><p>Mr Cable had some backing from George Osborne, former chancellor, who was himself keen on certain interventions such as enterprise zones, the Northern Powerhouse and city devolution. </p><p>&#x201C;I welcome the fact that May is continuing the work that we were trying to do, she was a quiet supporter at the time,&#x201D; Mr Cable said on Thursday. &#x201C;My only problem is that there are a lot of reinventions of the wheel going on&#x2009;.&#x2009;.&#x2009;.&#x2009;it is slightly irritating.&#x201D;</p><p>Sajid Javid, who became business secretary in May 2015, tried to adopt a different tack, preferring to use the phrase &#x201C;<a href="/content/eda7ebb6-1f44-11e5-aa5a-398b2169cf79" data-trackable="link">industrial approach</a>&#x201D; to &#x201C;industrial strategy&#x201D;. Ironically, he ended up a champion of intervention as he sought to rescue Tata Steel UK from a collapse that would have cost more than 10,000 jobs. </p><p>One ally of Mr Osborne said that industrial strategy had been a &#x201C;long, slow burn&#x201D; with few dramatic changes. &#x201C;Sajid was the exception, for him it was about positioning himself as a neo-Thatcherite, there was quite a lot of continuity between Mandelson, the coalition and now.&#x201D;</p>';

describe('Teaser content', function () {

	it('should not cut content if the inArticleTeaser flag is false', function () {
		const result = teaserContentTransform(mockContent, {inArticleTeaser: false});
		expect(result.bodyHTML).to.equal(mockContent);
	});

	it('should cut short from content paragraph count in half', function () {
		const result = teaserContentTransform('<p>1</p><p>2</p><p>3</p><p>4</p>', {inArticleTeaser: true});
		expect(result.bodyHTML).to.equal('<p>1</p><p>2</p>');
	});

	it('should cut short from content paragraph count in half and round down', function () {
		const result = teaserContentTransform('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>', {inArticleTeaser: true});
		expect(result.bodyHTML).to.equal('<p>1</p><p>2</p>');
	});

	it('should cut long from content to a maximum of 4 paragraphs', function () {
		const result = teaserContentTransform('<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p><p>10</p>', {inArticleTeaser: true});
		expect(result.bodyHTML).to.equal('<p>1</p><p>2</p><p>3</p><p>4</p>');
	});

	it('should keep o-ads content', function () {
		const result = teaserContentTransform(mockContent, {inArticleTeaser: true});
		expect(result.bodyHTML).to.equal('<p><a href="https://www.ft.com/theresa-may" data-trackable="link">Theresa May</a> will reveal her blueprint for Britain&#x2019;s industrial strategy next week, pitching how she will, in her own words, &#x201C;get the whole economy firing&#x201D;. </p><div class="p402_hide" data-o-email-only-signup-position-mvt="" aria-hidden="true"></div><p>One of her early moves as prime minister was to rebrand the business ministry as the Department for Business, Energy and Industrial Strategy. She picked <a href="/content/40665648-c6e3-11e6-8f29-9445cac8966f" data-trackable="link">Greg Clark</a>, a sceptic of free markets, as her business secretary. </p><p>But Monday marks the moment when Mrs May will have to start explaining what her vision means in practice &#x2014; and how it might differ from that of her predecessors. </p><div class="o-ads in-article-advert advert" data-o-ads-name="mpu" data-o-ads-center="true" data-o-ads-label="true" data-o-ads-targeting="pos=mid;" data-o-ads-formats-default="MediumRectangle,Responsive" data-o-ads-formats-small="MediumRectangle,Responsive" data-o-ads-formats-medium="MediumRectangle,Responsive" data-o-ads-formats-large="Responsive" data-o-ads-formats-extra="Responsive" data-o-ads-collapse-empty="true" aria-hidden="true"></div><p>The discussion document will feature various &#x201C;pillars&#x201D; on issues such as training, research and development, &#x201C;<a href="http://blog.hefce.ac.uk/2016/09/27/industrial-strategy-what-challenges-for-place/" data-trackable="link" target="_blank">place</a>&#x201D;, and infrastructure. It will be pitched as an attempt to support not only business but also consumers and workers. </p>');
	});

});
