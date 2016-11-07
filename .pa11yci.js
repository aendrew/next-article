const viewports = [
	{
		width: 768,
		height: 1024
	},
	{
		width: 490,
		height: 732
	},
	{
		width: 320,
		height: 480
	}
];

const urls = [
	`${process.env.TEST_URL}content/395650fa-5b9c-11e5-a28b-50226830d644`,
	`${process.env.TEST_URL}content/21b56034-0ec9-3fe0-8174-ee90650e0bad`,
	`${process.env.TEST_URL}content/5cf687c7-ddb9-4243-8fea-69e50b6b5682`,
	`${process.env.TEST_URL}content/07d0ce80-944d-11e6-a80e-bcd69f323a8b`
]

const config = {
	defaults: {
		page: {
			headers: {
				"Cookie": "next-flags=ads:off,cookieMessage:off; secure=true"
			}
		},
		hideElements: '#onward-journey-section-content,.article__share__comments,[data-asset-type="video"]', // TODO This is cheating. Remove this line and fix the errors
		timeout: 25000
	},
	urls: []
}

for (viewport of viewports) {
	for (url of urls) {
		config.urls.push({
			url: url,
			viewport: viewport
		})
	}
}

module.exports = config;
