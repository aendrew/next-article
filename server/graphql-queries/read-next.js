const teaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = (readNext, contentPackage) => {

	let query = `

	${teaserFragments.teaserExtraLight}
	${teaserFragments.teaserHeavy}

	query ContentPackage (
		$uuid: Uuid!
		${readNext ? ',$limitPrimaryTag: Int!' : ''}
		${readNext ? ',$limitStoryPackage: Int!' : ''}
	) {
		article(uuid: $uuid) {
			id
			publishedDate
	`;

	if(readNext) {
		query += `
			primaryTag {
				latestContent(limit: $limitPrimaryTag) {
					...TeaserExtraLight
				}
			}
			storyPackage(limit: $limitStoryPackage) {
				...TeaserExtraLight
			}
		`;
	}

	if(contentPackage) {
		query += `
			containedIn(limit: 1) {
				title
				url
				...on Package {
					descriptionHTML
					primaryTag {
						idV1
						prefLabel
						taxonomy
						url
					}
					primaryBrandTag {
						idV1
						prefLabel
						taxonomy
						url
					}
					contains {
						...TeaserExtraLight
						...TeaserHeavy
					}
				}
			}

			...on Package {
				contains {
					...TeaserExtraLight
				}
			}
		`;
	}

	query += `
			}
		}
	`;

	return query;

};
