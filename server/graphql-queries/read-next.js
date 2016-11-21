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
				id
				url
				name
				taxonomy
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
