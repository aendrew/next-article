'use strict';

var oViewport = require('o-viewport');
var oDate = require('o-date');
var myFtClient = require('next-myft-client');

var setup = require('next-js-setup');
var headerFooter = require('n-header-footer');
var nVideo = require('n-video');

var slideshow = require('./components/slideshow/main');
var moreOn = require('./components/more-on/main');
var toc = require('./components/toc/main');
var comments = require('./components/comments/main');
var readingList = require('./components/reading-list/main');

oViewport.listenTo('resize');

setup.bootstrap(function(result) {
	var flags = result.flags;
	headerFooter.init(flags);

	if (document.querySelector('*[data-article-status="error"]')) {
		return;
	}

	var uuid = document.querySelector('article[data-content-id]').getAttribute('data-content-id');
	if (uuid) {
		if (flags.get('userPreferencesAPI')) {
			document.addEventListener('myft.followed.load', function(ev) {
				if(ev.detail && ev.detail.Count > 0) {
					myFtClient.notifications.clear([uuid], true); //force articles to mark as read
				}
			});

			readingList.init();
		}
	}

	slideshow(document.querySelectorAll('.article ft-slideshow'));

	if (flags.get('contentApiCalls')) {
		moreOn.init(flags);
	}



	nVideo.init({
		optimumWidth: 710,
		classes: ['article__video', 'ng-media']
	});
	toc.init(flags);
	comments.init(uuid, flags);
	oDate.init(document.querySelector('.article'));
});
