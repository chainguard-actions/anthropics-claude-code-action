<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.180

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.180** was hardened automatically. 4 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is a workflow-controllable value and must never appear directly inside a shell command string.

Locations:

- `action.yml:456`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (user-controlled). The script derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:228`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (user-controlled). The script derives `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the script pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever the remote server returns without first downloading and inspecting the script. A compromised or man-in-the-middle'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 security findings across action.yml and base-action/action.yml:

1. script-injection (action.yml ~line 456): Moved `${{ steps.run.outputs.github_token }}` from the curl command in the 'Revoke app token' run: block into an env: block as GITHUB_APP_TOKEN, referenced as $GITHUB_APP_TOKEN in the shell.

2. github-env-injection (action.yml ~line 228): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the 'Setup Custom Bun Path' step.

3. github-env-injection (base-action/action.yml ~lines 130 and 163): Applied the same BUN_DIR sanitization in base-action's 'Setup Custom Bun Path' step, and added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the 'Install Claude Code' step.

4. unsafe-shell (base-action/action.yml ~line 155): Replaced `curl ... | bash -s -- "$CLAUDE_CODE_VERSION"` with a download-then-execute pattern using a mktemp file. Dropped `-s` and `--` (shell stdin-reading flags) since the script is now executed as a file, passing `"$CLAUDE_CODE_VERSION"` directly as $1. Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, unsafe-shell, missing-permissions

**Notes:**

Fixed all four findings:

1. **unpinned-uses**: Pinned all mutable action references to full SHA digests across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs: actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main→6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975.

2. **script-injection**: Moved all ${{ }} expressions out of run: shell strings into env: blocks across release.yml (steps outputs and github.sha), sync-base-action.yml (secret), test-base-action.yml (step outputs), test-custom-executables.yml (step outputs), test-settings.yml (4 verify steps), and test-structured-output.yml (structured_output outputs + needs.*.result expressions replaced with shell conditionals).

3. **unsafe-shell**: Replaced both curl|bash pipes in test-custom-executables.yml with safe download-to-tempfile-then-execute pattern. For Bun: `curl -o $INSTALL_SCRIPT + bash $INSTALL_SCRIPT`. For Claude Code: `curl -o $INSTALL_SCRIPT + bash $INSTALL_SCRIPT latest` (dropped '-s' stdin flag and '--' separator per instructions).

4. **missing-permissions**: Added `permissions: contents: read` top-level block to ci.yml.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/agent-approval-check/action.yml: moved `${{ github.action_path }}` out of the `run:` shell command and into the `env:` block as `ACTION_PATH`, then updated the shell command to reference `$ACTION_PATH/agent_approval_check.py` instead.

