const openGraphHelper = require('../controllers/article-helpers/open-graph');
const externalPodcastLinksUtil = require('../utils/external-podcast-links');
const podcastMainImageHTML = require('../controllers/article-helpers/podcast-main-image');
const decorateContent = require('./content');

module.exports = function decoratePodcast (req, res, payload, flags) {
	return decorateContent(req, res, payload, flags).then(content => {
		// TODO: move this to template or re-name subheading
		content.standfirst = content.subheading || '';

		// Append podcast specific data
		content.externalLinks = externalPodcastLinksUtil(content.provenance[0]);
		content.media = content.attachments[0];

		if (flags.openGraph) {
			openGraphHelper(content);
		}

		if (content.mainImage) {
				content.mainImageHTML = podcastMainImageHTML(content.mainImage);
		}

		content.contentType = 'podcast';
		content.layout = 'wrapper';
		content.template = 'content';

		// TODO: dont do this here, why is it necessary?
		if (req.query.fragment) {
			res.unvaryAll('wrapper');
		}

		return content;
	});
};
