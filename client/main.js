const oViewport = require('n-ui/viewport');
const OVideo = require('o-video');
const lightSignup = require('o-email-only-signup');
const expander = require('n-ui/expander');
const nUiConfig = require('./n-ui-config');
const tipDismisser = require('n-ui/tour-tip/lib/dismiss.js');
import {bootstrap} from 'n-ui';
// import cacheJourney from './components/cache-journey/cache-journey';
import {init as commentsInit} from './components/comments';

bootstrap(nUiConfig, ({flags, mainCss}) => {

	const slideshow = require('./components/slideshow/main');
	const readingHistory = require('./components/reading-history');
	const scrollDepth = require('./components/article/scroll-depth');
	const tearsheets = require('./components/tearsheets');
	const onwardJourney = require('./components/onward-journey/main');
	const toc = require('./components/toc/main');
	const share = require('./components/share/main');
	const promotedContent = require('./components/ads/promoted-content');
	const ftlabsSpokenLayer = require('./components/ftlabsSpokenLayer/main');
	const legalCopy = require('./components/legal-copy/main');
	const videoAutoplay = require('./components/video/autoplay');
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
	scrollDepth(flags);
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

		const enableAutoplay = document.querySelector('.content__video');
		if (enableAutoplay) {
			videoAutoplay.init();
		}

		const videos = document.querySelectorAll('[data-o-component="o-video"]');
		Array.from(videos).forEach(video => {
			let oVideo = new OVideo(video, {
				id: video.getAttribute('data-o-video-id'),
				placeholder: true,
				classes: ['video'],
				advertising: flags.get('videoPlayerAdvertising'),
				source: 'brightcove',
				placeholderdisplay: 'brand,title',
				autorender: !enableAutoplay,
			});
			if (enableAutoplay) {
				videoAutoplay(oVideo);
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
