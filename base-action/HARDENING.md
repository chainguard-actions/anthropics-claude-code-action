<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.215

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.215** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or redirected, arbitrary code executes on the runner immediately.

Locations:

- `action.yml:156`
- `action.yml:158`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE holds the input value; BUN_DIR is computed from it via `dirname`, then written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled newline in the input could inject additional entries into GITHUB_PATH. The required sanitization (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE holds the input value; CLAUDE_DIR is computed from it via `dirname`, then written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled newline in the input could inject additional entries into GITHUB_PATH. The required sanitization (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:174`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings in hardened/action/action.yml:

1. unsafe-shell (Install Claude Code step, lines 156 & 158): Replaced both `curl ... | bash -s -- $VERSION` patterns with a safe two-step approach: download the install script to a temp file with `mktemp`, then execute it directly with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` separator was dropped (it was the shell's option terminator in the pipe form, not an argument to the installer script). The temp file is cleaned up after use.

2. github-env-injection (Setup Custom Bun Path step, line 136): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe_bun_dir` to GITHUB_PATH instead of the raw `$BUN_DIR`.

3. github-env-injection (Install Claude Code step, line 174): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write `$safe_claude_dir` to GITHUB_PATH instead of the raw `$CLAUDE_DIR`.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed two findings in hardened/action/examples/issue-triage.yml: (1) script-injection: Moved `${{ github.event.issue.number }}` from the run: block into the step's env: block as ISSUE_NUMBER, and updated the heredoc to reference it as ${ISSUE_NUMBER}. (2) unpinned-uses: Pinned `anthropics/claude-code-base-action@beta` to its full commit SHA `e8132bc5e637a42c27763fc757faa37e1ee43b34`, preserving the tag as a comment.

