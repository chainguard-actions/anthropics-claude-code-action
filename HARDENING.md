<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.264

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.264** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' in action.yml takes inputs.path_to_bun_executable from env PATH_TO_BUN_EXECUTABLE, runs it through dirname, and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not sanitized first with printf '%s' | tr -d '\n\r', so a newline in the input could inject extra PATH entries.

Locations:

- `action.yml:300`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' in action.yml puts an expression directly inside the run script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Pass it through an env: variable and reference it quoted instead.

Locations:

- `action.yml:510`

### script-injection (severity: high)

Sub-rule (a): in agent-approval-check/action.yml the run script contains an expression directly: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Use "$GITHUB_ACTION_PATH" instead.

Locations:

- `agent-approval-check/action.yml:60`

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' in base-action/action.yml writes dirname of inputs.path_to_bun_executable (env PATH_TO_BUN_EXECUTABLE) to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The value is not sanitized first with printf '%s' | tr -d '\n\r'.

Locations:

- `base-action/action.yml:160`

### github-env-injection (severity: high)

Step 'Install Claude Code' in base-action/action.yml writes dirname of inputs.path_to_claude_code_executable (env PATH_TO_CLAUDE_CODE_EXECUTABLE) to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. The value is not sanitized first with printf '%s' | tr -d '\n\r'.

Locations:

- `base-action/action.yml:198`

### unsafe-shell (severity: high)

Step 'Install Claude Code' in base-action/action.yml pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `base-action/action.yml:178`

### unsafe-shell (severity: high)

Step 'Install Claude Code' in base-action/action.yml has a second pipe of a remote script into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The script should be downloaded to a file, checked, and then run.

Locations:

- `base-action/action.yml:180`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

All 7 findings are fixed. Nothing was run to test the changes.

- **action.yml:**
  - The 'Setup Custom Bun Path' step now strips newlines from BUN_DIR (`printf '%s' | tr -d '\n\r'`) before writing it to $GITHUB_PATH.
  - In 'Revoke app token', steps.run.outputs.github_token now comes in through env APP_TOKEN, and the script uses "$APP_TOKEN".
- **agent-approval-check/action.yml:** `${{ github.action_path }}` is replaced with "$GITHUB_ACTION_PATH".
- **base-action/action.yml:**
  - BUN_DIR and CLAUDE_DIR are cleaned the same way before being written to $GITHUB_PATH.
  - The Claude Code installer is no longer piped into bash. It is downloaded with `curl -fsSL -o` to a mktemp file under $RUNNER_TEMP and checked to be non-empty. Then it runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, with the 'timeout' wrapper when that command exists. The `-s --` was dropped so the script still sees the version as $1. A failed download now counts as a failed attempt, so the 3-try retry loop still works, and the temp file is deleted after a successful install.
  - One of my edits to this step left a stray fragment behind (`fitall.sh | bash -s -- ...`) that would have broken the script. I found it on re-reading and removed it.

**Not changed:** src/entrypoints/run.ts (buildInstallCommand) still pipes the installer into `bash -s --`. It wasn't in the findings, and test/install-pipefail.test.ts checks for that exact command, so changing it would break that test.

