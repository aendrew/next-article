const oViewport = require('n-ui/viewport');
const lightSignup = require('o-email-only-signup');
const expander = require('n-ui/expander');
const tracking = require('n-ui/tracking');
const nUiConfig = require('./n-ui-config');
const tipDismisser = require('n-ui/tour-tip/lib/dismiss.js');

import {bootstrap} from 'n-ui';
// import cacheJourney from './components/cache-journey/cache-journey';
import {init as commentsInit} from './components/comments';

bootstrap(nUiConfig, ({flags, mainCss}) => {

	const slideshow = require('./components/slideshow/main');
	const readingHistory = require('./components/reading-history');
	const tearsheets = require('./components/tearsheets');
	const onwardJourney = require('./components/onward-journey/main');
	const toc = require('./components/toc/main');
	const share = require('./components/share/main');
	const promotedContent = require('./components/ads/promoted-content');
	const ftlabsAudioPlayer = require('./components/ftlabs-audio-player/main');
	const legalCopy = require('./components/legal-copy/main');
	const Video = require('./components/video/video');
	const affinity = require('./components/affinity/main');
	const inlineBarrier = require('./components/inline-barrier/main');

	// cacheJourney();

	oViewport.listenTo('resize');

	if (document.querySelector('*[data-article-status="error"]')) {
		return;
	}

	const uuid = document.querySelector('article[data-content-id]').getAttribute('data-content-id');

	if (uuid) {
		readingHistory.add(uuid);
	}

	if (flags.get('articleShareButtons')) {
		share.init(flags);
	}

	if (flags.get('tearsheetHovers')) {
		tearsheets.init();
	}

	toc.init(flags);

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
			video.init({ autoplay: videoEl.hasAttribute('data-video-autoplay') });
		});

		if (flags.get('articleComments') && document.querySelector('#comments')) {
			commentsInit();
		}

		if (flags.get('ftlabsAudioPlayer')){
			ftlabsAudioPlayer(flags);
		}

		if (flags.get('affinityMvt')) {
			affinity(flags);
		}

		if (flags.get('inArticlePreview') === 'psp') {
			inlineBarrier(flags);
		}
	});

});
