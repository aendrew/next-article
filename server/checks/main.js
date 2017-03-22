/*eslint-disable*/

const signedFetch = require('signed-aws-es-fetch');
const nHealth = require('n-health');

const INTERVAL = 60 * 1000;

const statuses = {
	elastic: false,
	livefyre: false
};

function pingServices () {
	signedFetch('https://next-elastic.ft.com/v3_api_v2/item/_search?size=0')
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Elasticsearch returned a ${response.statusCode}`);
			}
		})
		.then((json) => { statuses.elastic = Boolean(json.hits && json.hits.total); })
		.catch(() => { statuses.elastic = false; });

	fetch('https://session-user-data.webservices.ft.com/v1/livefyre/init?title=Terror+must+not+trample+on+Tunisian+institutions+%E2%80%94+FT.com&url=https%3A%2F%2Fnext.ft.com%2Fcontent%2F4b949d2c-1fdc-11e5-ab0f-6bb9974f25d0&articleId=4b949d2c-1fdc-11e5-ab0f-6bb9974f25d0&el=comments&stream_type=livecomments&callback=jsonp_m49qbwvzpvi0&_=1444384681349')
		.then((res) => { statuses.livefyre = res.ok; })
		.catch(() => { statuses.livefyre = false; });
}

function elasticStatus () {
	return {
		getStatus: () => ({
			name: 'elasticsearch responded successfully.',
			ok: statuses.elastic,
			businessImpact: 'Users may not see article content.',
			severity: 2,
			technicalSummary: 'Fetches an article to determine whether the service is running.',
			panicGuide: 'Follow the runbooks, do usual diagnosis and escalate as appropriate'
		})
	};
}

function livefyreStatus () {
	return {
		getStatus: () => ({
			name: 'session-user-data.webservices.ft.com (livefyre) responded successfully.',
			ok: statuses.livefyre,
			businessImpact: 'Users may not see comments at bottom of article',
			severity: 3,
			technicalSummary: 'Fetches the session-user-data call used on the client side to initialise comments',
			panicGuide: 'Follow the runbooks, do usual diagnosis and escalate as appropriate'
		})
	};
}

module.exports = {
	init: function () {
		pingServices();
		setInterval(pingServices, INTERVAL);
	},
	elastic: elasticStatus(),
	livefyre: livefyreStatus(),
	errorRate: nHealth.runCheck({
			type: 'graphiteSpike',
			numerator: `next.heroku.article.*${process.env.REGION || ''}.express.default_route_GET.res.status.5**.count`,
			divisor: `next.heroku.article.*${process.env.REGION || ''}.express.default_route_GET.res.status.*.count`,
			name: '500 rate is acceptable',
			severity: 2,
			threshold: 8,
			businessImpact: 'Number of users seeing an error instead of an article is significantly higher than usual',
			technicalSummary: 'The proportion of requests responding with a 5xx status is at least 5 times higher than the baseline level',
			panicGuide: 'Check sentry(https://app.getsentry.com/nextftcom/ft-next-article/) and app logs to see what errors are occuring.'
		})
};
