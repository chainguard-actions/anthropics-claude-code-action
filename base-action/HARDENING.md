<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.218

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.218** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading and verifying it. Two occurrences: (1) inside a timeout wrapper: `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or tamper with the remote URL (e.g., via DNS hijacking, CDN compromise, or MITM) can execute arbitrary code on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

(1) 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input value can inject arbitrary entries into PATH.

(2) 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk.

Locations:

- `action.yml:130`
- `action.yml:162`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 148, 150): Replaced both `curl ... | bash -s -- $VERSION` patterns with a download-then-execute approach. The install script is now downloaded to a mktemp file first (`curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`), then executed separately (`bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`). The `-s` and `--` flags from the pipe form are correctly dropped since they were shell stdin-reading options, not script arguments. The temp file is cleaned up after use. This applies to both the timeout branch and the else branch.

2. github-env-injection (lines 130, 162): Both locations writing user-controlled directory paths to $GITHUB_PATH are now sanitized with `printf '%s' "$VAR" | tr -d '\n\r'` before writing, preventing newline injection attacks that could add arbitrary entries to PATH.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed both findings in examples/issue-triage.yml: (1) Moved ${{ github.event.issue.number }} out of the heredoc run block into the step's env: block as ISSUE_NUMBER, referencing it as ${ISSUE_NUMBER} in the heredoc to prevent GitHub Actions template injection. The existing env: block at the bottom of the step was reused and ISSUE_NUMBER added there. (2) Pinned anthropics/claude-code-base-action@beta to full SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment.

