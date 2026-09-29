<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.213** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of curl directly to bash without first saving the script to a file. This means the remote script is executed immediately without any opportunity to inspect or verify it. Two occurrences: (1) inside a timeout wrapper: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:155`
- `action.yml:157`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

(1) 'Setup Custom Bun Path' step: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"`, where PATH_TO_BUN_EXECUTABLE comes from `inputs.path_to_bun_executable`. A newline in the input could inject arbitrary entries into PATH.

(2) 'Install Claude Code' step: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`, where PATH_TO_CLAUDE_CODE_EXECUTABLE comes from `inputs.path_to_claude_code_executable`. Same injection risk.

Locations:

- `action.yml:153`
- `action.yml:178`

### script-injection (severity: high)

Sub-rule (a): In the 'Create triage prompt' run: block, the GitHub Actions expression `${{ github.event.issue.number }}` is interpolated directly into the shell script. Although the heredoc uses a single-quoted delimiter (`<< 'EOF'`), GitHub Actions expands `${{ }}` expressions before the shell ever sees the script. An attacker who can control the issue number field (e.g. via a crafted API call) could inject arbitrary shell commands into the prompt file creation step. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:52`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) instead of a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed 4 findings across 2 files:

1. **unsafe-shell** (action.yml): Replaced both `curl | bash -s -- $VERSION` patterns with a safe two-step approach: download to a temp file with `curl -fsSL ... -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

2. **github-env-injection** (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing user-controlled paths to `$GITHUB_PATH` in both the 'Setup Custom Bun Path' step and the 'Install Claude Code' else branch.

3. **script-injection** (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` and `${{ github.repository }}` into the step's `env:` block as `ISSUE_NUMBER` and `GITHUB_REPOSITORY`. Changed heredoc delimiter from `'EOF'` to `EOF` so shell variables expand correctly. Removed the duplicate trailing `env:` block.

4. **unpinned-uses** (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In 'examples/issue-triage.yml', moved `${{ secrets.GITHUB_TOKEN }}` out of the heredoc in the 'Setup GitHub MCP Server' run: block into the step's env: block as `GITHUB_TOKEN_VALUE: ${{ secrets.GITHUB_TOKEN }}`. Changed the heredoc delimiter from `'EOF'` (single-quoted, no shell expansion) to `EOF` (unquoted, allows shell variable expansion) so the shell can expand `$GITHUB_TOKEN_VALUE`. The JSON now references `"$GITHUB_TOKEN_VALUE"` as a plain environment variable, eliminating the script-injection risk.

