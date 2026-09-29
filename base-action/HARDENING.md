<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.216

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.216** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This allows a compromised or malicious remote server to execute arbitrary code on the runner. The script should be downloaded to a file, inspected/verified, and then executed separately.

Locations:

- `action.yml:163`

### github-env-injection (severity: high)

Two steps write values derived from untrusted action inputs to $GITHUB_PATH without the required sanitization (`printf '%s' ... | tr -d '\n\r'`).

(1) 'Setup Custom Bun Path': `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` then `echo "$BUN_DIR" >> "$GITHUB_PATH"` — `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, which is caller-controlled. A newline in the input could inject an arbitrary entry into PATH.

(2) 'Install Claude Code': `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` then `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, which is caller-controlled. Same injection risk.

Locations:

- `action.yml:148`
- `action.yml:183`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' run: block in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` into the shell script text. GitHub Actions performs template substitution before the shell executes, so even though the value is inside a quoted heredoc (`<< 'EOF'`), the expression is expanded by the Actions runner into raw shell text before the shell sees it. An attacker who controls the issue number field (e.g. via a crafted issue) could inject shell metacharacters. The value should be passed via an env: variable and referenced as `$ISSUE_NUMBER` inside the heredoc instead.

Locations:

- `examples/issue-triage.yml:55`

### unpinned-uses (severity: high)

examples/issue-triage.yml references `anthropics/claude-code-base-action@beta`, which uses a mutable branch name (`beta`) as the ref instead of a full 40-character commit SHA. This means the action code can change at any time without notice, enabling supply-chain attacks. It should be pinned to a specific commit SHA (e.g. `anthropics/claude-code-base-action@<40-char-sha> # beta`).

Locations:

- `examples/issue-triage.yml:100`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed all four findings:
1. unsafe-shell (action.yml): Replaced `curl | bash` with download-then-execute pattern using mktemp. Dropped the '--' separator (was the shell's option terminator, not the script's). Temp file cleaned up after use.
2. github-env-injection (action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR and CLAUDE_DIR to $GITHUB_PATH in both affected steps.
3. script-injection (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` into the step's env: block as ISSUE_NUMBER, referenced as ${ISSUE_NUMBER} in the heredoc. Removed duplicate env: block at bottom of step.
4. unpinned-uses (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

