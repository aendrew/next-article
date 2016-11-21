const contentFragment = require('./fragments/content-fragment')

module.exports = `

	${contentFragment}

	query RelatedContent (
		$tagId: String!,
		$limit: Int!
	) {
		search(termName: "metadata.idV1", termValue: $tagId, limit: $limit) {
			... ContentExtract
		}
	}
`;
