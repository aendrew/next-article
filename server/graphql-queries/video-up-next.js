module.exports = `
	fragment videoContent on Content {
		id
		title
		lastPublished
		relativeUrl
		mainImage {
			url: rawSrc
			width
			height
			ratio
		}
		... on Video {
			duration
		}
	}

	query tagLatest (
		$tagId: String!
	) {
		tag(id: $tagId) {
			latestContent(limit: 20, type: Video) {
				...videoContent
			}
		}
	}
`;