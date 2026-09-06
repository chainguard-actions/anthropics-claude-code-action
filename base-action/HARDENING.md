<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.217

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.217** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE (sourced from inputs.path_to_bun_executable) is used to compute BUN_DIR, which is then written directly to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

Offending line: `echo "$BUN_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:134`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the env var PATH_TO_CLAUDE_CODE_EXECUTABLE (sourced from inputs.path_to_claude_code_executable) is used to compute CLAUDE_DIR, which is then written directly to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into PATH.

Offending line: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:173`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of curl directly to bash in two places, executing remotely-fetched content without first saving it to a file for inspection:
1. `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`
2. `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`
If the remote URL is compromised or redirected, arbitrary code will execute on the runner.

Locations:

- `action.yml:154`
- `action.yml:156`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates a ${{ secrets.GITHUB_TOKEN }} expression inside a shell heredoc. GitHub Actions template substitution occurs before the shell executes the script, so the token value is substituted literally into the shell command string. Even though secrets.GITHUB_TOKEN is not attacker-controlled, any ${{ }} expression inside a run: block is a script-injection risk.

Offending line: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"`

Locations:

- `examples/issue-triage.yml:35`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block directly interpolates ${{ github.event.issue.number }} inside a shell heredoc. Although the heredoc delimiter is single-quoted ('EOF'), GitHub Actions template substitution happens before the shell sees the script, so the attacker-controlled issue number is substituted directly into the shell command string. A malicious issue number could break out of the heredoc context and inject shell commands.

Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:49`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name ('beta') as the ref instead of a full 40-character commit SHA. This means the action code can change at any time without notice, creating a supply-chain risk.

Failing reference: `uses: anthropics/claude-code-base-action@beta`

Locations:

- `examples/issue-triage.yml:96`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, unpinned-uses

**Notes:**

Fixed all 6 findings across action.yml and examples/issue-triage.yml:

1. action.yml - Setup Custom Bun Path (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

2. action.yml - Install Claude Code (github-env-injection): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. action.yml - Install Claude Code (unsafe-shell): Replaced both `curl ... | bash -s -- $VERSION` patterns with download-then-execute using a temp file (`mktemp`). Dropped the `--` shell option terminator (not the script's argument) so the version is correctly passed as $1 to the installer.

4. examples/issue-triage.yml - Setup GitHub MCP Server (script-injection): Moved `secrets.GITHUB_TOKEN` to the step's `env:` block as `GITHUB_TOKEN_VALUE`, wrote a placeholder in the heredoc, then used `jq --arg token` to safely inject the secret into the JSON file.

5. examples/issue-triage.yml - Create triage prompt (script-injection): Moved `github.event.issue.number` and `github.repository` to the step's `env:` block, changed heredoc delimiter from `'EOF'` to `EOF` to allow env var expansion, referenced values as `${ISSUE_NUMBER}` and `${GITHUB_REPOSITORY}`. Removed duplicate trailing `env:` block.

6. examples/issue-triage.yml - Run Claude Code for Issue Triage (unpinned-uses): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

