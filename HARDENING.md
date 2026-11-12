<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.273

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.273** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitizing it first. The input is routed through env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH". There is no printf '%s' ... | tr -d '\n\r' step, so newlines in the input can inject extra PATH entries.

Locations:

- `action.yml:221`

### script-injection (severity: high)

Rule (b): a process environment variable is expanded unquoted in a composite action run: block. Composite steps inherit the caller's environment, so these values are treated as workflow-controlled. Offending lines: 'cd ${GITHUB_ACTION_PATH}' (Install Dependencies); 'run ${GITHUB_ACTION_PATH}/src/entrypoints/run.ts' (Run Claude Code Action); 'run ${GITHUB_ACTION_PATH}/src/entrypoints/cleanup-ssh-signing.ts' (Cleanup SSH signing key); 'run ${GITHUB_ACTION_PATH}/src/entrypoints/post-buffered-inline-comments.ts' (Post buffered inline comments); '${GITHUB_API_URL:-https://api.github.com}/installation/token' (Revoke app token). Each expansion should be double-quoted.

Locations:

- `action.yml:226`
- `action.yml:291`
- `action.yml:434`
- `action.yml:451`
- `action.yml:467`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path now strips newline characters from the directory with printf '%s' | tr -d '\n\r' before adding it to $GITHUB_PATH. Five unquoted expansions are now double-quoted: the cd to ${GITHUB_ACTION_PATH} in Install Dependencies, the three bun entrypoint paths (run.ts, cleanup-ssh-signing.ts, post-buffered-inline-comments.ts), and the ${GITHUB_API_URL:-...}/installation/token URL in Revoke app token. Quoting only changes behaviour for values that contain spaces, so it does not affect how the action normally runs. Not tested.

