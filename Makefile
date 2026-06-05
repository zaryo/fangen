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
lint:
	npm exec web-ext -- lint

.PHONY: watch.firefox 
watch.firefox:
	npm exec web-ext -- run 

.PHONY: watch.chrome 
watch.chrome:
	npm exec web-ext -- run \
		-t chromium \
		--chromium-binary $(CHROMIUM_BINARY) 

.PHONY: clean 
clean:
	rm -rf node_modules
