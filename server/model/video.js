const openGraphHelper = require('../controllers/article-helpers/open-graph');
const durationTransform = require('../transforms/video-duration');
const decorateContent = require('./content');

module.exports = function decoratePodcast (req, res, payload, flags) {
	return decorateContent(req, res, payload, flags).then(content => {

		// TODO: move this to template or re-name subheading
		content.standfirst = content.subheading || '';

		content.video = {
			id: content.webUrl.replace('http://video.ft.com/', '')
		};

		const mp4s = content.attachments.filter(attachment => attachment.mediaType === 'video/mp4' && 'codec' in attachment);

		if (mp4s.length) {
			content.videoData = {
				videoStillURL: content.mainImage && content.mainImage.url,
				renditions: mp4s.map(rendition => ({
					url: rendition.url,
					videoCodec: rendition.codec,
					frameWidth: rendition.width
				}))
			};
		}

		if (flags.closedCaptions) {
			content.captions = content.attachments.filter(attachment => attachment.mediaType === 'text/vtt').reduce((a, b) => b, undefined);
		}

		if (flags.openGraph) {
			openGraphHelper(content);
		}

		content.formattedDuration = durationTransform(content.attachments && content.attachments[0] && content.attachments[0].duration);

		content.dehydratedMetadata.upNextTag = content.primaryTag && content.primaryTag.idV1;
		content.autoplay = !flags.videoArticlePage;
		content.contentType = 'video';
		content.template = 'content-video';

		// TODO: dont do this here
		if (req.query.fragment) {
			res.unvaryAll('wrapper');
		}

		return content;

	});
};
