<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.289

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.289** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value built from inputs.path_to_bun_executable to $GITHUB_PATH without stripping newlines first. The input reaches the script through env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and echo "$BUN_DIR" >> "$GITHUB_PATH". If the input contains a newline, every extra line is added as its own PATH entry. Fix: run BUN_DIR through printf '%s' ... | tr -d '\n\r' before the write.

Locations:

- `action.yml:225`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. In a composite action, env vars are inherited and should be double-quoted ("${GITHUB_ACTION_PATH}").

Locations:

- `action.yml:230`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. The --config and --tsconfig-override arguments on the lines above are quoted, but this one is not. Fix: "${GITHUB_ACTION_PATH}/src/entrypoints/run.ts".

Locations:

- `action.yml:298`

### script-injection (severity: high)

Rule (b): step 'Cleanup SSH signing key' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`. It should be double-quoted.

Locations:

- `action.yml:447`

### script-injection (severity: high)

Rule (b): step 'Revoke app token' expands an inherited env var without quotes in the curl URL: `${GITHUB_API_URL:-https://api.github.com}/installation/token`. It should be double-quoted, e.g. "${GITHUB_API_URL:-https://api.github.com}/installation/token".

Locations:

- `action.yml:463`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

action.yml: Setup Custom Bun Path now strips newlines from BUN_DIR (printf | tr -d '\n\r') before writing to $GITHUB_PATH; double-quoted ${GITHUB_ACTION_PATH} in Install Dependencies cd, Run Claude Code Action and Cleanup SSH signing key entrypoint paths; double-quoted the ${GITHUB_API_URL:-...}/installation/token URL in Revoke app token. No behavior changes otherwise.

