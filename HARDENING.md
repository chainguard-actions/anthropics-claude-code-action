<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.224

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.224** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This expression is expanded by the GitHub Actions template engine before the shell ever sees it, allowing a malicious step output to inject arbitrary shell commands.

Locations:

- `action.yml:399`

### script-injection (severity: high)

Sub-rule (a): In agent-approval-check/action.yml, the run: block directly interpolates `${{ github.action_path }}` inside a shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a run: block is a script-injection risk as it is expanded by the template engine before the shell processes it.

Locations:

- `agent-approval-check/action.yml:56`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `inputs.path_to_bun_executable` is mapped to the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines can inject arbitrary entries into PATH.

Locations:

- `action.yml:238`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step of base-action/action.yml, `inputs.path_to_bun_executable` is mapped to `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitization. An attacker-controlled input containing newlines can inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:131`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, `inputs.path_to_claude_code_executable` is mapped to `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization. An attacker-controlled input containing newlines can inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever content the remote server returns without first downloading and verifying the script.

Locations:

- `base-action/action.yml:158`
- `base-action/action.yml:160`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. action.yml (Revoke app token, line 399) - script-injection: Moved `${{ steps.run.outputs.github_token }}` into env var `APP_GITHUB_TOKEN` and referenced it as `$APP_GITHUB_TOKEN` in the shell command.

2. agent-approval-check/action.yml (line 56) - script-injection: Moved `${{ github.action_path }}` into env var `ACTION_PATH` and referenced it as `$ACTION_PATH` in the python command. Consolidated the env block into the single step.

3. action.yml (Setup Custom Bun Path, line 238) - github-env-injection: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (Setup Custom Bun Path, line 131) - github-env-injection: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

5. base-action/action.yml (Install Claude Code, line 175) - github-env-injection: Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. base-action/action.yml (Install Claude Code, lines 158, 160) - unsafe-shell: Replaced both `curl ... | bash -s -- $VERSION` pipe patterns with download-then-execute using a temp file (`mktemp`). Dropped the `-s` and `--` shell option flags (they were for the pipe form, not the script). Temp file is cleaned up after installation.

