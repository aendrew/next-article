const oViewport = require('o-viewport');
const lightSignup = require('o-email-only-signup');
const expander = require('o-expander');
const tracking = require('n-ui/tracking');
const nUiConfig = require('./n-ui-config');
const tipDismisser = require('n-ui/tour-tip/lib/dismiss.js');

import {bootstrap} from 'n-ui';
// import cacheJourney from './components/cache-journey/cache-journey';
import {init as commentsInit} from './components/comments';

bootstrap(nUiConfig, ({flags, mainCss}) => {

	const slideshow = require('./components/slideshow/main');
	const onwardJourney = require('./components/onward-journey/main');
	const share = require('./components/share/main');
	const promotedContent = require('./components/ads/promoted-content');
	const ftlabsAudioPlayer = require('./components/ftlabs-audio-player/main');
	const legalCopy = require('./components/legal-copy/main');
	const Video = require('./components/video/video');
	const inlineBarrier = require('./components/inline-barrier/main');

	// cacheJourney();

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

	mainCss.then(() => {
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

		if (flags.get('inArticlePreview')) {
			inlineBarrier(flags);
		}
	});

});
