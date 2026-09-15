<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.224

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.224** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. An attacker who can intercept or tamper with the remote URL (e.g. via DNS poisoning or a compromised CDN) can execute arbitrary code on the runner.

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`), enabling newline injection attacks that could add attacker-controlled entries to the runner's PATH.

(1) 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` unsanitized. A newline embedded in the input value would inject an extra line into GITHUB_PATH.

(2) 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` unsanitized. Same injection risk applies.

Locations:

- `action.yml:136`
- `action.yml:173`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security issues in hardened/action/action.yml:

1. unsafe-shell (lines 156, 158): The 'Install Claude Code' step previously piped the remote install script directly to bash (`curl ... | bash -s -- $VERSION`). Fixed by downloading the script to a temp file with `mktemp`, then executing it separately (`bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`). The `--` was dropped as it was the shell's stdin-mode option terminator, not a script argument. The temp file is cleaned up after use (both on success and failure).

2. github-env-injection (lines 136, 173): Two locations where user-input-derived directory paths were written to $GITHUB_PATH without sanitization:
   - 'Setup Custom Bun Path': Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.
   - 'Install Claude Code' (custom executable branch): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three findings in examples/issue-triage.yml: (1) Moved ${{ secrets.GITHUB_TOKEN }} from inside the JSON heredoc body to the step's env: block as GITHUB_PERSONAL_ACCESS_TOKEN, and removed the now-redundant 'env' object from the JSON config (the docker -e flag already passes the env var to the container). (2) Replaced ${{ github.event.issue.number }} inside the heredoc with ${ISSUE_NUMBER} shell variable, added ISSUE_NUMBER to the step's env: block, and changed the heredoc delimiter from single-quoted 'EOF' to unquoted EOF so the shell variable expands correctly at runtime. (3) Pinned anthropics/claude-code-base-action@beta to full commit SHA e8132bc5e637a42c27763fc757faa37e1ee43b34 with a # beta comment.

