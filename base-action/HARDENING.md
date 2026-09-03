<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.212

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.212** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of curl directly to bash in two places, without first downloading the script to a file for inspection. This allows a compromised or malicious remote server to execute arbitrary code on the runner. Offending lines: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:168`
- `action.yml:170`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, computes BUN_DIR via `dirname`, and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject additional PATH entries. (2) The 'Install Claude Code' step similarly sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable`, computes CLAUDE_DIR, and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization.

Locations:

- `action.yml:148`
- `action.yml:183`

### script-injection (severity: high)

The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates the GitHub Actions expression `${{ github.event.issue.number }}` inside a shell heredoc. This violates sub-rule (a): any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. An attacker who can control the issue number field (e.g., via a crafted API call) could inject shell metacharacters. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:47`

### unpinned-uses (severity: high)

The file examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action can be silently updated (or compromised) without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:93`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` patterns with download-to-tempfile then execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the '--' separator (it was the shell's option terminator in the pipe form, not an argument to the install script). Temp file is cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.

3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` out of the run: heredoc and into the step's `env:` block as `ISSUE_NUMBER`. Changed heredoc delimiter from quoted `'EOF'` to unquoted `EOF` so the shell variable `${ISSUE_NUMBER}` expands. Removed the duplicate `env:` block that was at the bottom of the step.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in 'Setup GitHub MCP Server' step of examples/issue-triage.yml. Moved `${{ secrets.GITHUB_TOKEN }}` from inside the heredoc in the run: block to the step's env: block as `GITHUB_TOKEN_VALUE`. Changed the heredoc delimiter from single-quoted `'EOF'` to unquoted `EOF` so the shell can expand `$GITHUB_TOKEN_VALUE`. This prevents GitHub Actions template substitution from embedding the token value literally into the shell script text at the YAML level before the shell executes.

