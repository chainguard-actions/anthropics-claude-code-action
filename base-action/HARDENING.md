<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.233

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.233** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This appears twice — once inside a `timeout` wrapper and once in the else branch. If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from action inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`; `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is then written directly to `$GITHUB_PATH`. (2) 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`; `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is then written directly to `$GITHUB_PATH`. A caller supplying a newline-containing path could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:131`
- `action.yml:157`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run block in examples/issue-triage.yml directly interpolates the GitHub Actions expression `${{ github.event.issue.number }}` inside a shell heredoc. An attacker who controls the issue number field (e.g. via a crafted event payload) could inject shell metacharacters. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `examples/issue-triage.yml:46`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch/tag ref rather than a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk. It should be pinned to a specific commit SHA (e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`).

Locations:

- `examples/issue-triage.yml:96`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` occurrences (timeout-wrapped and else-branch) with a download-then-execute pattern: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` per instructions (it was the shell's option terminator in the pipe form). Temp file is cleaned up after use.

2. github-env-injection (action.yml): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.

3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` into the step's `env:` block as `ISSUE_NUMBER` and also consolidated `${{ github.repository }}` there as `GITHUB_REPOSITORY`. Changed heredoc delimiter from quoted `'EOF'` to unquoted `EOF` so shell variables expand. Removed the duplicate `env:` block that was at the bottom of the step.

4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34` with `# beta` comment.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/examples/issue-triage.yml at the 'Setup GitHub MCP Server' step. Moved `${{ secrets.GITHUB_TOKEN }}` from inside the heredoc into the step's `env:` block as `GH_TOKEN`. Changed the heredoc delimiter from single-quoted `'EOF'` (which prevents shell variable expansion) to unquoted `EOF` (which allows shell variable expansion), and replaced `"${{ secrets.GITHUB_TOKEN }}"` with `"$GH_TOKEN"` inside the heredoc. This ensures the token is passed via environment variable rather than being interpolated directly into the shell script by GitHub Actions YAML template substitution.

