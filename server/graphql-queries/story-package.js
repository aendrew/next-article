module.exports = `
	query StoryPackage (
		$uuid: Uuid!
		$limit: Int!
	) {
		article(uuid: $uuid) {
			storyPackage(limit: $limit) {
				type: __typename
				id
				url
				webUrl
				title
				published
				lastPublished
				summary
				primaryTheme {
					id
					url
					name
					taxonomy
				}
				primarySection {
					id
					url
					name
					taxonomy
				}
				branding {
					id
					url
					name
					taxonomy
				}
				primaryImage {
					rawSrc
				}
			}
		}
	}
`
