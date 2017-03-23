const Poller = require('ft-poller');

const poller = new Poller({
	url: 'https://bertha.ig.ft.com/view/publish/gss/1Rlx_BfkwCpE8KBJZVK_p5gO61HZF7fRckQige6Hwbl8/mappings',
	defaultData: new Map(),
	parseData: rows => (rows || []).reduce((map, row) => {
		if (row.articleuuid && row.interactiveurl && row.displaytype === 'redirect') {
			map.set(row.articleuuid, row.interactiveurl);
		}
		return map;
	}, new Map())
});

function start () {
	return poller.start({ initialRequest: true });
}

function getData () {
	return poller.getData();
}

function lookup (id) {
	const map = poller.getData();
	if (!map) return;
	return map.get(id);
}

module.exports = { start, getData, lookup };
