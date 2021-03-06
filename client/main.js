const oViewport = require('o-viewport');
const lightSignup = require('o-email-only-signup');
const expander = require('o-expander');
const tracking = require('n-ui/components/n-ui/tracking');
const tipDismisser = require('n-ui/components/n-ui/tour-tip/lib/dismiss.js');

import {bootstrap} from 'n-ui';
import {init as commentsInit} from './components/comments';
import * as myftUi from 'n-myft-ui/myft';

bootstrap({ preset: 'complete' }, ({flags, allStylesLoaded}) => {

	const slideshow = require('./components/slideshow/main');
	const onwardJourney = require('./components/onward-journey/main');
	const share = require('./components/share/main');
	const promotedContent = require('./components/ads/promoted-content');
	const ftlabsAudioPlayer = require('./components/ftlabs-audio-player/main');
	const legalCopy = require('./components/legal-copy/main');
	const Video = require('./components/video/video');

	const clientOpts = [];

	if (flags.get('follow')) {
		clientOpts.push({relationship: 'followed', type: 'concept'});
	}

	if (flags.get('saveForLater')) {
		clientOpts.push({relationship: 'saved', type: 'content'});
	}
	myftUi.client.init(clientOpts);

	oViewport.listenTo('resize');

	if (document.querySelector('*[data-article-status="error"]')) {
		return;
	}

	if (flags.get('articleShareButtons')) {
		share.init(flags);
	}

	if (flags.get('articleScrollDepthTracking')) {
		if (document.querySelector('.content__video')) {
			tracking.scrollDepth.init('video-page', { selector: '.content__video' });
		} else {
			tracking.scrollDepth.init('next-article', { selector: '.article__body' });
		}
	}

	legalCopy(flags);

	allStylesLoaded.then(() => {
		slideshow(document.querySelectorAll('.article ft-slideshow'));
		onwardJourney.init(flags);
		lightSignup.init();
		expander.init();
		promotedContent(flags);

		tipDismisser(flags, {
			tipContainer: '.tour-tip--article-page',
			appendDismisserTo: '.tour-tip--article-page',
			localStorageKey: 'tour-tip-article-dismissed'
		});

		myftUi.ui.init({
			anonymous: !(/FTSession=/.test(document.cookie)),
			flags
		});

		[...document.querySelectorAll('[data-o-component="o-video"]')].forEach(videoEl => {
			const video = new Video(videoEl, {
				advertising: flags.get('videoPlayerAdvertising'),
				upNextVariant: flags.get('videoArticlePage') ? 'no-autoplay' : flags.get('videoUpNext')
			});

			// only initialise autoplay and playlists if we're on a video page
			if (document.querySelector('.content__video')) {
				video.init({ autoplay: videoEl.hasAttribute('data-video-autoplay') });
			}
		});

		if (flags.get('articleComments') && document.querySelector('#comments')) {
			commentsInit();
		}

		if (flags.get('ftlabsAudioPlayer')){
			ftlabsAudioPlayer(flags);
		}
	});

});
