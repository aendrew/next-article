'use strict';

const nTeaserCollectionHeading = require('@financial-times/n-teaser-collection/templates/partials/heading.html');
const nTeaserList = require('../../../views/partials/teaser-collections/list-extra-light.html');
const nTeaser1And3 = require('../../../views/partials/teaser-collections/1-3.html');
const affinityClient = require('next-affinity-client');
const oDate = require('o-date');
const nImage = require('n-image');

const errorHandler = err => {
	window.setTimeout(() => {
		throw err;
	});
};

const getTitle = (headingModifiers) => {
	return {
		title: 'Recommended for you',
		headingModifiers
	};
}

const buildRhs = (articles) => {
	const affinityRhsElem = document.querySelector('#affinity-rhs');
	if (affinityRhsElem) {
		if (articles.items.length > 0) {
			const titleData = getTitle('small');
			const teaserHeading = nTeaserCollectionHeading(titleData);
			const teaserList = nTeaserList(articles);
			affinityRhsElem.innerHTML = teaserHeading + teaserList;
			oDate.init(affinityRhsElem);
		} else {
			affinityRhsElem.innerHTML = '';
		}
	}
}

const buildBottom = (articles) => {
	const titleData = getTitle('half-width');
	const teaserHeading = nTeaserCollectionHeading(titleData);
	const affinityBottomElem = document.querySelector('#affinity-bottom');
	if (affinityBottomElem) {
		if (articles.items.length > 0) {
			const teaserDisplay = nTeaser1And3(articles);
			affinityBottomElem.innerHTML = teaserHeading + teaserDisplay;
			oDate.init(affinityBottomElem);
			nImage.lazyLoad({root: affinityBottomElem});
		} else {
			affinityBottomElem.innerHTML = '';
		}
	}
}

export default (flags) => {
	const articleId = document.querySelector('[data-content-id]').getAttribute('data-content-id');
	if (flags.affinity) {
		let affinityEndpoint;
		let options;
		switch (flags.affinityMvt) {
			case 'affinity':
				affinityEndpoint = 'article';
				options = {id: articleId};
				break;
			case 'onto-contextual':
				affinityEndpoint = 'contextual';
				options = {id: articleId};
				break;
			case 'onto-behavioural':
				affinityEndpoint = 'behavioural';
				options = {id: articleId};
				break;
			case 'onto-covisit':
				affinityEndpoint = 'behavioural';
				options = {id: articleId, covisitation: true};
				break;
			default:
				break;
		}

		if (affinityEndpoint) {
			affinityClient[affinityEndpoint](options)
				.then(data => {
					buildRhs({items: data});
					buildBottom({items: data});
				})
				.catch(errorHandler);
		}
	}
}
