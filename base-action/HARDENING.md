<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.219** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then used to compute `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:139`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the input `inputs.path_to_claude_code_executable` is mapped to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then used to compute `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, and the result is written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash in two places: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Remote content from claude.ai is fetched and executed without first downloading to a file for inspection or integrity verification. A compromised or man-in-the-middle response could execute arbitrary code on the runner.

Locations:

- `action.yml:159`
- `action.yml:161`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. github-env-injection (Setup Custom Bun Path): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

2. github-env-injection (Install Claude Code): Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

3. unsafe-shell (Install Claude Code): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a safe download-then-execute approach using a mktemp file. The script is downloaded with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` and then executed with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator in the pipe form). The temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} out of the 'Setup GitHub MCP Server' run: heredoc into an env: block as GITHUB_TOKEN_VALUE, changed heredoc delimiter from quoted 'EOF' to unquoted EOF to allow shell variable expansion. (2) Moved ${{ github.event.issue.number }} out of the 'Create triage prompt' run: heredoc into an env: block as ISSUE_NUMBER, consolidated with existing GITHUB_REPOSITORY env var, changed heredoc delimiter from quoted 'EOF' to unquoted EOF. (3) Pinned anthropics/claude-code-base-action@beta to full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with # beta comment for readability.

