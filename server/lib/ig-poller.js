const Poller = require('ft-poller');

const poller = new Poller({
	url: 'https://bertha.ig.ft.com/view/publish/gss/1Rlx_BfkwCpE8KBJZVK_p5gO61HZF7fRckQige6Hwbl8/mappings',
	defaultData: []
});

function start () {
	return poller.start({ initialRequest: true });
}

function getData () {
	return poller.getData();
}

module.exports = { start, getData };
