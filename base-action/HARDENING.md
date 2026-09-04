<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.214

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.214** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file. Two occurrences: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Both fetch and execute a remote install script in a single pipeline, meaning a compromised or MITM'd response is executed immediately without any integrity check.

Locations:

- `action.yml:148`
- `action.yml:150`

### github-env-injection (severity: high)

Two steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(1) 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (untrusted), then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A newline-containing input value could inject additional entries into PATH.

(2) 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (untrusted), then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. Same injection risk applies.

Locations:

- `action.yml:130`
- `action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed two security findings in hardened/action/action.yml:

1. unsafe-shell (lines 148, 150): Replaced both `curl ... | bash -s -- $VERSION` pipeline patterns with a two-step approach: download the install script to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute it separately with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). The temp file is cleaned up after use. Both the timeout and non-timeout code paths were fixed.

2. github-env-injection (lines 130, 163): Added sanitization before writing user-controlled directory paths to $GITHUB_PATH. In 'Setup Custom Bun Path': `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` then `echo "$safe_bun_dir" >> "$GITHUB_PATH"`. In 'Install Claude Code' (custom executable branch): `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` then `echo "$safe_claude_dir" >> "$GITHUB_PATH"`. This prevents newline injection via malicious path_to_bun_executable or path_to_claude_code_executable inputs.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed three findings in hardened/action/examples/issue-triage.yml:
1. script-injection (line 30): Removed `${{ secrets.GITHUB_TOKEN }}` from the heredoc. The JSON config now uses a 'placeholder' string, and a Python script reads the token from the `GITHUB_TOKEN_VALUE` env var (set in the step's `env:` block) to inject it into the config file after the heredoc is written.
2. script-injection (line 47): Removed `${{ github.event.issue.number }}` from the heredoc. The prompt now uses 'ISSUE_NUMBER_PLACEHOLDER', and after the heredoc is written, `sed` replaces the placeholder with the sanitized value from the `ISSUE_NUMBER_VALUE` env var (set in the step's `env:` block). Values are sanitized with `tr -d '\n\r'` to prevent newline injection.
3. unpinned-uses (line 97): Replaced `anthropics/claude-code-base-action@beta` with the pinned commit SHA `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta`.

