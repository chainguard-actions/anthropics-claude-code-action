<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.277

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.277** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. There is no `printf '%s' ... | tr -d '\n\r'` step before the write. If the input contains a newline, it adds extra PATH entries. $GITHUB_PATH has no heredoc form, so the newline strip is required.

Locations:

- `action.yml:221`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be `cd "$GITHUB_ACTION_PATH"`.

Locations:

- `action.yml:226`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. It should be `"${GITHUB_ACTION_PATH}/src/entrypoints/run.ts"`.

Locations:

- `action.yml:290`

### script-injection (severity: high)

Rule (b): step 'Cleanup SSH signing key' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`.

Locations:

- `action.yml:433`

### script-injection (severity: high)

Rule (b): step 'Post buffered inline comments' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts`.

Locations:

- `action.yml:450`

### script-injection (severity: high)

Rule (b): step 'Revoke app token' expands an env var without quotes inside a URL: `${GITHUB_API_URL:-https://api.github.com}/installation/token`. It should be `"${GITHUB_API_URL:-https://api.github.com}/installation/token"`.

Locations:

- `action.yml:466`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

I fixed all six findings in action.yml. I haven't run the action since the edits; each change only adds quoting or removes newlines and should behave the same in normal use.

- **github-env-injection** ('Setup Custom Bun Path'): the step now removes newline characters from BUN_DIR (using `printf '%s' | tr -d '\n\r'`) before writing it to $GITHUB_PATH. A newline in path_to_bun_executable can no longer add extra PATH entries.
- **script-injection** (five places): the variable is now in double quotes in each command flagged:
  - `cd "$GITHUB_ACTION_PATH"` in 'Install Dependencies'
  - the three bun entrypoint paths: run.ts, cleanup-ssh-signing.ts and post-buffered-inline-comments.ts
  - the curl URL in 'Revoke app token': `"${GITHUB_API_URL:-https://api.github.com}/installation/token"`, with the `|| true` kept as it was.

