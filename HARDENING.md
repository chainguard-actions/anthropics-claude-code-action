<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.290

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.290** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value built from inputs.path_to_bun_executable (through env PATH_TO_BUN_EXECUTABLE and then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")) to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Newlines are not stripped first with printf '%s' ... | tr -d '\n\r', so a value containing newlines would add extra PATH entries.

Locations:

- `action.yml:226`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands the github.action_path-derived env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:230`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' has an unquoted expansion: `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. The other arguments on this command are quoted, but this one is not.

Locations:

- `action.yml:298`

### script-injection (severity: high)

Rule (b): step 'Cleanup SSH signing key' has an unquoted expansion: `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`.

Locations:

- `action.yml:448`

### script-injection (severity: high)

Rule (b): step 'Revoke app token' expands an env var without quotes in the curl URL: `${GITHUB_API_URL:-https://api.github.com}/installation/token || true`. It should be quoted, e.g. "${GITHUB_API_URL:-https://api.github.com}/installation/token".

Locations:

- `action.yml:464`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

In action.yml, 'Setup Custom Bun Path' now strips newlines and carriage returns from BUN_DIR (printf '%s' | tr -d '\n\r') before writing it to $GITHUB_PATH. I added double quotes around the GITHUB_ACTION_PATH expansions in 'Install Dependencies', 'Run Claude Code Action' and 'Cleanup SSH signing key', and around the GITHUB_API_URL curl URL in 'Revoke app token'. The steps run the same way as before. Nothing has been run or tested yet.

