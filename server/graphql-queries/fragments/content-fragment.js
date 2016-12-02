module.exports = `
	fragment ContentExtract on Content {
		type: __typename
		id
		url
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
			width
			height
		}
	}
`;
