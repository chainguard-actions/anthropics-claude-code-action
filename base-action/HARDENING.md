<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ }} expressions are directly interpolated inside run: shell command strings. GitHub Actions performs template substitution before the shell executes the script, so even a single-quoted heredoc delimiter ('EOF') does not prevent injection. (1) In the 'Setup GitHub MCP Server' step, `${{ secrets.GITHUB_TOKEN }}` is substituted directly into the shell script text. (2) In the 'Create triage prompt' step, `${{ github.event.issue.number }}` — an attacker-controlled value from the issue event — is substituted directly into the shell script text. Both values should be passed via env: variables and referenced as shell variables instead.

Locations:

- `examples/issue-triage.yml:38`
- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' uses `anthropics/claude-code-base-action@beta`, which is a mutable branch reference rather than a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks. It should be pinned to a full SHA, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:96`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash`. This pattern executes whatever the remote server returns without integrity verification. The script should be downloaded to a file, inspected/verified, and then executed separately. There are two occurrences: one inside a `timeout` wrapper and one in the else branch.

Locations:

- `action.yml:143`
- `action.yml:145`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — an attacker-controlled path can inject newlines to add arbitrary entries to PATH. (2) The 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable`, computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — same vulnerability. Both writes must be preceded by sanitization.

Locations:

- `action.yml:120`
- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, unsafe-shell, github-env-injection

**Notes:**

Fixed all 4 findings across action.yml and examples/issue-triage.yml:

1. script-injection (issue-triage.yml line 38): Moved `${{ secrets.GITHUB_TOKEN }}` to env: block as GITHUB_TOKEN_VALUE; changed heredoc from 'EOF' to EOF so shell variable expands.

2. script-injection (issue-triage.yml line 55): Moved `${{ github.event.issue.number }}` to env: block as ISSUE_NUMBER; removed duplicate env: block at bottom of step; changed heredoc from 'EOF' to EOF.

3. unpinned-uses (issue-triage.yml line 96): Pinned `anthropics/claude-code-base-action@beta` to full SHA `@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

4. unsafe-shell (action.yml lines 143, 145): Replaced both `curl | bash` patterns with download-to-tmpfile then execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the shell's `-s` and `--` options since the script is no longer read from stdin.

5. github-env-injection (action.yml lines 120, 158): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH.

