<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.253

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.253** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` using a mutable branch name (`beta`) instead of a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:97`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of a remote URL directly to bash twice: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. If the remote server is compromised or the URL is hijacked, arbitrary code will execute on the runner without any integrity verification.

Locations:

- `action.yml:163`
- `action.yml:165`

### github-env-injection (severity: high)

Two steps write values derived from action inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`): (1) 'Setup Custom Bun Path' writes `$BUN_DIR` (computed via `dirname "$PATH_TO_BUN_EXECUTABLE"`, where PATH_TO_BUN_EXECUTABLE comes from `inputs.path_to_bun_executable`) to $GITHUB_PATH. (2) 'Install Claude Code' writes `$CLAUDE_DIR` (computed via `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"`, where PATH_TO_CLAUDE_CODE_EXECUTABLE comes from `inputs.path_to_claude_code_executable`) to $GITHUB_PATH. An attacker-controlled input containing newline characters could inject additional entries into PATH, enabling path-hijacking attacks.

Locations:

- `action.yml:148`
- `action.yml:185`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings in hardened/action/:

1. **unpinned-uses** (examples/issue-triage.yml line 97): Pinned `anthropics/claude-code-base-action@beta` to full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

2. **unsafe-shell** (action.yml lines 163, 165): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a two-step approach: download the script to a temp file with `mktemp`, then execute it separately with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` separator (it was the shell's option terminator in the pipe form, not the script's argument). Added cleanup of the temp file after use.

3. **github-env-injection** (action.yml lines 148, 185): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing `$BUN_DIR` and `$CLAUDE_DIR` to `$GITHUB_PATH`, preventing newline injection attacks via attacker-controlled input values.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script injection issues in examples/issue-triage.yml:
1. 'Setup GitHub MCP Server' step (line 38): Moved `${{ secrets.GITHUB_TOKEN }}` into an `env:` block as `GITHUB_TOKEN_VALUE`, changed heredoc from `<< 'EOF'` to `<< EOF` (unquoted to allow shell variable expansion), and replaced the inline expression with `$GITHUB_TOKEN_VALUE`.
2. 'Create triage prompt' step (line 57): Moved `${{ github.event.issue.number }}` into the `env:` block as `ISSUE_NUMBER`, merged with the existing `GITHUB_REPOSITORY` env var (removing the duplicate `env:` block at the bottom of the step), changed heredoc to unquoted `<< EOF`, replaced the inline expression with `$ISSUE_NUMBER`, and escaped the backtick in the prompt text (`\`gh label list\``) to prevent unintended command substitution in the now-unquoted heredoc.

