<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.216

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.216** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice — once inside a `bash -c` string passed to `timeout`, and once in the else branch. An attacker who can intercept or tamper with the remote URL could execute arbitrary code on the runner.

Locations:

- `action.yml:155`
- `action.yml:157`

### script-injection (severity: high)

Two run: blocks in examples/issue-triage.yml directly interpolate ${{ }} expressions into shell script text before the shell executes it, enabling script injection. (a) The 'Setup GitHub MCP Server' step embeds `${{ secrets.GITHUB_TOKEN }}` directly inside a heredoc in a run: block (line 38). (b) The 'Create triage prompt' step embeds `${{ github.event.issue.number }}` directly inside a heredoc in a run: block (line 55) — an attacker who can control the issue number field could inject shell metacharacters. Both violate rule (a): any ${{ ... }} expression directly inside a run: shell command string is a script-injection risk.

Locations:

- `examples/issue-triage.yml:38`
- `examples/issue-triage.yml:55`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, computes BUN_DIR via `dirname`, and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject additional entries into PATH. (2) The 'Install Claude Code' step similarly sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable`, computes CLAUDE_DIR via `dirname`, and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:131`
- `action.yml:170`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` using a mutable branch name (`beta`) instead of a full 40-character commit SHA. This means the action could silently change to a different (potentially malicious) version on any future run without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:91`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, script-injection, github-env-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl | bash` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.
2. script-injection (examples/issue-triage.yml): (a) Moved `${{ secrets.GITHUB_TOKEN }}` to env: block as GITHUB_TOKEN_VALUE, wrote JSON with placeholder, then patched with `jq --arg` to safely inject the token. (b) Moved `${{ github.event.issue.number }}` to env: block as ISSUE_NUMBER, wrote prompt with placeholder, then substituted with `sed` after sanitizing with `tr -d '\n\r'`.
3. github-env-injection (action.yml): Sanitized BUN_DIR and CLAUDE_DIR with `printf '%s' "$VAR" | tr -d '\n\r'` before writing to $GITHUB_PATH.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

