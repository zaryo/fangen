package-lock.json: package.json
	npm install --package-lock-only

node_modules: package-lock.json
	npm ci
	touch node_modules

.PHONY: fmt
fmt: node_modules
	npm exec prettier -- \
        --plugin=prettier-plugin-organize-imports \
        --write \
        src \
        templates \
        resources/css

.PHONY: lint
lint: node_modules
	npm exec web-ext -- lint

.PHONY: build
build: node_modules
	./build.mjs

.PHONY: watch.firefox
watch.firefox: node_modules
	./watch.mjs --firefox

.PHONY: watch.chromium
watch.chromium: node_modules
	./watch.mjs --chromium

.PHONY: test.unit
test.unit: node_modules
	node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose src/test/truncateUrl.test.ts

.PHONY: test.chromium
test.chromium: node_modules
	CHROMIUM_BINARY=$(CHROMIUM_BINARY) node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose --forceExit src/test/chromium.test.ts --detectOpenHandles

.PHONY: test.firefox
test.firefox: node_modules
	FIREFOX_BINARY=$(FIREFOX_BINARY) node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose --forceExit src/test/firefox.test.ts --detectOpenHandles

.PHONY: test
test: test.unit test.chromium test.firefox

.PHONY: clean
clean:
	rm -rf node_modules
	rm -rf dist 
