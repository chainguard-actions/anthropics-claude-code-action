<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.237

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.237** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash`. This appears twice — once inside a `bash -c` string (line 156) and once as a direct pipe (line 158). An attacker who can influence the remote URL or intercept the connection could execute arbitrary code on the runner.

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`).

1. 'Setup Custom Bun Path' (line 136): `inputs.path_to_bun_executable` is mapped to the `PATH_TO_BUN_EXECUTABLE` env var, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input value could inject arbitrary entries into PATH.

2. 'Install Claude Code' (line 174): `inputs.path_to_claude_code_executable` is mapped to `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk.

Locations:

- `action.yml:136`
- `action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 156, 158): Replaced both `curl ... | bash -s -- $VERSION` patterns (one inside `bash -c`, one direct) with a download-then-execute pattern: curl downloads the script to a mktemp file, then bash executes the file directly with the version as a positional argument. The '--' was dropped as it was the shell's option terminator, not the script's. The temp file is cleaned up after installation.

2. github-env-injection (lines 136, 174): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing user-controlled directory paths to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step (CLAUDE_DIR).

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml: (1) Moved secrets.GITHUB_TOKEN out of the heredoc in 'Setup GitHub MCP Server' step into an env: block as GITHUB_TOKEN_VALUE, changed heredoc delimiter from single-quoted 'EOF' to unquoted EOF so the shell variable expands into the JSON. (2) Moved github.event.issue.number out of the single-quoted heredoc in 'Create triage prompt' step into an env: block as ISSUE_NUMBER, referenced as ${ISSUE_NUMBER} in the prompt text. (3) Pinned anthropics/claude-code-base-action@beta to full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34.

