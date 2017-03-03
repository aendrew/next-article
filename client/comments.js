import OComments from 'o-comments';

const uuid = document.querySelector('article[data-content-id]').getAttribute('data-content-id');

OComments.on('widget.renderComplete', function () {
	const skeleton = document.querySelector('[data-skeleton=comments]');
	skeleton.parentNode.removeChild(skeleton);
});

new OComments(document.querySelector('#comments'), {
	title: document.title,
	url: `https://ft.com/content/${uuid}`,
	articleId: uuid, // NOTE: to test, use '3a499586-b2e0-11e4-a058-00144feab7de'
	livefyre: {
		initialNumVisible: 10,
		disableIE8Shim: true,
		disableThirdPartyAnalytics: true
	}
});
