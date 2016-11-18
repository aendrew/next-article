const addTagTitlePrefix = require('./tag-title-prefix');

const addRelativeUrl = (article) => {
	article.metadata.map(tag => {
		tag.relativeUrl = tag.url.replace(/https:\/\/www.ft.com/, '');
	});
};

const selectPrimaries = (article) => {
	const primaryTypes = ['theme', 'section', 'brand'];
	primaryTypes.map((primary) => {
		const primaryName = `primary${primary.charAt(0).toUpperCase() + primary.slice(1)}Tag`;
		article[primaryName] = article.metadata.find(tag => tag.primary === primary);
	});
};

const selectPrimaryTag = (article) => {
	article.primaryTag = article.metadata.find(tag => tag.primaryTag);
}

const isNotPrimaryTag = (article) => {
	return (tag) => (!article.primaryTag || article.primaryTag.idV1 !== tag.idV1);
}

const selectTagsMyftTagsForDisplay = (article) => {
	let myftTopics = article.myftTopics || [];

	return article.metadata
		.filter(isNotPrimaryTag(article))
		.filter(tag => myftTopics.some(id => id === tag.idV1))
		.filter(tag => tag.taxonomy !== 'authors');
}

const selectTagsForDisplay = (article) => {
	let ignore = [ 'genre', 'mediaType', 'iptc', 'icb', 'authors' ];
	let myftTopics = selectTagsMyftTagsForDisplay(article);
	let defaultTopics = article.metadata
		.filter(tag => !myftTopics.some(myftTag => myftTag.idV1 === tag.idV1))
		.filter(tag => !ignore.find(taxonomy => taxonomy === tag.taxonomy))
		.filter(isNotPrimaryTag(article));

	article.tags = myftTopics.concat(defaultTopics).slice(0,5);
}

const selectAuthorsForDisplay = (article) => {
	article.authors = article.metadata.filter(tag => tag.taxonomy === 'authors');
}

const selectTagToFollow = (article) => {
	if(!article.tagToFollow) {
		return;
	}

	article.tagToFollow = article.metadata
		.find(tag => tag.idV1 === article.tagToFollow);

	addTagTitlePrefix(article.tagToFollow);
}

module.exports = function (article) {
	addRelativeUrl(article);
	selectPrimaries(article);
	selectPrimaryTag(article);
	selectTagsForDisplay(article);
	selectTagToFollow(article);
	selectAuthorsForDisplay(article);
	return article;
};
