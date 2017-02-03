const oViewport = require('n-ui/viewport');
const OVideo = require('o-video');
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
	const ftlabsSpokenLayer = require('./components/ftlabsSpokenLayer/main');
	const legalCopy = require('./components/legal-copy/main');
	const AutoplayVideo = require('./components/video/autoplay-video');
	const affinity = require('./components/affinity/main');

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
		share.init();
	}

	if (flags.get('tearsheetHovers')) {
		tearsheets.init();
	}

	toc.init(flags);

	if(flags.get('articleScrollDepthTracking')) {
		tracking.scrollDepth.init('next-article', { selector: '.article__body' });
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
			if (videoEl.hasAttribute('data-video-autoplay')) {
				const video = new AutoplayVideo(videoEl, {
					advertising: flags.get('videoPlayerAdvertising'),
					upNextVariant: flags.get('videoUpNext')
				});
				video.init();
			} else {
				new OVideo(videoEl, {
					placeholder: true,
					classes: ['video'],
					advertising: flags.get('videoPlayerAdvertising'),
					placeholderInfo: ['brand', 'title'],
				});
			}
		});

		if (flags.get('articleComments') && document.querySelector('#comments')) {
			commentsInit();
		}

		if (flags.get('ftlabsSpokenLayer')){
			ftlabsSpokenLayer(flags);
		}

		if (flags.get('affinityMvt')) {
			affinity(flags);
		}

	});

});
