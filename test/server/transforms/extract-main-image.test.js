require('chai').should();
const expect = require('chai').expect;
const mainImage = require('../../../server/transforms/extract-main-image');

describe('Extracting Main Image and Table of Contents from Body', () => {

	it('should extract a full image that is the first element in the body',() => {
		const bodyHTML = (
			'<body>' +
				'<figure class="n-content-image n-content-image--full" style="width:700px;">' +
					'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		resultObject.mainImageHTML.should.equal(
			'<figure class="n-content-image n-content-image--full" style="width:700px;" alt="" role="presentation">' +
				'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
					'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
				'</div>' +
			'</figure>'
		);
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<p>test test test</p>' +
			'</body>'
		);
	});

	it('should extract a center image that is the first element in the body',() => {
		const bodyHTML = (
			'<body>' +
				'<figure class="n-content-image n-content-image--center" style="width:600px;" alt="" role="presentation">' +
					'<div class="n-content-image__placeholder" style="padding-top:43%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2Faee47340-9307-11e5-bd82-c1fb87bef7af?source=next&amp;fit=scale-down&amp;width=600">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		resultObject.mainImageHTML.should.equal(
			'<figure class="n-content-image n-content-image--center" style="width:600px;" alt="" role="presentation">' +
				'<div class="n-content-image__placeholder" style="padding-top:43%;">' +
					'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2Faee47340-9307-11e5-bd82-c1fb87bef7af?source=next&amp;fit=scale-down&amp;width=600">' +
				'</div>' +
			'</figure>'
		);
	});

	it('should extract a slideshow that is the first element in the body', () => {
		const bodyHTML = (
			'<body>' +
				'<ft-slideshow data-uuid="9f3a2d5e-7dd1-11e5-98fb-5a6d4728f74e"></ft-slideshow>' +
				'<p>test test test</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		resultObject.mainImageHTML.should.equal(
			'<ft-slideshow data-uuid="9f3a2d5e-7dd1-11e5-98fb-5a6d4728f74e" alt="" role="presentation"></ft-slideshow>'
		);

	});

	it('should not extract an inline image that is the first element in the body', () => {
		const bodyHTML = (
			'<body>' +
				'<figure class="n-content-image n-content-image--inline" style="width:700px;">' +
					'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		expect(resultObject.mainImageHTML).to.be.undefined;
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<figure class="n-content-image n-content-image--inline" style="width:700px;">' +
					'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
	});

	it('should not extract a thin image that is the first element in the body', () => {
		const bodyHTML = (
			'<body>' +
				'<figure class="n-content-image n-content-image--thin" style="width:100px;">' +
					'<div class="n-content-image__placeholder" style="padding-top:120%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F8d8589a4-94d9-11e5-bd82-c1fb87bef7af?source=next&amp;fit=scale-down&amp;width=100">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		expect(resultObject.mainImageHTML).to.be.undefined;
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<figure class="n-content-image n-content-image--thin" style="width:100px;">' +
					'<div class="n-content-image__placeholder" style="padding-top:120%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F8d8589a4-94d9-11e5-bd82-c1fb87bef7af?source=next&amp;fit=scale-down&amp;width=100">' +
					'</div>' +
				'</figure>' +
				'<p>test test test</p>' +
			'</body>'
		);
	});

	it('should not extract an appropriate image that is not the first element in the body', () => {
		const bodyHTML = (
			'<body>' +
				'<p>test test test</p>' +
				'<figure class="n-content-image n-content-image--full" style="width:700px;" alt="" role="presentation">' +
					'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
					'</div>' +
				'</figure>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		expect(resultObject.mainImageHTML).to.be.undefined;
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<p>test test test</p>' +
				'<figure class="n-content-image n-content-image--full" style="width:700px;" alt="" role="presentation">' +
					'<div class="n-content-image__placeholder" style="padding-top:56.25%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fcom.ft.imagepublish.prod.s3.amazonaws.com%2F4dd6d624-98cf-11e5-9228-87e603d47bdc?source=next&amp;fit=scale-down&amp;width=700">' +
					'</div>' +
				'</figure>' +
			'</body>'
		);
	});

	it('should not extract the image from the first child position of an element with previous siblings', () => {
		const bodyHTML = (
			'<body>' +
				'<p>The co-founding Zoman, Deepinder Goyal, that is took time for a chat with us last week about the change going on in Indias start-up world.</p>' +
				'<blockquote class="article__quote article__quote--full-quote aside--content c-box u-border--left u-padding--left-right">' +
					'<figure class="article-image article-image--center" style="width:354px;"><div class="article-image__placeholder" style="padding-top:75.9887005649718%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fftalphaville.ft.com%2Ffiles%2F2016%2F02%2FScreen-Shot-2016-02-08-at-16.08.47-590x448.png?source=next&amp;fit=scale-down&amp;width=354">' +
						'</div>' +
					'</figure>' +
				'</blockquote>' +
				'<p>Or you could skip straight to stuff like this from Goyals mouth with our emphasis:</p>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<p>The co-founding Zoman, Deepinder Goyal, that is took time for a chat with us last week about the change going on in Indias start-up world.</p>' +
				'<blockquote class="article__quote article__quote--full-quote aside--content c-box u-border--left u-padding--left-right">' +
					'<figure class="article-image article-image--center" style="width:354px;"><div class="article-image__placeholder" style="padding-top:75.9887005649718%;">' +
						'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fftalphaville.ft.com%2Ffiles%2F2016%2F02%2FScreen-Shot-2016-02-08-at-16.08.47-590x448.png?source=next&amp;fit=scale-down&amp;width=354">' +
						'</div>' +
					'</figure>' +
				'</blockquote>' +
				'<p>Or you could skip straight to stuff like this from Goyals mouth with our emphasis:</p>' +
			'</body>'
		);
	});

	it('should not extract the image if the image is the only thing in the body', () => {
		const bodyHTML = (
			'<body>' +
				'<figure class="article-image article-image--center" style="width:354px;"><div class="article-image__placeholder" style="padding-top:75.9887005649718%;">' +
					'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fftalphaville.ft.com%2Ffiles%2F2016%2F02%2FScreen-Shot-2016-02-08-at-16.08.47-590x448.png?source=next&amp;fit=scale-down&amp;width=354">' +
					'</div>' +
				'</figure>' +
			'</body>'
		);
		const resultObject = mainImage(bodyHTML);
		resultObject.bodyHTML.should.equal(
			'<body>' +
				'<figure class="article-image article-image--center" style="width:354px;"><div class="article-image__placeholder" style="padding-top:75.9887005649718%;">' +
					'<img alt="" src="https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fftalphaville.ft.com%2Ffiles%2F2016%2F02%2FScreen-Shot-2016-02-08-at-16.08.47-590x448.png?source=next&amp;fit=scale-down&amp;width=354">' +
					'</div>' +
				'</figure>' +
			'</body>'
		);
	});


});
