<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.281

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.281** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR, which comes from inputs.path_to_bun_executable (via PATH_TO_BUN_EXECUTABLE and dirname), straight to $GITHUB_PATH: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Nothing removes newlines first. A value containing newlines would add extra entries to PATH. Fix: strip newlines just before the write, e.g. `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r'); echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:225`

### script-injection (severity: high)

Rule (b): step 'Install Dependencies' expands an inherited env var without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:230`

### script-injection (severity: high)

Rule (b): step 'Run Claude Code Action' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts`. It should be `run "${GITHUB_ACTION_PATH}/src/entrypoints/run.ts"`.

Locations:

- `action.yml:299`

### script-injection (severity: high)

Rule (b): step 'Cleanup SSH signing key' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts`. It should be quoted.

Locations:

- `action.yml:451`

### script-injection (severity: high)

Rule (b): step 'Post buffered inline comments' expands an env var without quotes: `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts`. It should be quoted.

Locations:

- `action.yml:469`

### script-injection (severity: high)

Rule (b): step 'Revoke app token' expands an env var without quotes as the curl URL: `${GITHUB_API_URL:-https://api.github.com}/installation/token`. A composite action inherits this env var from the calling workflow. It should be `"${GITHUB_API_URL:-https://api.github.com}/installation/token"`.

Locations:

- `action.yml:485`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

I fixed all six findings in hardened/action/action.yml. I haven't run anything to test the changes.

- github-env-injection: the 'Setup Custom Bun Path' step now removes newline and carriage-return characters from BUN_DIR (`tr -d '\n\r'`) right before writing it to $GITHUB_PATH.
- script-injection: added double quotes around the unquoted variables in five places:
  - `cd "${GITHUB_ACTION_PATH}"` in 'Install Dependencies'
  - the bun script path in 'Run Claude Code Action', 'Cleanup SSH signing key' and 'Post buffered inline comments'
  - the curl URL `"${GITHUB_API_URL:-https://api.github.com}/installation/token"` in 'Revoke app token'

All five changes only add quotes, so each value still reaches the command as the same single argument as before.

