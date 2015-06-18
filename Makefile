GIT_HASH := $(shell git rev-parse --short HEAD)
TEST_HOST := "ft-article-branch-${GIT_HASH}"
TEST_URL := "ft-article-branch-${GIT_HASH}.herokuapp.com"

.PHONY: test

install:
	obt install --verbose

test: build-production unit-test verify

verify:
	nbt verify

unit-test:
	export apikey=12345; export api2key=67890; export ELASTIC_SEARCH_HOST=ft-elastic-search.com; export NODE_ENV=test; mocha test/server/ --recursive
	karma start test/client/karma.conf.js

test-debug:
	@mocha --debug-brk --reporter spec -i test/server/

run:
	nbt run --harmony

build:
	nbt build --dev

build-production:
	nbt build

watch:
	nbt build --dev --watch

clean:
	git clean -fxd

deploy:
	nbt configure
	nbt deploy-hashed-assets
	nbt deploy
	nbt scale

visual:
	export TEST_HOST=${TEST_HOST}; myrtlejs

clean-deploy: clean install deploy

tidy:
	nbt destroy ${TEST_HOST}

provision:
	nbt provision ${TEST_HOST}
	nbt configure ft-next-article ${TEST_HOST} --overrides "NODE_ENV=branch,DEBUG=*"
	nbt deploy-hashed-assets
	nbt deploy ${TEST_HOST} --skip-enable-preboot
	make -j2 visual smoke

smoke:
	export TEST_URL=${TEST_URL}; nbt nightwatch test/browser/tests/*
