const teaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = `

	${teaserFragments.teaserExtraLight}
	${teaserFragments.teaserLight}
	${teaserFragments.teaserStandard}
	${teaserFragments.teaserHeavy}

	query StoryPackage (
		$uuid: Uuid!
		$limit: Int!
	) {
		article(uuid: $uuid) {
			storyPackage(limit: $limit) {
				...TeaserExtraLight
				...TeaserLight
				...TeaserStandard
				...TeaserHeavy
			}
		}
	}
`
