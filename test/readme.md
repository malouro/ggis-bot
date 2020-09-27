# Test Suites

## Unit

> Execute these tests via `yarn test`

Unit tests are tests for specific individual parts of the bot. In this case, that can mean specific **commands**, **handlers**, **events** or **scripts**. Externals are mocked as much as possible in these tests in order to isolate the testing effort to single units of code.


## End-to-end

> Execute these tests via `yarn test:e2e`

End-to-end tests are tests that connect and run on an actual Discord server. These are tests that run as if it were an actual production running Discord bot, but in a controlled environment on a specified test server with a test bot account.

# Setup and Mocks

- Mocks and test helper functions exist within `test/testHelpers` - these help set up and execute the end-to-end & unit tests
- `settings.example.json` is used as a base for the settings for the `MOCK_BOT`, while other settings are overridden via environment variables.

## Available environment variables

| Env. Variable | Setting name |
|---------------|--------------|
|`MASTER_ID`    | `masterID`   |
|`MAIN_GUILD`   | `mainGuild`  |
|`TEST_GUILD`   | `testGuild`  |
|`TEST_CHANNEL` | `mainChannel`|