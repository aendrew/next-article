'use strict';

var articleUuidRegex = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';

var express = require('ft-next-express');
var logger = require('ft-next-logger');
var app = module.exports = express();
var barriers = require('ft-next-barriers');
require('./lib/ig-poller').start();

// COMPLEX: Put access middleware before barrier middleware so that access can be cached by membership
app.use('^/:id(' + articleUuidRegex + ')$', require('./controllers/access'));

app.use(barriers.middleware(express.metrics));

//app.use(function(req, res, next) {
//    console.log('YESSSSSSSSSSSSSSS');
//    req.set({
//        //'FT-Barrier-Type': 'TRIAL',
//        //'FT-Access-Decision': 'DENIED',
//        //'Country-Code': 'GBR'
//    });
//
//    next();
//});


app.get('^/:id(' + articleUuidRegex + ')$', require('./controllers/interactive'));
app.get('^/:id(' + articleUuidRegex + ')$', require('./controllers/article'));
app.get('^/article/:id(' + articleUuidRegex + ')/people', require('./controllers/related/people'));
app.get('^/article/:id(' + articleUuidRegex + ')/organisations', require('./controllers/related/organisations'));
app.get('^/article/:id(' + articleUuidRegex + ')/topics', require('./controllers/related/topics'));
app.get('^/article/:id(' + articleUuidRegex + ')/regions', require('./controllers/related/regions'));
app.get('^/article/:id(' + articleUuidRegex + ')/story-package', require('./controllers/related/story-package'));
app.get('^/article/:id(' + articleUuidRegex + ')/more-on', require('./controllers/related/more-on'));
app.get('^/article/:id(' + articleUuidRegex + ')/special-report', require('./controllers/related/special-report'));

app.get('/embedded-components/slideshow/:id', require('./controllers/slideshow'));
app.get('/__gtg', function(req, res) {
	res.status(200).end();
});

// Start the app
var port = process.env.PORT || 3001;
module.exports.listen = app.listen(port, function() {
	logger.info("Listening on " + port);
});
