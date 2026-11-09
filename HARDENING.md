<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.270

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.270** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Nothing removes newlines first (no `printf '%s' ... | tr -d '\n\r'`). A value containing newlines would add arbitrary extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Rule (a): step 'Revoke app token' puts a GitHub Actions expression straight into its run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. The step output is substituted into the script text before the shell parses it. It should be passed through an env: variable and referenced as "$GITHUB_TOKEN" (double-quoted).

Locations:

- `action.yml:457`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: BUN_DIR is sanitized with printf '%s' | tr -d '\n\r' before writing to $GITHUB_PATH. Revoke app token: steps.run.outputs.github_token moved into env APP_GITHUB_TOKEN and referenced as "$APP_GITHUB_TOKEN" in the Authorization header.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Added double quotes in action.yml around the unquoted ${GITHUB_ACTION_PATH} in five places: `cd`, the run.ts entrypoint, the cleanup-ssh-signing.ts entrypoint, the post-buffered-inline-comments.ts entrypoint, and the ${GITHUB_API_URL:-...}/installation/token URL passed to curl. Each value is a single path or URL, so adding quotes doesn't change what runs. Nothing else in the file was changed.

