<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.227

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.227** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The value flows: inputs.path_to_bun_executable → env var PATH_TO_BUN_EXECUTABLE → BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") → echo "$BUN_DIR" >> "$GITHUB_PATH". An attacker-controlled input containing newlines could inject additional entries into $GITHUB_PATH. The required sanitization (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent before the write.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The value flows: inputs.path_to_claude_code_executable → env var PATH_TO_CLAUDE_CODE_EXECUTABLE → CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") → echo "$CLAUDE_DIR" >> "$GITHUB_PATH". An attacker-controlled input containing newlines could inject additional entries into $GITHUB_PATH. The required sanitization (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent before the write.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs in two branches: once inside a `timeout ... bash -c "curl ... | bash ..."` wrapper (line 156) and once in the plain else branch (line 158). If the remote URL is compromised or subject to a MITM attack, arbitrary code will execute on the runner.

Locations:

- `action.yml:156`
- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. github-env-injection (Setup Custom Bun Path, line 136): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe_bun_dir` to $GITHUB_PATH instead of the raw `$BUN_DIR`.

2. github-env-injection (Install Claude Code, line 174): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write `$safe_claude_dir` to $GITHUB_PATH instead of the raw `$CLAUDE_DIR`.

3. unsafe-shell (Install Claude Code, lines 156/158): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach: download to a mktemp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not an argument to the install script). The temp file is cleaned up after the loop.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three issues in hardened/action/examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} from the 'Setup GitHub MCP Server' run: heredoc into an env: block as GITHUB_TOKEN_VALUE, changed heredoc delimiter from single-quoted 'EOF' to unquoted EOF so the shell variable expands correctly. (2) Moved ${{ github.event.issue.number }} from the 'Create triage prompt' run: heredoc into an env: block as ISSUE_NUMBER, referenced as ${ISSUE_NUMBER} in the script, changed heredoc delimiter to unquoted EOF, and escaped the backtick in the prompt text. (3) Pinned anthropics/claude-code-base-action@beta to full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with a # beta comment.

