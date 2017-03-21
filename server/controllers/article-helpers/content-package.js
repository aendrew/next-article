const getPackageBrand = require('./get-package-brand');
const MAX_LENGTH = 9;

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
	sequenceId: getSequenceId(pkg, currentIndex),
});

const addContents = ({ pkg, currentIndex }) => {
	const shortenPackage = pkgContents => {
		if (pkgContents.length <= MAX_LENGTH) return pkgContents;
		if (currentIndex < 1) return pkgContents.slice(0, MAX_LENGTH);
		const start = (pkgContents.length - currentIndex < MAX_LENGTH) ? pkgContents.length - MAX_LENGTH : currentIndex - 1;
		return pkgContents.slice(start, MAX_LENGTH + start);
	};
	const addSequenceId = pkgContents => {
		return pkgContents.map(item => {
			const sequenceId = `PART ${pkg.contains.indexOf(item) + 1}`;
			return Object.assign({}, item, { sequenceId });
		});
	};
	const shortenedPackage = shortenPackage(pkg.contains);
	const needsSequenceId = pkg.tableOfContents && pkg.tableOfContents.labelType === 'part-number';
	const contents = needsSequenceId ? addSequenceId(shortenedPackage) : shortenedPackage;
	const isShortened = contents.length < pkg.contains.length;
	const landingPageLinkText = `See all ${pkg.contains.length} ${needsSequenceId ? 'parts' : 'stories'}`;
	return { contents, isShortened, landingPageLinkText };
};

module.exports = ({ id, containedIn }) => {
	if (!id || !containedIn || !containedIn.length) return {};
	const pkg = containedIn[0];
	const currentIndex = pkg.contains.findIndex(item => item.id === id);
	const contents = addContents({ pkg, currentIndex });
	const context = addContext({ pkg, currentIndex });
	const navigationTheme = pkg.design.theme === 'extra-wide' ? 'extra' : pkg.design.theme;
	const brand = getPackageBrand(pkg.metadata);
	return {
		package: Object.assign({}, pkg, contents, { navigationTheme, brand }),
		context
	};
};
