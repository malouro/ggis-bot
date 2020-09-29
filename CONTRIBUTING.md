# Contributing to Ggis

If you're considering contributing to the bot - THANK YOU. It doesn't go unappreciated and I'll try my best to help you with your contribution and troubleshooting any concerns. Further below is the detailed process of how you can contribute code, create pull requests and get them merged.

Thanks for reading this! See you in the pull requests. 🤙

---

## Making code changes to Ggis

The recommended way to implement code changes into Ggis, is to first fork the `master` branch, implement your changes and test on a (preferably) empty test server, and then create a pull request back into the main repo with your updates.

Of course, you can feel free to fork Ggis for your own needs and alter the code in any way you wish, without ever making a pull request back into the main repo. But, if the changes are substantial and useful, don't hesitate to bring them into here so everyone can reap the benefits. 😉

## Getting your pull request merged

### Merge Checks

Pull requests should pass most (if not *all*) merge checks below:

- **New commands** have proper `help` command documentation, a `conf` that makes sense, and documented/commented `run` function
    - See the [commands source code readme](https://github.com/malouro/ggis-bot/tree/master/commands/README.md) for more info
- Build in Circle CI **passes successfully**
    - This runs **linting**, **unit tests**, and **end-to-end** tests in the Ggis test server
- New tests aren't *required*, but certainly ***encouraged***
    - Test coverage for the new features or code you're implementing only improves the chances for your pull request to be merged
- New features or configuration are reasonably **documented**
    - New settings should be include in the settings templates and examples
    - Proper & relevant README is updated

### Commit Message Format

The typical commit message format is as such:

```
[{SCOPE}] {SUBJECT}

{BODY}
```

When pull requests are merged, this will be the format for the squashed commit message, with further details in the `{BODY}` if necessary.

<details><summary>Possible <code>{SCOPE}</code>s</summary>

- `Fix` - Bugfix or corrections
- `Docs` - Documentation related
- `Build` - Updates to the CI configuration or NPM scripts
- `Test` - New tests or updates to existing tests
- `Deps` - Dependency updates
- `!{Command}` - Updates related to the given command specifically
- `LFG` - Updates related to the LFG feature(s)
- `StreamLink` - Updates related to the StreamLink feature(s)
- `Chore` - Everything else

</details>