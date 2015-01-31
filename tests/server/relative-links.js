/*global it*/
"use strict";
var cheerio = require('cheerio');
var expect = require('chai').expect;
var relativeLinksTransform = require('../../server/transforms/relative-links');

it('should understand that topic pages are stream pages', function() {
	var $ = cheerio.load('<a href="http://www.ft.com/topics/themes/Greece_Debt_Crisis" title="Greece debt crisis in depth - FT.com">Greece&#x2019;s <strong>debt</strong></a>');
	$('a').replaceWith(relativeLinksTransform);
	expect($.html()).to.equal('<a href="/stream/themes/Greece Debt Crisis" title="Greece debt crisis in depth - FT.com">Greece&#x2019;s <strong>debt</strong></a>');
});

it('should understand that article pages are article pages', function() {
	var $ = cheerio.load('<a href="http://www.ft.com/cms/s/0/f3970f88-0475-11df-8603-00144feabdc0.html" title="Cadbury and Kraft agree &#xA3;11.6bn deal - FT.com">Cadbury was bought by <strong>Kraft</strong></a>');
	$('a').replaceWith(relativeLinksTransform);
	expect($.html()).to.equal('<a href="/f3970f88-0475-11df-8603-00144feabdc0" title="Cadbury and Kraft agree &#xA3;11.6bn deal - FT.com">Cadbury was bought by <strong>Kraft</strong></a>');
});

it('should understand not to remove slide hint', function() {
	var $ = cheerio.load('<a href="http://www.ft.com/cms/s/0/f3970f88-0475-11df-8603-00144feabdc0.html#slide0"></a>');
	$('a').replaceWith(relativeLinksTransform);
	expect($.html()).to.equal('<a href="/f3970f88-0475-11df-8603-00144feabdc0#slide0"></a>');
});
