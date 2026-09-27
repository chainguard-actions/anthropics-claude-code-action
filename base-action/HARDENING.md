<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.69** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first saving to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears in both a `timeout bash -c "..."` wrapper and a plain `else` branch). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `action.yml:126`
- `action.yml:128`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`).

1. 'Setup Custom Bun Path': `inputs.path_to_bun_executable` is placed in env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline stripping.

2. 'Install Claude Code': `inputs.path_to_claude_code_executable` is placed in env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline stripping.

An attacker supplying a path containing newlines can inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:111`
- `action.yml:140`

### script-injection (severity: high)

In examples/issue-triage.yml, GitHub Actions template expressions are interpolated directly inside `run:` shell heredoc blocks:

(a) `${{ secrets.GITHUB_TOKEN }}` is embedded inside a `run:` heredoc (Setup GitHub MCP Server step). Even though the heredoc uses `'EOF'` quoting (which prevents shell variable expansion), GitHub Actions template substitution happens before the shell runs, so the value is injected into the shell script text.

(b) `${{ github.event.issue.number }}` is embedded inside a `run:` heredoc (Create triage prompt step). This value is attacker-controlled — an issue opener can craft the issue number context. The expression is substituted directly into the shell script before execution.

Both violate the rule that no `${{ ... }}` expression should appear inside a `run:` shell command string.

Locations:

- `examples/issue-triage.yml:27`
- `examples/issue-triage.yml:47`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` (both timeout and plain branches) with downloading the install script to a mktemp file first, then executing `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the '--' per instructions. Temp file is cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR (line ~111) and CLAUDE_DIR (line ~140) to $GITHUB_PATH.
3. script-injection (examples/issue-triage.yml): Moved `${{ secrets.GITHUB_TOKEN }}` to env var GITHUB_TOKEN_VALUE and `${{ github.event.issue.number }}` to env var ISSUE_NUMBER; changed heredoc delimiters from 'EOF' to EOF so shell expands the variables. Merged the duplicate env blocks in the Create triage prompt step.
4. unpinned-uses (examples/issue-triage.yml): Replaced `anthropics/claude-code-base-action@beta` with `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

