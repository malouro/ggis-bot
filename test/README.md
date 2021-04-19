# Test Suites

## Unit

> Execute these tests via `yarn test`

Unit tests are tests for specific individual parts of the bot. In this case, that can mean specific **commands**, **handlers**, **events** or **scripts**. Externals are mocked as much as possible in these tests in order to isolate the testing effort to single units of code.


## End-to-end

> Execute these tests via `yarn test:e2e`

End-to-end tests are tests that connect and run on an actual Discord server. These are tests that run ab actual Discord bot, but in a controlled environment on a specified test server with a test bot application.


# Setup and Mocks

- Mocks and test helper functions exist within `test/testHelpers` - these help set up and execute the end-to-end & unit tests
- `settings.example.json` is used as a base for the settings for the `MOCK_BOT`, while some other settings are overridden via environment variables.

## Available environment variables

| Env. Variable | Setting name |
|---------------|--------------|
|`TOKEN`        | `token`      |
|`MASTER_ID`    | `masterID`   |
|`MAIN_GUILD`   | `mainGuild`  |
|`TEST_GUILD`   | `testGuild`  |
|`TEST_CHANNEL` | `mainChannel`|

## End-to-end environment

Test setup and Jest configuration are defined within `test/e2e` while the test files are located in `test/e2e/suite`. Here are some details on how this environment is set up:

- `.env.test` file at the root directory sets up environment variables, here's an example of its content:

```
TOKEN=<Test bot token>
TEST_GUILD=<ID of test guild>
TEST_CHANNEL=<ID of text channel to test in>
```

> **NEVER commit this file to source** - authorization tokens do not belong in source

- `CI=true` option is provided when ran in CI and tells the test to not read environment variables from the `.env.test.` file
- `ALL_CLEAR` global flag flips to `true` after tests are done running and the test bot successfully disconnects

