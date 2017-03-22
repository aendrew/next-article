const teaserFragments = require('@financial-times/n-teaser').fragments;

module.exports = (readNext, contentPackage) => {

	let query = `

	${teaserFragments.teaserExtraLight}
	${teaserFragments.teaserStandard}
	${contentPackage ? teaserFragments.teaserHeavy : ''}

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
					metadata {
						idV1
						prefLabel
						taxonomy
						url
						relativeUrl
					}
					design {
						theme
					}
					tableOfContents {
						sequence
						labelType
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
					...TeaserStandard
					...TeaserHeavy
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
