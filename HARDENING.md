<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.272

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.272** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR from the workflow-supplied input inputs.path_to_bun_executable (through env PATH_TO_BUN_EXECUTABLE and dirname) and writes it straight to $GITHUB_PATH with no sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline in the input would add extra PATH entries. Fix: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before the write.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Step 'Revoke app token' breaks rule (a): an expression is placed directly inside the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. It also breaks rule (b): the inherited env var is expanded unquoted in `${GITHUB_API_URL:-https://api.github.com}/installation/token || true`. Fix: pass the token through env (e.g. APP_TOKEN: ${{ steps.run.outputs.github_token }}), then use "Authorization: Bearer $APP_TOKEN" and "${GITHUB_API_URL:-https://api.github.com}/installation/token".

Locations:

- `action.yml:457`
- `action.yml:459`

### script-injection (severity: high)

Step 'Install Dependencies' breaks rule (b): the inherited env var is expanded unquoted in `cd ${GITHUB_ACTION_PATH}`. Use `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:222`

### script-injection (severity: high)

Step 'Run Claude Code Action' breaks rule (b): the inherited env var is expanded unquoted in `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. Use `"${GITHUB_ACTION_PATH}/src/entrypoints/run.ts"`.

Locations:

- `action.yml:287`

### script-injection (severity: high)

Step 'Cleanup SSH signing key' breaks rule (b): the inherited env var is expanded unquoted in `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`. Put the path in double quotes.

Locations:

- `action.yml:429`

### script-injection (severity: high)

Step 'Post buffered inline comments' breaks rule (b): the inherited env var is expanded unquoted in `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts`. Put the path in double quotes.

Locations:

- `action.yml:446`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR sanitized with tr -d '\n\r' before writing to GITHUB_PATH. Revoke app token: token moved to env APP_TOKEN, API URL quoted. Quoted ${GITHUB_ACTION_PATH} in Install Dependencies cd, and in run.ts, cleanup-ssh-signing.ts, post-buffered-inline-comments.ts bun invocations.

