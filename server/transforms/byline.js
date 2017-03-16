module.exports = (byline, authors) => {
	if (byline && Array.isArray(authors)) {
		authors.forEach(author => {
			byline = byline.replace(
				new RegExp('\\b(' + author.prefLabel + ')\\b'),
				'<a class="n-content-tag" href="' + author.relativeUrl + '" data-trackable="author">$1</a>'
			);
		});
	}

	return byline;
};
