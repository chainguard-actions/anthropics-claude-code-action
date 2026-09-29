<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.215

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.215** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The input is mapped to PATH_TO_BUN_EXECUTABLE via env:, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing a newline-injection attack via a crafted input value.

Locations:

- `action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. The input is mapped to PATH_TO_CLAUDE_CODE_EXECUTABLE via env:, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing a newline-injection attack via a crafted input value.

Locations:

- `action.yml:185`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remotely fetched script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- ...`. This pattern executes whatever the remote server returns without integrity verification. There are two occurrences: one inside a `timeout ... bash -c "curl ... | bash ..."` invocation and one as a direct pipeline.

Locations:

- `action.yml:175`
- `action.yml:177`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. github-env-injection (line 148, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write the sanitized value to $GITHUB_PATH instead of the raw dirname output.

2. unsafe-shell (lines 175, 177, Install Claude Code): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Applied to both the `timeout` variant and the direct pipeline variant. Temp file is cleaned up after use.

3. github-env-injection (line 185, Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write the sanitized value to $GITHUB_PATH instead of the raw dirname output.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three issues in hardened/action/examples/issue-triage.yml: (1) Moved `${{ secrets.GITHUB_TOKEN }}` out of the heredoc in 'Setup GitHub MCP Server' into the step's env block as GITHUB_TOKEN_VALUE, changed heredoc delimiter from quoted 'EOF' to unquoted EOF so shell variables expand; (2) Moved `${{ github.event.issue.number }}` and `${{ github.repository }}` out of the heredoc in 'Create triage prompt' into the step's env block as ISSUE_NUMBER and GITHUB_REPOSITORY respectively, changed heredoc delimiter from quoted 'EOF' to unquoted EOF, and removed the duplicate trailing env block; (3) Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with a `# beta` comment.

