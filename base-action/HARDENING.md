<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.241

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.241** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash`. This appears twice — once inside `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and once in the else branch `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote server is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `action.yml:145`
- `action.yml:147`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the user-controlled input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:129`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the user-controlled input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:159`

### script-injection (severity: high)

Sub-rule (a): The 'Create triage prompt' step directly interpolates `${{ github.event.issue.number }}` inside a `run:` shell heredoc. Although the heredoc delimiter is single-quoted (`'EOF'`), GitHub Actions template expressions (`${{ ... }}`) are substituted by the Actions runner before the shell executes the script. An attacker who can craft a malicious issue number value could inject arbitrary shell commands into the script. Offending line: `- ISSUE_NUMBER: ${{ github.event.issue.number }}`

Locations:

- `examples/issue-triage.yml:38`

### unpinned-uses (severity: high)

The step 'Run Claude Code for Issue Triage' uses `anthropics/claude-code-base-action@beta`, which references a mutable branch name (`beta`) rather than a full 40-character SHA commit hash. This is a supply-chain risk: if the `beta` branch is compromised or updated with malicious code, all workflows using this reference will automatically execute the new code.

Locations:

- `examples/issue-triage.yml:73`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection, script-injection, unpinned-uses

**Notes:**

Fixed 5 findings across 2 files:

1. action.yml unsafe-shell: Replaced both `curl | bash` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" $CLAUDE_CODE_VERSION`. The `--` was dropped (it was the shell's option terminator, not the script's). Temp file is cleaned up after use.

2. action.yml github-env-injection (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. action.yml github-env-injection (Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. examples/issue-triage.yml script-injection: Moved `${{ github.event.issue.number }}` into the step's `env:` block as `ISSUE_NUMBER`, changed heredoc delimiter from `'EOF'` to `EOF` (to allow shell variable expansion), and replaced the expression with `${ISSUE_NUMBER}`. Merged with existing `GITHUB_REPOSITORY` env var.

5. examples/issue-triage.yml unpinned-uses: Pinned `anthropics/claude-code-base-action@beta` to full SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

