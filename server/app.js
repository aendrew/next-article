const nUi = require('@financial-times/n-ui');
const logger = require('@financial-times/n-logger').default;
const bodyParser = require('body-parser');
const checks = require('./checks/main.js');
// Starts polling checks
checks.init();

const app = module.exports = nUi({
	systemCode: 'next-article',
	name: 'article',
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
app.get('^/article/:id/ad-blocking-articles', require('./controllers/related/ad-blocking-articles'));
app.get('/embedded-components/slideshow/:id', require('./controllers/slideshow'));

app.get(`^/content/:id(${uuid})$`, (req, res, next) => {
	res.vary('country-code');
	// cache articles for less time than all the related content
	res.set('Surrogate-Control', res.FT_SHORT_CACHE);
	next();
}, require('./controllers/negotiation'));

app.get('/__gtg', (req, res) => {
	res.status(200).end();
});

// Start the app
const port = process.env.PORT || 3001;

module.exports.listen = app.listen(port, () => {
	logger.info('Listening on ' + port);
});
