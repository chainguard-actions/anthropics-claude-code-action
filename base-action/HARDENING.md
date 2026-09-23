<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.230

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.230** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without downloading it first. Two occurrences: (1) inside a `timeout` wrapper: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`, and (2) in the else branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner.

Locations:

- `action.yml:178`
- `action.yml:180`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"` — PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. (2) 'Install Claude Code': `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable. An attacker-controlled newline in these inputs can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:157`
- `action.yml:200`

### script-injection (severity: high)

Sub-rule (a): In examples/issue-triage.yml, the 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` inside a heredoc shell command. This expression is substituted by the Actions template engine before the shell sees it, allowing an attacker to inject shell metacharacters via a crafted issue number. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:37`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta` — a mutable branch/tag ref rather than a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks.

Locations:

- `examples/issue-triage.yml:93`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl | bash` pipe patterns with a safe download-then-execute approach. The install script is downloaded to a mktemp file and executed separately as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Temp file is cleaned up after use.

2. github-env-injection (action.yml): Both 'Setup Custom Bun Path' and 'Install Claude Code' steps now sanitize user-controlled path values before writing to $GITHUB_PATH using `printf '%s' "$VAR" | tr -d '\n\r'`.

3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` from the heredoc body into the step's `env:` block as `ISSUE_NUMBER`. Changed the heredoc delimiter from quoted `'EOF'` to unquoted `EOF` so the shell expands `${ISSUE_NUMBER}` from the environment. Merged the existing `GITHUB_REPOSITORY` env var into the same `env:` block.

4. unpinned-uses (examples/issue-triage.yml): Replaced `anthropics/claude-code-base-action@beta` with the pinned SHA `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

