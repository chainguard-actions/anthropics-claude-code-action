<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.226

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.226** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice — once inside a `timeout` wrapper and once in the `else` branch. If the remote URL is compromised or redirected, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:157`
- `action.yml:159`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from `${{ inputs.path_to_bun_executable }}`, then BUN_DIR is computed via `dirname`, and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection to add arbitrary entries to PATH.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from `${{ inputs.path_to_claude_code_executable }}`, then CLAUDE_DIR is computed via `dirname`, and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection to add arbitrary entries to PATH.

Locations:

- `action.yml:168`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' step in examples/issue-triage.yml directly interpolates `${{ github.event.issue.number }}` inside a `run:` shell script. GitHub Actions substitutes `${{ }}` expressions into the script text before the shell executes it — even inside a single-quoted heredoc (`<< 'EOF'`). An attacker who can control the issue number field (e.g., via a crafted API call or event) could inject shell metacharacters. The offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`.

Locations:

- `examples/issue-triage.yml:50`

### unpinned-uses (severity: high)

The step `uses: anthropics/claude-code-base-action@beta` in examples/issue-triage.yml references a mutable branch name (`beta`) rather than a full 40-character commit SHA. This means the action can be silently updated to a different (potentially malicious) version without any change to the workflow file, creating a supply-chain risk.

Locations:

- `examples/issue-triage.yml:97`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed 5 findings across 2 files:

1. **unsafe-shell** (action.yml): Replaced both `curl | bash -s -- $VERSION` patterns (in the `timeout` branch and `else` branch) with download-then-execute: `curl ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped as it was the shell's option terminator, not the script's. Temp file is cleaned up after use.

2. **github-env-injection** (action.yml, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. **github-env-injection** (action.yml, Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. **script-injection** (examples/issue-triage.yml): Moved `${{ github.event.issue.number }}` to the step's `env:` block as `ISSUE_NUMBER`. Changed heredoc from `<< 'EOF'` to `<< EOF` so `${ISSUE_NUMBER}` expands via the shell. Consolidated `GITHUB_REPOSITORY` into the same `env:` block.

5. **unpinned-uses** (examples/issue-triage.yml): Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

