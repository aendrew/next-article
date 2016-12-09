const express = require('@financial-times/n-express');
const logger = require('@financial-times/n-logger').default;
const bodyParser = require('body-parser');
const checks = require('./checks/main.js');
const path = require('path');
// Starts polling checks
checks.init();

const app = module.exports = express({
	systemCode: 'next-article',
	name: 'article',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	withBackendAuthentication: true,
	withRequestTracing: true,
	hasHeadCss: true,
	hasNUiBundle: true,
	layoutsDir: path.join(process.cwd(), '/bower_components/n-ui/layout'),
	healthChecks: [
		checks.esv3,
		checks.livefyre,
		checks.errorRate
	],
	helpers: {
		nTeaserPresenter: require('@financial-times/n-teaser').presenter
	}
});

require('./lib/ig-poller').start();

app.use((req, res, next) => {
	res.set('Cache-Control', res.FT_NO_CACHE);
	next();
});

app.post('^/preview$', bodyParser.json(), require('./controllers/preview'));

// Apply this after the preview controller. Previews should not be cached
app.use((req, res, next) => {
	res.set('Surrogate-Control', res.FT_HOUR_CACHE);
	next();
});

const uuid = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';

app.get('^/article/:id/story-package', require('./controllers/related/story-package'));
app.get('^/article/:id/more-on', require('./controllers/related/more-on'));
app.get('^/content/:id/up-next', require('./controllers/related/video-up-next'));
app.get('^/article/:id/special-report', require('./controllers/related/special-report'));
app.get('^/article/:id/ad-blocking-articles', require('./controllers/related/ad-blocking-articles'));
app.get('/embedded-components/slideshow/:id', require('./controllers/slideshow'));

app.get(`^/content/:id(${uuid})$`, (req, res, next) => {
	res.vary('country-code');
	// cache articles for less time than all the related content
	res.set('Surrogate-Control', res.FT_SHORT_CACHE);
	next();
}, require('./controllers/negotiation'));

// normal caching on popular calls, no caching on other affinity calls
app.get('^/[_]{0,2}affinity/:type(popular)', require('./controllers/affinity-proxy'));
app.get(`^/[_]{0,2}affinity/:type/:id(${uuid})?`, (req, res, next) => {
	res.set('Surrogate-Control', res.FT_NO_CACHE);
	next();
}, require('./controllers/affinity-proxy'));

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});

// Start the app
const port = process.env.PORT || 3001;

module.exports.listen = app.listen(port, () => {
	logger.info('Listening on ' + port);
});
