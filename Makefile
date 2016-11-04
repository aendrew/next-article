include n.Makefile

TEST_APP := "ft-article-branch-${CIRCLE_BUILD_NUM}"

install: whitesource.config.json
	$(MAKE) install-super

whitesource.config.json:
	@if $(call IS_GIT_IGNORED); then echo '{ "apiKey": "$(WHITESOURCE_API_KEY)", "productName":"Next", "projectName":"$(call APP_NAME)" }' > $@ && $(DONE); fi

coverage-report:
	export apikey=12345; export api2key=67890; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; export NODE_ENV=test; istanbul cover node_modules/.bin/_mocha --require server/setup --report lcovonly 'test/server/**/*.test.js'

unit-test:
	export apikey=12345; export api2key=67890; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; export NODE_ENV=test; mocha --require server/setup 'test/server/**/*.test.js' --inline-diffs

test:
	make verify

ifeq ($(CIRCLE_BRANCH),master)
	make coverage-report && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
else
	make unit-test
endif

run:
	nht run --https

run-sw:
	nht run --https --local-apps service-worker=3010

deploy: _deploy_whitesource
	nht deploy-hashed-assets --monitor-assets
	nht ship -m

_deploy_whitesource:
	(whitesource run && rm -r ws* && rm npm-shrinkwrap.json) || echo "whitesource run failed, skipping"
	(ws-bower && rm -r ws* && rm -r .ws_bower) || echo "whitesource bower failed, skipping"
	@$(DONE)

clean-deploy: clean install deploy

tidy:
	nht destroy ${TEST_APP}

provision:
	nht deploy-hashed-assets
	nht float -md --testapp ${TEST_APP}
	make smoke
	@export TEST_URL=http://${TEST_APP}.herokuapp.com/; pa11y-ci -T 100 # remove the threshold after all a11y errors in this project are fixed

smoke:
	nht test-urls ${TEST_APP} --throttle 1;
	export TEST_APP=${TEST_APP}; nht nightwatch test/browser/tests/*

# Test a11y locally
a11y:
	@export TEST_APP="localhost:3002/"; pa11y-ci
