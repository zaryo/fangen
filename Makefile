.PHONY: fmt
fmt:
	npm exec prettier -- \
        --plugin=prettier-plugin-organize-imports \
        --write \
        src \
        templates \
        resources/css
