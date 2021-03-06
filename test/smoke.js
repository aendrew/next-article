module.exports = [
	// Health check
	{
		timeout: 10000,
		urls: {
			'/__health': 200
		}
	},
	{
		timeout: 10000,
		headers: { 'FT-Flags': 'ads:off,sourcepoint:off' },
		urls: {
			// not in CAPI (redirected to ft.com -> redirected to barrier)
			'/content/8f88c930-d00a-11da-80fb-0000779e2340': 'http://www.ft.com/cms/s/0/8f88c930-d00a-11da-80fb-0000779e2340.html?ft_site=falcon&desktop=true',
			// methode
			'/content/395650fa-5b9c-11e5-a28b-50226830d644': 200,
			// fastft
			'/content/21b56034-0ec9-3fe0-8174-ee90650e0bad': 200,
			// podcast
			'/content/5cf687c7-ddb9-4243-8fea-69e50b6b5682': 200,
			// video
			'/content/c382002a-a839-366c-9b5f-c3e51a25e05d': 200,
			// slideshow
			'/embedded-components/slideshow/593496fc-a4d5-11e5-97e1-a754d5d9538c': 200,
			// fragment view
			'/content/a85bf481-457c-3bd4-bd49-3801d175d583?fragment=true': 200,
			// article with topper
			'/content/7b38ad62-d1a5-11e6-b06b-680c49b4b4c0': 200,
			// related fragments - story package
			'/article/02cad03a-844f-11e4-bae9-00144feabdc0/story-package?articleIds=b56232bc-adec-11e4-919e-00144feab7de,8a5c2c02-a47e-11e4-b943-00144feab7de,6bfcdc6e-a0b6-11e4-8ad8-00144feab7de,c0dbd6d6-8072-11e4-9907-00144feabdc0': 200,
			// related fragments - more-ons
			'/article/02cad03a-844f-11e4-bae9-00144feabdc0/more-on?tagIds=TnN0ZWluX1BOX1BvbGl0aWNpYW5fMTY4OA==-UE4=,NDdiMzAyNzctMTRlMy00Zjk1LWEyZjYtYmYwZWIwYWU2NzAy-VG9waWNz&index=1': 200,
			// articles with not tagged with X
			'/article/02cad03a-844f-11e4-bae9-00144feabdc0/more-on?tagIds=TnN0ZWluX1BOX1BvbGl0aWNpYW5fMTY4OA==-UE4=,NDdiMzAyNzctMTRlMy00Zjk1LWEyZjYtYmYwZWIwYWU2NzAy-VG9waWNz&index=1': {
				content: ''
			}
		}
	},
	{
		timeout: 10000,
		headers: { 'FT-Flags': 'articleTopper:on,ads:off,sourcepoint:off' },
		urls: {
			// not in CAPI (redirected to ft.com -> redirected to barrier)
			'/content/8f88c930-d00a-11da-80fb-0000779e2340': 'http://www.ft.com/cms/s/0/8f88c930-d00a-11da-80fb-0000779e2340.html?ft_site=falcon&desktop=true',
			// methode
			'/content/395650fa-5b9c-11e5-a28b-50226830d644': 200,
			// methode article with topper
			'/content/5c3cae78-dbef-11e6-9d7c-be108f1c1dce': 200,
			// fastft
			'/content/21b56034-0ec9-3fe0-8174-ee90650e0bad': 200,
			// podcast
			'/content/5cf687c7-ddb9-4243-8fea-69e50b6b5682': 200,
			// video
			'/content/c382002a-a839-366c-9b5f-c3e51a25e05d': 200,
			// fragment view
			'/content/a85bf481-457c-3bd4-bd49-3801d175d583?fragment=true': 200,
			// article with topper
			'/content/7b38ad62-d1a5-11e6-b06b-680c49b4b4c0': 200
		}
	},
	// sugested reads
	{
		timeout: 10000,
		headers: { 'FT-Flags': 'articleSuggestedRead:off,ads:off,sourcepoint:off' },
		urls: {
			// any old article
			'/content/7a41c98c-fd85-11e6-96f8-3700c5664d30': 200
		}
	},
	// content package
	{
		timeout: 10000,
		headers: { 'FT-Flags': 'contentPackages:on,ads:off,sourcepoint:off' },
		urls: {
			'/content/aec5898e-b88c-11e6-ba85-95d1533d9a62': 200, //best books of the year, top level package
			'/content/156f0328-b81e-11e6-ba85-95d1533d9a62': 200, // best books of the year article, in a package
			'/content/395650fa-5b9c-11e5-a28b-50226830d644': 200, //normal article
			'/content/5cf687c7-ddb9-4243-8fea-69e50b6b5682': 200, //podcast
			'/content/c382002a-a839-366c-9b5f-c3e51a25e05d': 200, //video
			'/content/a85bf481-457c-3bd4-bd49-3801d175d583?fragment=true': 200 //fragment view
		}
	}
];
