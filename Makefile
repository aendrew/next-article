include n.Makefile

TEST_APP := "ft-article-branch-${CIRCLE_BUILD_NUM}"

test: verify unit-test

coverage:
	export apikey=12345; export api2key=67890; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; export NODE_ENV=test; istanbul cover node_modules/.bin/_mocha --report lcovonly 'test/server/**/*.test.js'

unit-test:
	$(NPM_BIN_ENV); export apikey=12345; export api2key=67890; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; export NODE_ENV=test; mocha 'test/server/**/*.test.js' --inline-diffs

+test:
	make verify

ifeq ($(CIRCLE_BRANCH),master)
	make coverage && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
else
	make unit-test
endif

run:
	$(NPM_BIN_ENV); nbt run

build:
	$(NPM_BIN_ENV); nbt build --dev

build-production:
	$(NPM_BIN_ENV); nbt build

watch:
	$(NPM_BIN_ENV); nbt build --dev --watch

deploy:
	nbt deploy-hashed-assets
	nbt ship -m

visual:
	# Note: || is not OR; it executes the RH command only if LH test is truthful.
	test -d ${CIRCLE_BUILD_NUM} || (export TEST_APP=${TEST_APP}; myrtlejs)

clean-deploy: clean install deploy

tidy:
	nbt destroy ${TEST_APP}

provision:
	nbt deploy-hashed-assets
	nbt float -md --testapp ${TEST_APP}
	make smoke

smoke:
	nbt test-urls ${TEST_APP} --throttle 1;
	# TODO: re-enable firefox
	export TEST_APP=${TEST_APP}; nbt nightwatch test/browser/tests/* -e ie9,ie11,chrome,firefox,iphone6_plus,Android_Nexus7HD
