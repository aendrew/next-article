'use strict';

const express = require('@financial-times/n-express');
const logger = require('@financial-times/n-logger').default;
const bodyParser = require('body-parser');
const checks = require('./checks/main.js');

// Starts polling checks
checks.init();

const app = module.exports = express({
	name: 'article',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	withBackendAuthentication: true,
	withRequestTracing: true,
	healthChecks: [
		checks.esv3,
		checks.livefyre,
		checks.errorRate
	]
});

require('./lib/ig-poller').start();

app.use(bodyParser.json());
app.use((req, res) => {
	res.set('Surrogate-Control', 'max-age=600,stale-while-revalidate=20,stale-if-error=259200');
});

app.post('^/preview$', require('./controllers/preview'));

const uuid = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';

app.get('^/article/:id/story-package', require('./controllers/related/story-package'));
app.get('^/article/:id/more-on', require('./controllers/related/more-on'));
app.get('^/article/:id/special-report', require('./controllers/related/special-report'));
app.get('^/article/:id/social-counts', require('./controllers/related/social-counts'));
app.get('/embedded-components/slideshow/:id', require('./controllers/slideshow'));

app.get(`^/content/:id(${uuid})$`, require('./controllers/negotiation'));

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});

// Start the app
const port = process.env.PORT || 3001;

module.exports.listen = app.listen(port, () => {
	logger.info("Listening on " + port);
});
