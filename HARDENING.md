<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.267

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.267** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it to the PATH file with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not passed through `printf '%s' ... | tr -d '\n\r'` first. A value containing a newline can add extra, attacker-chosen PATH entries.

Locations:

- `action.yml:222`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. The runner pastes the steps output into the script text before the shell parses it. The fix is to pass it through an env: variable and reference it as "$APP_TOKEN".

Locations:

- `action.yml:457`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR now goes through printf '%s' | tr -d '\n\r' before being written to $GITHUB_PATH. Revoke app token: steps.run.outputs.github_token moved to env APP_TOKEN and referenced as "$APP_TOKEN" in the curl Authorization header.

