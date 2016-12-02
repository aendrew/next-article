const teaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = `

	${teaserFragments.teaserExtraLight}

	query StoryPackage (
		$uuid: Uuid!
		$limitPrimaryTag: Int!
		$limitStoryPackage: Int!
	) {
		article(uuid: $uuid) {
			primaryTag {
				latestContent(limit: $limitPrimaryTag) {
					...TeaserExtraLight
				}
			}
			storyPackage(limit: $limitStoryPackage) {
				...TeaserExtraLight
			}
		}
	}
`;
