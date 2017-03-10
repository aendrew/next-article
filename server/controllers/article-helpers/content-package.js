const MAX_LENGTH = 6;

const placeFirst = ({ first, all }) => {
	return [].concat(first, all.filter(x => x !== first));
};

const addContext = ({ pkg, currentIndex }) => ({
	prev: pkg.contains[currentIndex - 1],
	current: pkg.contains[currentIndex],
	next: pkg.contains[currentIndex + 1],
	home: pkg
});

const addContents = ({ pkg, currentIndex }) => {
	if (pkg.tableOfContents && pkg.tableOfContents.sequence === 'exact-order' && pkg.tableOfContents.labelType === 'part-number') {
		return pkg.contains.map(item => {
			const sequenceId = `PART ${pkg.contains.indexOf(item) + 1}`;
			return Object.assign({}, item, { sequenceId });
		});
	}

	let shortenedPackage;
	if (pkg.contains.length > MAX_LENGTH) {
		const start = currentIndex - (MAX_LENGTH / 2);
		const end = currentIndex + (MAX_LENGTH / 2);
		shortenedPackage = (start >= 0) ? pkg.contains.slice(start, end) : pkg.contains.slice(0, MAX_LENGTH);
	}

	return placeFirst({
		first: pkg.contains[currentIndex],
		all: shortenedPackage ? shortenedPackage : pkg.contains
	});
};

module.exports = ({ id, containedIn }) => {
	if (!id || !containedIn || !containedIn.length) return {};
	const pkg = containedIn[0];
	const currentIndex = pkg.contains.findIndex(item => item.id === id);
	const contents = addContents({ pkg, currentIndex });
	const context = addContext({ pkg, currentIndex });
	return {
		package: Object.assign({}, pkg, { contents }),
		context
	};
};
