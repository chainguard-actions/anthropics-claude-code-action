<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.269

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.269** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR from the input path_to_bun_executable (via env PATH_TO_BUN_EXECUTABLE and `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`). It then writes that value to $GITHUB_PATH without removing newlines first (`echo "$BUN_DIR" >> "$GITHUB_PATH"`). A value containing newlines can add extra PATH entries. Fix: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before the write.

Locations:

- `action.yml:272`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside its run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. The steps.*.outputs value is substituted into the script before the shell parses it. Fix: pass it in through an env: variable (e.g. APP_TOKEN) and use "$APP_TOKEN" in the script.

Locations:

- `action.yml:470`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR is sanitized with tr -d '\n\r' before writing to $GITHUB_PATH. Revoke app token: steps.run.outputs.github_token moved to env APP_TOKEN and referenced as "$APP_TOKEN".

