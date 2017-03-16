include n.Makefile

TEST_APP := "ft-article-branch-${CIRCLE_BUILD_NUM}"

install: whitesource.config.json
	$(MAKE) install-super

whitesource.config.json:
	@if $(call IS_GIT_IGNORED); then echo '{ "apiKey": "$(WHITESOURCE_API_KEY)", "productName":"Next", "projectName":"$(call APP_NAME)" }' > $@ && $(DONE); fi

coverage-report:
	export apikey=12345; \
	export api2key=67890; \
	export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; \
	export NODE_ENV=test; \
	istanbul cover node_modules/.bin/_mocha --require server/setup --report=$(if $(CIRCLECI),lcovonly,lcov) 'test/server/**/*.test.js'

unit-test:
	export apikey=12345; export api2key=67890; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; export COCO_API_HOST=coco.ft.com; export NODE_ENV=test; \
	mocha --require server/setup 'test/server/**/*.test.js' --inline-diffs

test:
	make verify

ifeq ($(CIRCLECI),true)
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
	make a11y
	make smoke

smoke:
	nht test-urls ${TEST_APP} --throttle 1;
	export TEST_APP=${TEST_APP}; nht nightwatch test/browser/tests/*

test-smoke-local:
	nht smoke local.ft.com:3002

build:
	nui build

build-production:
	nui build --production

watch:
	nui watch
