<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.284

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.284** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The newline strip `printf '%s' ... | tr -d '\n\r'` is not run before the write. Every line written to GITHUB_PATH becomes a PATH entry, so an input that contains newlines can add any directory to PATH.

Locations:

- `action.yml:225`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an environment variable without quotes: `cd ${GITHUB_ACTION_PATH}`. A composite action inherits its environment from the calling workflow, so this should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:230`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an environment variable without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. The --config and --tsconfig-override arguments next to it are quoted, but this one is not.

Locations:

- `action.yml:299`

### script-injection (severity: high)

Rule (b): step 'Cleanup SSH signing key' expands an environment variable without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`.

Locations:

- `action.yml:451`

### script-injection (severity: high)

Rule (b): step 'Post buffered inline comments' expands an environment variable without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts`.

Locations:

- `action.yml:469`

### script-injection (severity: high)

Rule (b): step 'Revoke app token' expands an environment variable without quotes in the curl URL: `${GITHUB_API_URL:-https://api.github.com}/installation/token`. It should be double-quoted.

Locations:

- `action.yml:485`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

I fixed all six findings in hardened/action/action.yml.

1. In the 'Setup Custom Bun Path' step, newlines and carriage returns are now stripped from BUN_DIR with printf '%s' | tr -d '\n\r' before it is written to $GITHUB_PATH. A path_to_bun_executable value containing a newline can no longer add extra PATH entries.
2. Added double quotes around every unquoted ${GITHUB_ACTION_PATH} the findings listed: the cd in 'Install Dependencies', and the entrypoint paths passed to bun run in the Run Claude Code Action, Cleanup SSH signing key and Post buffered inline comments steps.
3. In the 'Revoke app token' step, the curl URL ${GITHUB_API_URL:-https://api.github.com}/installation/token is now in double quotes.

Each of these variables holds a single path or URL, so adding quotes doesn't change how the commands behave. I haven't run the action to confirm.

