<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.248

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.248** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading it to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs in two branches of the same conditional (with and without `timeout`). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

(1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject additional PATH entries.

(2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`. The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — same injection risk.

Locations:

- `action.yml:133`
- `action.yml:163`

### script-injection (severity: high)

Sub-rule (a): In examples/issue-triage.yml, the 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` inside the shell script. Although the heredoc uses a single-quoted delimiter ('EOF') to prevent shell expansion, GitHub Actions template expressions (`${{ ... }}`) are resolved by the Actions runner before the shell ever sees the script. An attacker who can control the issue number field (or craft a malicious issue) could inject arbitrary shell commands into the runner.

Locations:

- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch/tag reference rather than a pinned 40-character commit SHA. A supply-chain attacker who pushes a new commit to the `beta` branch could cause this workflow to execute malicious code.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns (with and without timeout) with a download-then-execute approach: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` as required (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

2. github-env-injection (action.yml): Sanitized both GITHUB_PATH writes using `printf '%s' "$VAR" | tr -d '\n\r'` before writing to $GITHUB_PATH — in 'Setup Custom Bun Path' (BUN_DIR) and 'Install Claude Code' (CLAUDE_DIR).

3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` from the run: block into the step's env: block as `ISSUE_NUMBER`, then referenced it as `${ISSUE_NUMBER}` in the heredoc body. The heredoc's single-quoted delimiter prevents shell expansion, but GitHub Actions template expressions are resolved by the runner before the shell sees the script.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to the resolved commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with a `# beta` comment for readability.

