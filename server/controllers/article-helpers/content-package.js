const getPackageBrand = require('./get-package-brand');
const MAX_LENGTH = 9;

const getSequenceId = (pkg, currentIndex) => {
	if (pkg.tableOfContents && pkg.tableOfContents.sequence === 'exact-order' && pkg.tableOfContents.labelType === 'part-number') {
		return `PART ${currentIndex + 1}`;
	}
};

const addContext = ({ pkg, currentIndex }) => ({
	prev: Object.assign({ sequenceId: getSequenceId(pkg, currentIndex - 1) }, pkg.contains[currentIndex - 1]),
	current: pkg.contains[currentIndex],
	next: Object.assign({ sequenceId: getSequenceId(pkg, currentIndex + 1) }, pkg.contains[currentIndex + 1]),
	home: pkg,
	sequenceId: getSequenceId(pkg, currentIndex)
});


const shortenPackage = ({ pkgContents, order, currentIndex }) => {
	if (pkgContents.length <= MAX_LENGTH) return pkgContents;

	let start;
	if (currentIndex < 1) {
		start = 0;
	} else if (order === 'none') {
		const isPkgLongEnough = pkgContents.length - currentIndex < MAX_LENGTH;
		start = isPkgLongEnough ? pkgContents.length - MAX_LENGTH : currentIndex;
	} else {
		const isPkgLongEnough = pkgContents.length - (currentIndex - 1) < MAX_LENGTH;
		start = isPkgLongEnough ? pkgContents.length - MAX_LENGTH : currentIndex - 1;
	};

	return pkgContents.slice(start, MAX_LENGTH + start);
};

const addLabels = ({ pkgContents, originalPkg, order, currentIndex }) => {
	if (order === 'part-number') {
		return pkgContents.map(item => {
			const label = `PART ${originalPkg.contains.indexOf(item) + 1}`;
			return Object.assign({}, item, { label });
		});
	}
	if (order === 'none') {
		const current = Object.assign({
			label: 'Currently reading:'
		}, originalPkg.contains[currentIndex]);
		return [].concat(current, pkgContents.filter(item => item.id !== current.id));
	}
	return pkgContents;
};

const addContents = ({ pkg, currentIndex }) => {
	const toc = pkg.tableOfContents || {};
	const order = toc.labelType || toc.sequence;
	const shortPackage = shortenPackage({ pkgContents: pkg.contains, currentIndex, order });
	return {
		contents: addLabels({ pkgContents: shortPackage, originalPkg: pkg, currentIndex, order }),
		isShortened: shortPackage.length < pkg.contains.length,
		originalPkgLength: pkg.contains.length,
		groupLabel: order === 'part-number' ? 'parts' : 'stories'
	};
};

module.exports = ({ id, containedIn }) => {
	if (!id || !containedIn || !containedIn.length) return {};
	const pkg = containedIn[0];
	const currentIndex = pkg.contains.findIndex(item => item.id === id);
	if (currentIndex < 0) return {};

	const contents = addContents({ pkg, currentIndex });
	const context = addContext({ pkg, currentIndex });
	const navigationTheme = pkg.design.theme === 'extra-wide' ? 'extra' : pkg.design.theme;
	const brand = getPackageBrand(pkg.metadata);

	return {
		package: Object.assign({}, pkg, contents, { navigationTheme, brand }),
		context
	};
};
