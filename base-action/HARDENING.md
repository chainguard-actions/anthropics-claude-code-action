<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.278

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.278** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") (from inputs.path_to_bun_executable) to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` and never runs it through printf '%s' | tr -d '\n\r' first. A value containing a newline can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") (from inputs.path_to_claude_code_executable) to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` and never runs it through printf '%s' | tr -d '\n\r' first. A value containing a newline can add extra PATH entries.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

action.yml: the Bun and Claude Code directory values are now passed through printf '%s' | tr -d '\n\r' before being written to $GITHUB_PATH. The Claude installer is no longer piped into bash. It is downloaded to a mktemp file, checked to be non-empty, then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` with the '-s --' dropped, so the version is still $1. The step still uses timeout and keeps its 3-attempt retry loop. Upstream had one 120s timeout covering both download and install; now each gets its own 120s timeout. The temp file is deleted after each attempt.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In action.yml, ${GITHUB_ACTION_PATH} is now double-quoted in two places: 'cd "${GITHUB_ACTION_PATH}"' in the Install Dependencies step, and 'bun run "${GITHUB_ACTION_PATH}/src/index.ts"' in the Run Claude Code Action step. Both steps run under bash, so quoting the variable doesn't change what they do. I made no other changes and haven't re-run the analysis.

