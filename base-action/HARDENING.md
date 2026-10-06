<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.242

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.242** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a second occurrence inside a `timeout bash -c "..."` wrapper). This allows a compromised or malicious install.sh to execute arbitrary code on the runner.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an attacker-controlled value to $GITHUB_PATH without sanitization. `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to $GITHUB_PATH. A newline-containing input value could inject arbitrary entries into PATH for subsequent steps. The required `printf '%s' ... | tr -d '\n\r'` sanitization is absent.

Locations:

- `action.yml:128`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes an attacker-controlled value to $GITHUB_PATH without sanitization. `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to $GITHUB_PATH. A newline-containing input value could inject arbitrary entries into PATH for subsequent steps. The required `printf '%s' ... | tr -d '\n\r'` sanitization is absent.

Locations:

- `action.yml:163`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside the shell script. GitHub Actions performs template substitution before the shell executes, so even inside a single-quoted heredoc delimiter, the expression is expanded into the script text. An attacker who controls the issue number field (e.g. via a crafted API call) could inject shell metacharacters. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which is a mutable branch/tag ref rather than a pinned 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed 5 findings across 2 files:

1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` occurrences (direct form and timeout wrapper) with a safe download-then-execute pattern using a mktemp file. The '--' was dropped as it was the shell's option terminator, not the script's argument.

2. github-env-injection (action.yml line 128): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH in the Setup Custom Bun Path step.

3. github-env-injection (action.yml line 163): Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing CLAUDE_DIR to $GITHUB_PATH in the Install Claude Code step.

4. script-injection (examples/issue-triage.yml line 50): Moved `${{ github.event.issue.number }}` to the step's env block as ISSUE_NUMBER, changed heredoc from single-quoted 'EOF' to unquoted EOF to allow shell variable expansion, and merged GITHUB_REPOSITORY into the same env block.

5. unpinned-uses (examples/issue-triage.yml line 97): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

