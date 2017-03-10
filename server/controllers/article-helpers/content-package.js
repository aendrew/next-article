const MAX_LENGTH = 6;

const placeFirst = ({ first, all }) => {
	return [].concat(first, all.filter(x => x !== first));
};

const getSequenceId = (pkg, currentIndex) => {
	if (pkg.tableOfContents && pkg.tableOfContents.sequence === 'exact-order' && pkg.tableOfContents.labelType === 'part-number') {
		return `PART ${currentIndex + 1}`;
	}
}

const addContext = ({ pkg, currentIndex }) => ({
	prev: pkg.contains[currentIndex - 1],
	current: pkg.contains[currentIndex],
	next: pkg.contains[currentIndex + 1],
	home: pkg,
	sequenceId: getSequenceId(pkg, currentIndex)
});

const addContents = ({ pkg, currentIndex }) => {
	const addSequenceId = pkgContents => {
		return pkgContents.map(item => {
			const sequenceId = `PART ${pkg.contains.indexOf(item) + 1}`;
			return Object.assign({}, item, { sequenceId });
		});
	};

	let shortenedPackage;
	if (pkg.contains.length > MAX_LENGTH) {
		const start = currentIndex - (MAX_LENGTH / 2);
		const end = currentIndex + (MAX_LENGTH / 2);
		shortenedPackage = (start >= 0) ? pkg.contains.slice(start, end) : pkg.contains.slice(0, MAX_LENGTH);
	}

	let contents;
	if (pkg.tableOfContents && pkg.tableOfContents.sequence === 'exact-order' && pkg.tableOfContents.labelType === 'part-number') {
		contents = !!shortenedPackage ? addSequenceId(shortenedPackage) : addSequenceId(pkg.contains);
	} else {
		contents = placeFirst({
			first: pkg.contains[currentIndex],
			all: shortenedPackage ? shortenedPackage : pkg.contains
		});
	}

	return {
		contents,
		shortened: !!shortenedPackage,
		goToPackagePageText: pkg.design.theme === 'special-report' ? 'See all stories in the report' : 'See all stories in this series'
	};
};

module.exports = ({ id, containedIn }) => {
	if (!id || !containedIn || !containedIn.length) return {};
	const pkg = containedIn[0];
	const currentIndex = pkg.contains.findIndex(item => item.id === id);
	const contents = addContents({ pkg, currentIndex });
	const context = addContext({ pkg, currentIndex });
	return {
		package: Object.assign({}, pkg, contents),
		context
	};
};
