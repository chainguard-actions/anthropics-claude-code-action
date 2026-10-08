<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.246

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.246** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml, the run step uses `run: python "${{ github.action_path }}/agent_approval_check.py"` — the expression ${{ github.action_path }} is substituted directly into the shell command string before the shell executes it. While github.action_path is not attacker-controlled, any ${{ }} in a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:53`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In the 'Revoke app token' step of action.yml, the run block contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — the expression ${{ steps.run.outputs.github_token }} (a steps output, which is a workflow-controllable context) is substituted directly into the shell command string. This should be passed via an env: variable instead.

Locations:

- `action.yml:480`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (caller-controlled) via env:, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without applying the required sanitization (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:233`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets PATH_TO_CLAUDE_CODE_EXECUTABLE from inputs.path_to_claude_code_executable (caller-controlled) via env:, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:165`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and also inside a timeout wrapper: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). The install script is fetched and executed in a single pipeline without first downloading and verifying it. This is an unsafe-shell pattern.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:153`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml: Moved ${{ github.action_path }} into env: block as ACTION_PATH; merged with existing env: block. run: now uses "$ACTION_PATH/agent_approval_check.py".

2. action.yml (Revoke app token): Moved ${{ steps.run.outputs.github_token }} into env: block as APP_GITHUB_TOKEN; curl now uses "$APP_GITHUB_TOKEN".

3. action.yml (Setup Custom Bun Path): Added sanitization `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path): Same BUN_DIR sanitization added.

5. base-action/action.yml (Install Claude Code - CLAUDE_DIR path): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

6. base-action/action.yml (Install Claude Code - unsafe-shell): Replaced `curl | bash` with download-then-execute pattern: downloads to a mktemp file, then runs `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` which was the shell's option terminator). Both the timeout and non-timeout paths were fixed. Temp file is cleaned up after use.

