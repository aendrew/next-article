const placeFirst = ({ first, all }) => {
	return [].concat(first, all.filter(x => x !== first));
};

module.exports = function (article) {
	const { id, containedIn, contains } = article;

	if(!(contains || containedIn.length)) {
		return;
	}

	const pkg = containedIn.length ? containedIn[0] : {};

	// CONTEXT INFO
	const currentIndex = pkg.contains.findIndex(item => item.id === id);
	const context = {};
	context.prev = pkg.contains[currentIndex - 1];
	context.current = pkg.contains[currentIndex];
	context.next = pkg.contains[currentIndex + 1];
	context.home = pkg;

	// ADD A SHORTENED PACKAGE FOR NAV IF PACKAGE OVERLONG
	const MAX_LENGTH = 6;
	if (pkg.contains.length > MAX_LENGTH) {
		const from = currentIndex - (MAX_LENGTH / 2);
		const to = currentIndex + (MAX_LENGTH / 2);
		if (from < 0) {
			pkg.shortenedPackage = pkg.contains.slice(0, MAX_LENGTH);
		} else {
			pkg.shortenedPackage = pkg.contains.slice(from, to);
		}
	}

	// ORDERED / UNORDERED
	if (pkg.tableOfContents && pkg.tableOfContents.sequence === 'exact-order' && pkg.tableOfContents.labelType === 'part-number') {
		pkg.contents = pkg.contains.map(item => {
			const sequenceId = `PART ${pkg.contains.indexOf(item) + 1}`;
			return Object.assign({}, item, { sequenceId });
		});
	} else {
		pkg.contents = placeFirst({
			first: context.current,
			all: pkg.shortenedPackage ? pkg.shortenedPackage : pkg.contains
		});
	}

	return {
		package: pkg,
		context
	};
};
