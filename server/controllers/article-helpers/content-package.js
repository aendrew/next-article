
const trim = (content) => {
	let trimmedTitle;
	if (content.title.indexOf(':')) {
		trimmedTitle = content.title
			.substring(content.title.indexOf(':') + 2);
	}

	return Object.assign({}, content, {
		url: content.relativeUrl,
		title: trimmedTitle ? trimmedTitle : content.title
	});
};

const moveToTopOfPackage = (top, pkg) => {
	return [].concat(top, pkg.filter(x => x !== top));
};

module.exports = function (article) {
	const { id, containedIn, contains } = article;

	if(!(contains || containedIn.length)) {
		return;
	}
	const contentPackage = containedIn.length ? containedIn[0] : {};
	contentPackage.contains = contentPackage ? contentPackage.contains.map(trim) : contains;

	// CONTEXT INFO
	const currentIndex = contentPackage.contains.findIndex(item => item.id === id);
	const context = {};
	context.prev = contentPackage.contains[currentIndex - 1];
	context.current = contentPackage.contains[currentIndex];
	context.next = contentPackage.contains[currentIndex + 1];
	context.home = contentPackage;

	// ADD A SHORTENED PACKAGE FOR NAV IF PACKAGE OVERLONG
	const MAX_LENGTH = 6;
	if (contentPackage.contains.length > MAX_LENGTH) {
		const from = currentIndex - (MAX_LENGTH / 2);
		const to = currentIndex + (MAX_LENGTH / 2);
		if (from < 0) {
			contentPackage.shortenedPackage = contentPackage.contains.slice(0, MAX_LENGTH);
		} else {
			contentPackage.shortenedPackage = contentPackage.contains.slice(from, to);
		}
	}

	// ORDERED / UNORDERED
	if (contentPackage.sequence === 'ordered') {
		contentPackage.contains.forEach(item => (
			item.sequenceId = `PART ${contentPackage.contains.indexOf(item) + 1}`
		));
	} else if (contentPackage.sequence === 'none') {
		contentPackage.contains = moveToTopOfPackage(context.current, contentPackage.contains);
		if (contentPackage.shortenedPackage) contentPackage.shortenedPackage = moveToTopOfPackage(context.current, contentPackage.shortenedPackage);
	}


	return {
		package: contentPackage,
		context
	};
};
