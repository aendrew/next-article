const contentFragment = require('./fragments/content-fragment')

module.exports = `

	${contentFragment}

	query StoryPackage (
		$uuid: Uuid!
		$limitPrimaryTag: Int!
		$limitStoryPackage: Int!
	) {
		article(uuid: $uuid) {
			primaryTag {
				latestContent(limit: $limitPrimaryTag) {
					...ContentExtract
				}
			}
			storyPackage(limit: $limitStoryPackage) {
				...ContentExtract
			}
		}
	}
`;
