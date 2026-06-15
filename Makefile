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

.PHONY: watch.firefox 
watch.firefox: node_modules 
	npm exec web-ext -- run 

.PHONY: watch.chrome 
watch.chrome: node_modules
	npm exec web-ext -- run \
		-t chromium \

.PHONY: watch
watch: watch.firefox watch.chrome

.PHONY: test.unit
test.unit: node_modules
	node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose src/test/truncateUrl.test.js

.PHONY: test.chrome
test.chrome: node_modules
	CHROME_BINARY=$(CHROME_BINARY) node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose --forceExit src/test/chrome.test.js src/test/truncateUrl.test.js --detectOpenHandles

.PHONY: test.firefox
test.firefox: node_modules
	FIREFOX_BINARY=$(FIREFOX_BINARY) node --experimental-vm-modules node_modules/.bin/jest --runInBand --verbose --forceExit src/test/firefox.test.js

.PHONY: test
test: test.unit test.chrome test.firefox

.PHONY: clean 
clean:
	rm -rf node_modules
