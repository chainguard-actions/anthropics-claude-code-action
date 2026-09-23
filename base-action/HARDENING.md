<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.222

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.222** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading it to a file for inspection. Two occurrences: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or tamper with the remote URL would achieve arbitrary code execution on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`; the script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input value could inject arbitrary entries into PATH. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`; the script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — same injection risk.

Locations:

- `action.yml:130`
- `action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 148, 150): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach. The install script is now downloaded to a mktemp file first, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator, not the script's). The temp file is cleaned up after use. Applied to both the timeout-wrapped path and the fallback path.

2. github-env-injection (lines 130, 163): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing user-controlled directory paths to $GITHUB_PATH in both the 'Setup Custom Bun Path' step (BUN_DIR) and the 'Install Claude Code' step's custom executable branch (CLAUDE_DIR).

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed in examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} from the 'Setup GitHub MCP Server' heredoc into the step's env: block as GITHUB_TOKEN_VALUE, changed heredoc delimiter from 'EOF' to EOF so the env var expands in the shell. (2) Moved ${{ github.event.issue.number }} from the 'Create triage prompt' heredoc into the step's env: block as ISSUE_NUMBER, changed heredoc delimiter from 'EOF' to EOF, and removed the duplicate env: GITHUB_REPOSITORY block that was at the bottom of the step. (3) Pinned anthropics/claude-code-base-action@beta to the full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with a # beta comment.

