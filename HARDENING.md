<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.280

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.280** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value derived from inputs.path_to_bun_executable (passed in through env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")) to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Nothing strips newlines first (no printf '%s' ... | tr -d '\n\r'). A value that contains newlines can add arbitrary entries to PATH.

Locations:

- `action.yml:221`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion in step 'Install Dependencies': `cd ${GITHUB_ACTION_PATH}`. The variable is not double-quoted. In a composite action, treat env-derived values as untrusted and quote them ("${GITHUB_ACTION_PATH}").

Locations:

- `action.yml:226`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion in step 'Run Claude Code Action': `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. The path is not double-quoted, but the --config and --tsconfig-override arguments in the same command are.

Locations:

- `action.yml:295`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion in step 'Cleanup SSH signing key': `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`. The path is not double-quoted.

Locations:

- `action.yml:446`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion in step 'Post buffered inline comments': `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts`. The path is not double-quoted.

Locations:

- `action.yml:464`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion in step 'Revoke app token': `${GITHUB_API_URL:-https://api.github.com}/installation/token || true`. The URL argument to curl is not double-quoted.

Locations:

- `action.yml:480`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

I fixed all six findings in action.yml.

- **github-env-injection:** the 'Setup Custom Bun Path' step now removes newline and carriage-return characters from BUN_DIR (printf '%s' | tr -d '\n\r') before writing it to $GITHUB_PATH. A value with newlines can no longer add extra PATH entries.
- **script-injection:** I put double quotes around each of the five unquoted expansions:
  - `cd "${GITHUB_ACTION_PATH}"` in 'Install Dependencies'
  - the run.ts path in 'Run Claude Code Action'
  - the cleanup-ssh-signing.ts path in 'Cleanup SSH signing key'
  - the post-buffered-inline-comments.ts path in 'Post buffered inline comments'
  - the `${GITHUB_API_URL:-...}/installation/token` URL passed to curl in 'Revoke app token'

Each of these is a single value (a path or a URL), so the quotes don't change what the commands receive. I made no other changes and haven't run the action to test these edits.

