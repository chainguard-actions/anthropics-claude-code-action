<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.252

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.252** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes the output of `curl -fsSL https://claude.ai/install.sh` directly to `bash` without first downloading and verifying the script. This occurs twice: once inside a `timeout bash -c "curl ... | bash ..."` wrapper and once as a direct `curl ... | bash` call. If the remote URL is compromised or the connection is intercepted, arbitrary code would execute on the runner.

Locations:

- `action.yml:143`
- `action.yml:145`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run block in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside the shell script body (embedded in a heredoc). GitHub Actions performs template substitution before the shell processes the script, so a maliciously crafted issue number could inject arbitrary shell commands. The offending line is: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:47`

### github-env-injection (severity: high)

Two steps in action.yml write values derived from user-controlled inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step).

1. 'Setup Custom Bun Path' step: `inputs.path_to_bun_executable` is placed in env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH`. An attacker-controlled value containing newlines could inject additional PATH entries.

2. 'Install Claude Code' step: `inputs.path_to_claude_code_executable` is placed in env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:123`
- `action.yml:157`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch/tag ref instead of a pinned 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow file.

Locations:

- `examples/issue-triage.yml:92`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, script-injection, github-env-injection, unpinned-uses

**Notes:**

Fixed all four findings:

1. unsafe-shell: Replaced curl|bash patterns in action.yml's 'Install Claude Code' step with download-then-execute: curl downloads to a mktemp file, then bash executes the file. The '--' was dropped (it was the shell's option terminator). Applies to both the timeout-wrapped and direct curl paths.

2. script-injection: In examples/issue-triage.yml 'Create triage prompt' step, moved ${{ github.event.issue.number }} into the step's env block as ISSUE_NUMBER, changed heredoc from quoted ('EOF') to unquoted (EOF) to allow shell variable expansion, and replaced the inline expression with ${ISSUE_NUMBER}. Removed the duplicate env block that was at the bottom of the step.

3. github-env-injection: In action.yml, sanitized BUN_DIR and CLAUDE_DIR before writing to $GITHUB_PATH using `printf '%s' "$VAR" | tr -d '\n\r'` pattern.

4. unpinned-uses: Pinned anthropics/claude-code-base-action@beta to full SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment.

