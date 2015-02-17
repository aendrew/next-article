PORT := 3003
app := ft-next-grumman-v002
OBT := $(shell which origami-build-tools)
ROUTER := $(shell which next-router)
API_KEY := $(shell cat ~/.ftapi 2>/dev/null)
API2_KEY := $(shell cat ~/.ftapi_v2 2>/dev/null)

.PHONY: test

install:
ifeq ($(OBT),)
	@echo "You need to install origami build tools first!  See docs here: http://origami.ft.com/docs/developer-guide/building-modules/"
	exit 1
endif
	origami-build-tools install --verbose

test:
	origami-build-tools verify
	# Run all tests except for smoke tests
	export HOSTEDGRAPHITE_APIKEY=123; export ENVIRONMENT=production; mocha --reporter spec -i -g 'smoke tests' tests/server/

smoke-test:
	export HOSTEDGRAPHITE_APIKEY=123; export PORT=${PORT}; export apikey=12345; export api2key=67890; export ENVIRONMENT=production; mocha --reporter spec -g 'smoke tests' tests/server/

test-debug:
	@mocha --debug-brk --reporter spec -i tests/server/

run:
ifeq ($(ROUTER),)
	@echo "You need to install the next router first!  See docs here: http://git.svc.ft.com/projects/NEXT/repos/router/browse"
	exit 1
endif
ifeq ($(API_KEY),)
	@echo "You need an api key!  Speak to one of the next team to get one"
	exit 1
endif
ifeq ($(API2_KEY),)
	@echo "You need an api key for CAPI v2! Speak to one of the next team to get one"
	exit 1
endif
	$(MAKE) -j2 _run

run-debug:
	$(MAKE) -j3 _run-debug

_run: run-local run-router

_run-debug: run-local-debug run-router run-local-debug-inspector

run-local:
	export HOSTEDGRAPHITE_APIKEY=123; export apikey=${API_KEY}; export api2key=${API2_KEY}; export PORT=${PORT}; nodemon server/app.js --watch server

run-local-debug:
	export HOSTEDGRAPHITE_APIKEY=123; export apikey=${API_KEY} ; export PORT=${PORT}; nodemon --debug server/app.js
	# for all output from ft-api-client then switch to using this line for debug mode
	# export HOSTEDGRAPHITE_APIKEY=123; export apikey=${API_KEY} ; export DEBUG=ft-api-client*; export PORT=${PORT}; nodemon --debug server/app.js

run-local-debug-inspector:
	node-inspector;

run-router:
	export grumman=${PORT}; export PORT=5050; export DEBUG=proxy ; next-router

build:
	export ENVIRONMENT=development; ./node_modules/.bin/gulp build-dev;

build-production:
	@bower install
	@gulp build-prod

watch:
	export ENVIRONMENT=development; gulp watch

clean:
	git clean -fxd

deploy:
	next-build-tools configure
	next-build-tools deploy
	
clean-deploy: clean install deploy
