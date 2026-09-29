<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.219** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps inputs.path_to_bun_executable into the PATH_TO_BUN_EXECUTABLE env var, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps inputs.path_to_claude_code_executable into the PATH_TO_CLAUDE_CODE_EXECUTABLE env var, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner without any integrity verification. The script should be downloaded to a file, its checksum verified, and then executed separately.

Locations:

- `action.yml:163`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run: block directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a shell heredoc. Any ${{ ... }} expression inside a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. Offending line: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"`

Locations:

- `examples/issue-triage.yml:28`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block directly interpolates `${{ github.event.issue.number }}` inside a shell heredoc. github.event.issue.number is attacker-controlled (any external user can open an issue). YAML template substitution injects this value into the shell command before quoting, enabling script injection. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

The 'Run Claude Code for Issue Triage' step references `anthropics/claude-code-base-action@beta`, which is a mutable branch ref. If the branch is updated or compromised, the action will silently run different code on the next workflow execution. It must be pinned to a full 40-character commit SHA (e.g., anthropics/claude-code-base-action@<sha> # beta).

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, unpinned-uses

**Notes:**

Fixed all 6 findings across action.yml and examples/issue-triage.yml:
1. action.yml Setup Custom Bun Path: Added printf/tr sanitization before writing BUN_DIR to GITHUB_PATH
2. action.yml Install Claude Code: Added printf/tr sanitization before writing CLAUDE_DIR to GITHUB_PATH
3. action.yml Install Claude Code: Replaced curl|bash pipe with download-to-tempfile then execute pattern; dropped the '--' shell option terminator as required; temp file cleaned up after use
4. examples/issue-triage.yml Setup GitHub MCP Server: Moved ${{ secrets.GITHUB_TOKEN }} to env var GITHUB_TOKEN_VALUE, used jq --arg to safely inject token into JSON config
5. examples/issue-triage.yml Create triage prompt: Moved ${{ github.event.issue.number }} and ${{ github.repository }} to env block, changed quoted heredoc to unquoted so shell vars expand, removed duplicate env block
6. examples/issue-triage.yml Run Claude Code for Issue Triage: Pinned anthropics/claude-code-base-action@beta to full SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta

