# Code Quality

- Always make the functions, types and variables names self descriptive. Always use names like `serverStreamingUrl` for variables instead of just `url`. Never use abbreaviations like `sw` instead of `ServiceWorker`.
- Always format the code and run the linter.

# Automated testing

- Always make sure tests will not fail if you mutate the tested code. If tests fail, make sure the problem is with the code, not tests. If tests pass, make sure the tests are covering the code correctly.
- Never test parsing features or code that can be covered by types.
- Never test third party libraries.
- Always make sure there is only one way to do something and that it will work with only one input.
- Never accept flaky tests.
- Make sure all the tests pass.

# Commits

- Describe what the contribution does in a short, precise and direct message the most descriptive as possibe. Never create a detailed list of the changed files.
- Never add metadata to the commit message.
