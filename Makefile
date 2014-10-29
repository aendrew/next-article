PORT := 3001
app := ft-next-dobi

.PHONY: test


test:
	./node_modules/.bin/mocha
	./node_modules/.bin/jshint `find . \\( -name '*.js' -o -name '*.json' \\) ! \\( -path './tmp/*' -o -path './node-v0.10.32-linux-x64/*' -o -path './node_modules/*' -o -name '*.min.*' -o -path './bower_components/*' -o -path './static/*' -o -name 'bundle.js' \\)`

test-debug:
	./node_modules/.bin/mocha --debug-brk

run:
	$(MAKE) -j2 _run

_run: run-local run-router

run-local: build
	export apikey=`cat ~/.ftapi` ; export PORT=${PORT}; nodemon server/app.js --watch server

run-router:
	export dobi=${PORT}; export PORT=5050; export DEBUG=proxy ; next-router

debug: build
	export apikey=`cat ~/.ftapi` ; export PORT=${PORT}; node --debug-brk server/app.js

build:
	export ENVIRONMENT=development; ./node_modules/.bin/gulp

build-production:
	@./node_modules/.bin/gulp

watch:
	@./node_modules/.bin/gulp watch

clean:
	# Clean+install dependencies
	git clean -fxd
	npm install
	# ./node_modules/.bin/bower install

deploy:
	./node_modules/.bin/bower install

	# Build steps
	$(MAKE) build-production

	# Pre-deploy clean
	npm prune --production

	# Package+deploy
	@./node_modules/.bin/haikro build deploy \
		--app $(app) \
		--token $(HEROKU_AUTH_TOKEN) \
		--commit `git rev-parse HEAD` \
		--verbose

clean-deploy: clean deploy
