<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.223

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.223** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns, making the action vulnerable to supply-chain attacks if the remote URL is compromised. The pattern appears twice — once inside a `timeout` wrapper and once in the else branch.

Locations:

- `action.yml:148`
- `action.yml:151`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` comes from `inputs.path_to_bun_executable`; the script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — an attacker-supplied newline in the input can inject arbitrary entries into PATH. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` comes from `inputs.path_to_claude_code_executable`; similarly `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:133`
- `action.yml:163`

### script-injection (severity: high)

Two `run:` blocks in examples/issue-triage.yml interpolate GitHub Actions expressions directly into shell command strings. GitHub Actions template substitution (`${{ }}`) occurs before the shell executes, so even content inside a heredoc is expanded by the runner. (a) 'Setup GitHub MCP Server' step: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"` is interpolated directly into the shell script. (b) 'Create triage prompt' step: `- ISSUE_NUMBER: ${{ github.event.issue.number }}` is interpolated directly into the shell script — an issue number is normally numeric but the pattern is still a direct expression interpolation in a run: block.

Locations:

- `examples/issue-triage.yml:33`
- `examples/issue-triage.yml:48`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) rather than a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl | bash -s -- $VERSION` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator, not the script's). Applied to both the timeout branch and the plain else branch.
2. github-env-injection (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both affected steps.
3. script-injection (examples/issue-triage.yml): Moved `${{ secrets.GITHUB_TOKEN }}` and `${{ github.event.issue.number }}` out of run: blocks into step-level env: blocks, changed heredoc delimiters from quoted 'EOF' to unquoted EOF so shell variables expand, and referenced the values via plain env vars ($GITHUB_TOKEN_VALUE, $ISSUE_NUMBER).
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

