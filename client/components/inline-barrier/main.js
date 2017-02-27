import populateWithPsp from './populate-with-psp';
import populateWithTrial from './populate-with-trial';
import broadcastOpportunity from './broadcast-opportunity';

export default (flags) => {
	const el = document.querySelector('.inline-barrier');
	const inArticlePreviewVariant = flags.get('inArticlePreview');

	if (!el || !inArticlePreviewVariant || !el.dataset.countryCode) { return; }

	const populateWithOffer = (inArticlePreviewVariant === 'trial') ? populateWithTrial : populateWithPsp;

	populateWithOffer(el)
		.then(() => {
			// Tracking for MVT analysis
			broadcastOpportunity(`inline-${inArticlePreviewVariant}`);
		})
		.catch((err) => {
			// eslint-disable-next-line no-console
			console.error('Failed to retrieve/process offer data', err);
		})
		.then(() => {
			// Show either the core or enhanced barrier, depending on success of fetching offer data
			el.classList.add('inline-barrier--done');
		});
}
