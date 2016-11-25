const teaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = `

	${teaserFragments.teaserExtraLight}
	${teaserFragments.teaserLight}
	${teaserFragments.teaserStandard}
	${teaserFragments.teaserHeavy}

	query RelatedContent (
		$tagId: String!,
		$limit: Int!
	) {
		search(termName: "metadata.idV1", termValue: $tagId, limit: $limit) {
			...TeaserExtraLight
			...TeaserLight
			...TeaserStandard
			...TeaserHeavy
		}
	}
`;
