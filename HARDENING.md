<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.226

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.226** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:58`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` (a `steps.*.outputs.*` context value) is interpolated directly inside a `run:` shell command string in the "Revoke app token" step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This value flows through YAML template substitution before the shell processes it, enabling injection if the output contains shell metacharacters.

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

The "Setup Custom Bun Path" step writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE` which is set from `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH. Offending line: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:238`

### github-env-injection (severity: high)

The "Setup Custom Bun Path" step writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE` which is set from `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH. Offending line: `echo "$BUN_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:133`

### github-env-injection (severity: high)

The "Install Claude Code" step writes `$CLAUDE_DIR` — derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` which is set from `inputs.path_to_claude_code_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH. Offending line: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `base-action/action.yml:170`

### unsafe-shell (severity: high)

The "Install Claude Code" step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and inspecting the script. It appears twice — once inside a `timeout` wrapper and once in the `else` branch. A compromised or MitM'd remote endpoint could execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. agent-approval-check/action.yml: Moved `${{ github.action_path }}` from run: shell string into env: block as ACTION_PATH, referenced as $ACTION_PATH in the shell command.

2. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` from run: shell string into env: block as APP_TOKEN, referenced as $APP_TOKEN in the curl Authorization header.

3. action.yml (Setup Custom Bun Path step): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path step): Same sanitization fix as #3.

5. base-action/action.yml (Install Claude Code step, custom path branch): Added sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

6. base-action/action.yml (Install Claude Code step): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with download-then-execute: script downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator in the pipe form). Temp file is cleaned up after use.

