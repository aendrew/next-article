const books = {
	landing: 'aec5898e-b88c-11e6-ba85-95d1533d9a62',
	contains: [
		'315c348e-b819-11e6-ba85-95d1533d9a62',
		'ffdb7ae0-b819-11e6-ba85-95d1533d9a62',
		'156f0328-b81e-11e6-ba85-95d1533d9a62',
		'6c126eae-b81e-11e6-ba85-95d1533d9a62',
		'c2736eba-b81e-11e6-ba85-95d1533d9a62',
		'0ddeb68e-b81f-11e6-ba85-95d1533d9a62',
		'536e6672-b81f-11e6-ba85-95d1533d9a62',
		'a9c4758e-b81f-11e6-ba85-95d1533d9a62',
		'fe2da1cc-b81f-11e6-ba85-95d1533d9a62',
		'49c3edda-b820-11e6-ba85-95d1533d9a62',
		'82be3bcc-b820-11e6-ba85-95d1533d9a62',
		'ad99928c-b821-11e6-ba85-95d1533d9a62',
		'23c18f5a-b822-11e6-ba85-95d1533d9a62',
		'9583417e-b822-11e6-ba85-95d1533d9a62',
		'952faba8-b823-11e6-ba85-95d1533d9a62',
		'f90a98ea-b823-11e6-ba85-95d1533d9a62',
		'41008f7e-b824-11e6-ba85-95d1533d9a62',
		'99d67032-b824-11e6-ba85-95d1533d9a62',
		'de4fa4a4-b824-11e6-ba85-95d1533d9a62',
		'3d3ffbc6-b825-11e6-ba85-95d1533d9a62',
		'84e8912c-b825-11e6-ba85-95d1533d9a62',
		'c0eaa1b0-b825-11e6-ba85-95d1533d9a62',
		'0447a2b4-b826-11e6-ba85-95d1533d9a62',
		'503fb2ec-b826-11e6-ba85-95d1533d9a62'
	]
}

const xiChina = {
	landing: '57371736-4b69-11e6-88c5-db83e98a590a',
	contains: [
		'dde0af68-4db2-11e6-88c5-db83e98a590a',
		'ccd94b46-4db5-11e6-88c5-db83e98a590a'
	]
};

const womenOTY = {
	landing: '4ff0cb62-bc74-11e6-8b45-b8b81dd5d080',
	contains: [
		'2616fda2-bc06-11e6-8b45-b8b81dd5d080',
		'278a54fe-bc06-11e6-8b45-b8b81dd5d080',
		'2bbe70be-bc06-11e6-8b45-b8b81dd5d080',
		'cd5c2b24-bc05-11e6-8b45-b8b81dd5d080',
		'caa29df0-bc00-11e6-8b45-b8b81dd5d080',
		'24450582-bc06-11e6-8b45-b8b81dd5d080',
		'22a6925e-bc06-11e6-8b45-b8b81dd5d080',
		'0055d3ea-bc06-11e6-8b45-b8b81dd5d080',
		'febac644-bc05-11e6-8b45-b8b81dd5d080',
		'a0e87a3a-bc09-11e6-8b45-b8b81dd5d080',
		'd39c1e02-bc11-11e6-8b45-b8b81dd5d080',
		'd5796cc0-bc11-11e6-8b45-b8b81dd5d080',
		'a2a673a4-bc09-11e6-8b45-b8b81dd5d080',
		'a5b907be-bc09-11e6-8b45-b8b81dd5d080',
		'3088a9c0-bc06-11e6-8b45-b8b81dd5d080',
		'713f2c00-bc10-11e6-8b45-b8b81dd5d080',
		'67883ebc-bc11-11e6-8b45-b8b81dd5d080',
		'9f472b72-bc09-11e6-8b45-b8b81dd5d080',
		'7e4933b8-b757-11e6-ba85-95d1533d9a62'
	]
};

const animals = {
	landing: '79a65cf6-d33f-11e6-b06b-680c49b4b4c0',
	contains: [
		'd4efba32-d2ca-11e6-b06b-680c49b4b4c0',
		'c65793a0-d2ca-11e6-b06b-680c49b4b4c0',
		'8f37f666-d203-11e6-b06b-680c49b4b4c0',
		'8dba07fc-d203-11e6-b06b-680c49b4b4c0',
		'd351de76-d2ca-11e6-b06b-680c49b4b4c0',
		'853d15a4-c184-11e6-9bca-2b93a6856354',
		'869c8c04-c184-11e6-9bca-2b93a6856354',
		'aeb23f84-d2ca-11e6-b06b-680c49b4b4c0',
		'909b5f16-d203-11e6-b06b-680c49b4b4c0'
	]
};

const landingPageIds = [
	books.landing,
	xiChina.landing,
	womenOTY.landing,
	animals.landing
];

const childPageIds = [].concat(
	books.contains,
	xiChina.contains,
	womenOTY.contains,
	animals.contains
);

const packageLookup = [].concat(
	books,
	xiChina,
	womenOTY,
	animals
);

module.exports = {
	packageLookup,
	landingPageIds,
	childPageIds
};
