<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.278

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.278** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR to $GITHUB_PATH. BUN_DIR comes from `dirname "$PATH_TO_BUN_EXECUTABLE"`, and PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable. The value is never passed through `printf '%s' ... | tr -d '\n\r'` before the write. If the input contains a newline, extra attacker-chosen directories get added to PATH. Offending line: echo "$BUN_DIR" >> "$GITHUB_PATH"

Locations:

- `action.yml:221`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion. Step 'Install Dependencies' runs `cd ${GITHUB_ACTION_PATH}` with the variable unquoted. It should be `cd "${GITHUB_ACTION_PATH}"`.

Locations:

- `action.yml:226`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion. Step 'Run Claude Code Action' runs `run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts` with the variable unquoted, while the lines around it quote the same variable. It should be `"${GITHUB_ACTION_PATH}/src/entrypoints/run.ts"`.

Locations:

- `action.yml:295`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion. Step 'Cleanup SSH signing key' runs `run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts` with the variable unquoted. It should be double-quoted.

Locations:

- `action.yml:446`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion. Step 'Post buffered inline comments' runs `run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts` with the variable unquoted. It should be double-quoted.

Locations:

- `action.yml:464`

### script-injection (severity: high)

Rule (b), unquoted env-var expansion. Step 'Revoke app token' builds the curl URL from an unquoted inherited env var: `${GITHUB_API_URL:-https://api.github.com}/installation/token || true`. It should be `"${GITHUB_API_URL:-https://api.github.com}/installation/token"`.

Locations:

- `action.yml:480`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

I fixed all six findings in action.yml.

- **github-env-injection:** In 'Setup Custom Bun Path', BUN_DIR now goes through `printf '%s' | tr -d '\n\r'` before it is written to $GITHUB_PATH. A newline in the input can no longer add extra directories to PATH.
- **script-injection:** I double-quoted GITHUB_ACTION_PATH in five places: the `cd` in 'Install Dependencies' and the `bun run` paths for run.ts, cleanup-ssh-signing.ts and post-buffered-inline-comments.ts. I also double-quoted the curl URL built from `${GITHUB_API_URL:-https://api.github.com}` in 'Revoke app token'.

Nothing else changed. Each value is still one path or URL, so quoting it doesn't change how the commands run.

