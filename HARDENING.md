<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.271

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.271** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. The line is `echo "$BUN_DIR" >> "$GITHUB_PATH"` and it does not first strip newlines with printf '%s' ... | tr -d '\n\r'. A value containing newlines can add extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly in its run script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. The step output is substituted into the shell script text before bash parses it. It should be passed through an env: variable and referenced as "$GITHUB_TOKEN".

Locations:

- `action.yml:457`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR is sanitized with printf '%s' | tr -d '\n\r' before writing to $GITHUB_PATH. Revoke app token: steps.run.outputs.github_token moved into env APP_TOKEN and referenced as "$APP_TOKEN" in the curl Authorization header.

