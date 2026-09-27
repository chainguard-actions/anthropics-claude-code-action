<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.168

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.168** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of `curl` directly to `bash` without first saving the script to a file. This occurs twice: (1) inside a `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` invocation, and (2) as a direct `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner.

Locations:

- `action.yml:163`
- `action.yml:166`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) 'Setup Custom Bun Path': `inputs.path_to_bun_executable` is placed in env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` — a newline in the input could inject arbitrary entries into PATH. (2) 'Install Claude Code': `inputs.path_to_claude_code_executable` is placed in `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` with the same vulnerability.

Locations:

- `action.yml:137`
- `action.yml:178`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates the GitHub Actions expression `${{ github.event.issue.number }}` inside the shell command string (embedded in a heredoc). This value is attacker-controlled (an issue opener can set the issue number context) and flows through YAML template substitution before the shell processes it, enabling script injection. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:40`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch/tag ref (`beta`) instead of a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced both `curl ... | bash -s -- $VERSION` invocations with a two-step approach: download to a temp file via `mktemp`, then execute the file. Dropped the `--` (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both the 'Setup Custom Bun Path' and 'Install Claude Code' steps.
3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` to the step's `env:` block as `ISSUE_NUMBER`, changed heredoc from quoted ('EOF') to unquoted (EOF) so shell variables expand, consolidated GITHUB_REPOSITORY into the same env block, and escaped the backtick in the heredoc body.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

