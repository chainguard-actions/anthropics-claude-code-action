<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.227

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.227** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern (both inside a `bash -c "..."` wrapper and as a direct pipe) executes whatever the remote server returns without any integrity verification, enabling supply-chain attacks if the URL is compromised.

Locations:

- `action.yml:155`
- `action.yml:158`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE` which is set directly from `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into PATH via GITHUB_PATH. The offending line is: `echo "$BUN_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:138`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` — derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` which is set directly from `inputs.path_to_claude_code_executable` — to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into PATH via GITHUB_PATH. The offending line is: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`

Locations:

- `action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three findings in hardened/action/action.yml:

1. unsafe-shell: Replaced both `curl | bash` patterns in the 'Install Claude Code' step with a download-then-execute approach. The install script is now downloaded to a mktemp file (`curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`) and then executed separately (`bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`). The `--` shell option terminator was dropped (it was the shell's, not the script's). The temp file is cleaned up after use (both on success and failure).

2. github-env-injection (BUN_DIR): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` in the 'Setup Custom Bun Path' step.

3. github-env-injection (CLAUDE_DIR): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` in the 'Install Claude Code' step's custom executable branch.

### Iteration 2

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `anthropics/claude-code-base-action@beta` to `anthropics/claude-code-base-action@e8132bc5e637a42c27763fc757faa37e1ee43b34 # beta` in `examples/issue-triage.yml` (line 47). The SHA was resolved via lookup_action_sha for the `beta` ref.

