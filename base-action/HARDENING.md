<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.221

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.221** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification. The script is fetched and executed in a single pipeline, making it vulnerable to supply-chain attacks or MITM. This pattern appears twice (once inside a `timeout` wrapper and once in the else branch).

Locations:

- `action.yml:152`
- `action.yml:155`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline-containing input value could inject arbitrary entries into PATH. The required sanitization (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:133`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline-containing input value could inject arbitrary entries into PATH. The required sanitization (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:165`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run block in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside a shell heredoc. An attacker who controls the issue number field (e.g., via a crafted GitHub event) could inject shell metacharacters. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:47`

### script-injection (severity: high)

Sub-rule (a): The 'Setup GitHub MCP Server' run block in examples/issue-triage.yml directly interpolates `${{ secrets.GITHUB_TOKEN }}` inside a shell heredoc that writes a JSON config file. Any `${{ ... }}` expression inside a run: block is a script-injection risk as the value is substituted by the YAML template engine before the shell sees it. The offending line is: `"GITHUB_PERSONAL_ACCESS_TOKEN": "${{ secrets.GITHUB_TOKEN }}"`

Locations:

- `examples/issue-triage.yml:27`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) rather than a full 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks.

Locations:

- `examples/issue-triage.yml:73`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all 6 findings across action.yml and examples/issue-triage.yml:

1. unsafe-shell (action.yml): Both curl|bash patterns replaced with download-then-execute approach using mktemp. The '--' separator was dropped per rules (it was the shell's option terminator, not the script's). Applied to both the timeout branch and the else branch.

2. github-env-injection (action.yml line 133): BUN_DIR sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

3. github-env-injection (action.yml line 165): CLAUDE_DIR sanitized with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

4. script-injection (issue-triage.yml line 27): ${{ secrets.GITHUB_TOKEN }} moved to env block as GITHUB_TOKEN_VALUE; heredoc changed from 'EOF' to EOF to allow shell variable expansion.

5. script-injection (issue-triage.yml line 47): ${{ github.event.issue.number }} moved to env block as ISSUE_NUMBER; merged with existing GITHUB_REPOSITORY env var; heredoc changed from 'EOF' to EOF; backtick in prompt text escaped.

6. unpinned-uses (issue-triage.yml line 73): anthropics/claude-code-base-action@beta pinned to SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment.

