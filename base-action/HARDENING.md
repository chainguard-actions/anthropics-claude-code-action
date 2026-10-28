<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.264

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.264** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with echo "$BUN_DIR" >> "$GITHUB_PATH". The value is not passed through printf '%s' ... | tr -d '\n\r' first, so newlines in it can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". The value is not passed through printf '%s' ... | tr -d '\n\r' first.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file, verified, then run.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' also pipes a remote script straight into bash in its fallback branch: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION".

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed in action.yml; not tested. (1) The 'Setup Custom Bun Path' and 'Install Claude Code' steps now remove newlines from BUN_DIR and CLAUDE_DIR with printf '%s' | tr -d '\n\r' before writing them to $GITHUB_PATH. (2) The Claude installer is no longer piped into bash. Each retry attempt saves it to a temp file from mktemp with curl -fsSL, checks the file is not empty, then runs it as 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. The script still runs under the original 'timeout --foreground --kill-after=10 120' when timeout is available. The '-s --' was dropped so the script gets the version as $1. Changes in behaviour: (a) the download used to count toward the 120s timeout and now happens before it, with its own curl --max-time 60; (b) the only check on the download is that it is not empty. There is no checksum or signature check, because upstream publishes nothing to check against.

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

In action.yml, BUN_DIR and $HOME/.local/bin now go through printf '%s' | tr -d '\n\r' before being written to GITHUB_PATH. I also put quotes around ${GITHUB_ACTION_PATH} in the 'cd' command (Install Dependencies) and the 'bun run' command (Run Claude Code Action).

