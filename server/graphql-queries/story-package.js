const contentFragment = require('./fragments/content-fragment')

module.exports = `

	${contentFragment}

	query StoryPackage (
		$uuid: Uuid!
		$limit: Int!
	) {
		article(uuid: $uuid) {
			storyPackage(limit: $limit) {
				...ContentExtract
			}
		}
	}
`
