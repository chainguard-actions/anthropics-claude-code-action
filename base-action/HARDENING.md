<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.236

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.236** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner.

Locations:

- `action.yml:166`
- `action.yml:168`

### github-env-injection (severity: high)

Two steps write user-controlled input values to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). (1) 'Setup Custom Bun Path': `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to $GITHUB_PATH — a newline in the input could inject additional PATH entries. (2) 'Install Claude Code': `inputs.path_to_claude_code_executable` is mapped to `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to $GITHUB_PATH with the same risk.

Locations:

- `action.yml:144`
- `action.yml:184`

### script-injection (severity: high)

Sub-rule (a): In the 'Create triage prompt' run: block, `${{ github.event.issue.number }}` is directly interpolated into the shell script. Although it appears inside a single-quoted heredoc (`<< 'EOF'`), GitHub Actions evaluates all `${{ }}` expressions before the shell runs, substituting the raw value into the script text. An attacker who can control the issue number field (or if the expression were changed to a more attacker-controlled context) could inject shell commands. The value should be passed via an env: variable instead.

Locations:

- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

The 'Run Claude Code for Issue Triage' step uses `anthropics/claude-code-base-action@beta`, which references a mutable branch name rather than a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks. It should be pinned to a full SHA, e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`.

Locations:

- `examples/issue-triage.yml:102`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` patterns with a two-step approach: download to a mktemp file, then execute the file directly (dropping the '--' shell option terminator as required). Temp file is cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both affected steps.
3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` to the step's `env:` block as `ISSUE_NUMBER`, changed heredoc from `'EOF'` to `EOF` to allow shell variable expansion, and removed the duplicate `env:` block at the bottom of the step.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in examples/issue-triage.yml 'Setup GitHub MCP Server' step: moved ${{ secrets.GITHUB_TOKEN }} out of the run: block into the step's env: mapping as GITHUB_TOKEN. Changed the heredoc delimiter from single-quoted 'EOF' to unquoted EOF so the shell expands $GITHUB_TOKEN. The JSON config now references $GITHUB_TOKEN as a shell variable rather than embedding the raw token value via GitHub Actions template substitution.

