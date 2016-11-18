module.exports = `
	query RelatedContent (
		$tagId: String!,
		$limit: Int!
	) {
		search(termName: "metadata.idV1", termValue: $tagId, limit: $limit) {
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
`;
