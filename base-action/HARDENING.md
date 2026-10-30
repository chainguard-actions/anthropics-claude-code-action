<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.265

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.265** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_bun_executable, and there is no printf '%s' ... | tr -d '\n\r' step before the write: echo "$BUN_DIR" >> "$GITHUB_PATH"

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_claude_code_executable, and there is no printf '%s' ... | tr -d '\n\r' step before the write: echo "$CLAUDE_DIR" >> "$GITHUB_PATH"

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Remote script is piped straight into a shell (inside a timeout wrapper): bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script is piped straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Two fixes, both in action.yml. Not yet tested.

1. github-env-injection (two places): the 'Setup Custom Bun Path' step and the custom-path branch of 'Install Claude Code' now save the dirname result first. Newlines and carriage returns are then stripped with printf '%s' | tr -d '\n\r' before the value is written to $GITHUB_PATH.

2. unsafe-shell (both curl | bash forms): the installer is now downloaded with curl into a mktemp file, which is deleted when the step exits. Then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` runs it. The '-s --' is gone, so the script still gets the version as $1. The 120s timeout and the 3-attempt retry loop are unchanged.

Two behaviour changes:
- The download now happens outside the timeout wrapper. curl has its own 60s limit (--max-time 60) instead.
- If the download fails or the file is empty, that attempt counts as failed and is retried.

### Iteration 2

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Changed the 'Install Claude Code' step in action.yml. Nothing was run or tested after the edits.

1. unsafe-shell (both places): the step no longer pipes https://claude.ai/install.sh into a shell. Each attempt now downloads the script to a temporary file with `curl --max-time 120`, checks the file isn't empty, and runs it with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `-s --` is gone, so the script gets the version as $1. The version is also now quoted in the timeout branch; before, it sat unquoted inside a `bash -c` string. The timeout wrapper with `--foreground --kill-after=10 120` still wraps the install. The download now has its own 120-second limit, so one attempt can take longer than the old 120 seconds total. The temp file is deleted whether the attempt works or fails. The 3-attempt retry loop is unchanged.

2. github-env-injection: `$HOME/.local/bin` now goes through `printf '%s' | tr -d '\n\r'` before it is added to GITHUB_PATH.

