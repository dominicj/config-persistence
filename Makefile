REPORTER = spec

test-bdd:
	@./node_modules/.bin/mocha \
    --reporter $(REPORTER) \
    --require should \
    --ui bdd \
    test/*.js

test-all:   test-bdd

.PHONY: test-all