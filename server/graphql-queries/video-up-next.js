const nTeaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = `
	${nTeaserFragments.teaserExtraLight}
	${nTeaserFragments.teaserLight}
	${nTeaserFragments.teaserStandard}
	${nTeaserFragments.teaserHeavy}

	query tagLatest (
		$tagId: String!
	) {
		tag(id: $tagId) {
			latestContent(limit: 20, type: Video) {
				...TeaserExtraLight
				...TeaserLight
				...TeaserStandard
				...TeaserHeavy
			}
		}
	}
`;
