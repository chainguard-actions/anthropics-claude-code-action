<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.226

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.226** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without downloading to a file first: `curl -fsSL https://claude.ai/install.sh | bash`. This occurs twice — once inside a `timeout ... bash -c "curl ... | bash"` invocation and once as a direct `curl ... | bash` fallback. An attacker who can influence the remote URL or perform a MITM attack could execute arbitrary code on the runner.

Locations:

- `action.yml:153`
- `action.yml:155`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` (via env var `PATH_TO_BUN_EXECUTABLE`) to `$GITHUB_PATH` without sanitization. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from `inputs.path_to_claude_code_executable` (via env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`) to `$GITHUB_PATH` without sanitization. The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH.

Locations:

- `action.yml:168`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run block directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a shell heredoc. GitHub Actions evaluates `${{ }}` expressions before the shell runs, so the token value is substituted directly into the shell command string. Any `${{ }}` expression in a run block is a script-injection risk regardless of the source context.

Locations:

- `examples/issue-triage.yml:38`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run block directly interpolates `${{ github.event.issue.number }}` inside a shell heredoc. GitHub Actions evaluates `${{ }}` expressions before the shell runs, substituting the attacker-controlled issue number directly into the shell command string. A malicious issue number could inject shell metacharacters.

Locations:

- `examples/issue-triage.yml:57`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' uses `anthropics/claude-code-base-action@beta`, which references a mutable tag (`@beta`) instead of a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all 6 findings across action.yml and examples/issue-triage.yml:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash` patterns with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

2. github-env-injection (action.yml line 137 - BUN_DIR): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

3. github-env-injection (action.yml line 168 - CLAUDE_DIR): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

4. script-injection (examples/issue-triage.yml line 38 - GITHUB_TOKEN): Moved `${{ secrets.GITHUB_TOKEN }}` to `env: GH_TOKEN:`, changed heredoc from single-quoted `'EOF'` to unquoted `EOF`, referenced `$GH_TOKEN` in shell.

5. script-injection (examples/issue-triage.yml line 57 - issue.number): Moved `${{ github.event.issue.number }}` to `env: ISSUE_NUMBER:`, merged with existing GITHUB_REPOSITORY env var, changed heredoc to unquoted `EOF`, referenced `${ISSUE_NUMBER}` in shell.

6. unpinned-uses (examples/issue-triage.yml line 97): Pinned `anthropics/claude-code-base-action@beta` to `@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

