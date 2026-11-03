<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), where PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. It then writes the value with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without first running printf '%s' ... | tr -d '\n\r'. If the input contains newlines, extra lines get added to PATH.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Step 'Revoke app token' breaks rule (a): an expression is put directly into the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Move the value into an env: variable and reference it as "$APP_TOKEN". The same step also breaks rule (b): the inherited env var is expanded unquoted in `${GITHUB_API_URL:-https://api.github.com}/installation/token`. It should be double-quoted.

Locations:

- `action.yml:457`
- `action.yml:459`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR is now sanitized with printf '%s' | tr -d '\n\r' before being appended to $GITHUB_PATH. Revoke app token: moved steps.run.outputs.github_token into env APP_TOKEN, referenced as "$APP_TOKEN", and double-quoted the ${GITHUB_API_URL:-...}/installation/token URL.

