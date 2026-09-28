<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.183

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.183** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in the curl Authorization header). Any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing an attacker who controls the output value to inject shell metacharacters.

Locations:

- `action.yml:499`

### script-injection (severity: high)

Rule (a): The `run: python "${{ github.action_path }}/agent_approval_check.py"` line in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside a `run:` shell command string. Any `${{ ... }}` expression directly in a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:51`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice — once inside a `timeout ... bash -c "..."` wrapper and once in the else branch). This downloads and executes arbitrary remote code without first saving it to a file for inspection.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:151`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an unsanitized value derived from `inputs.path_to_bun_executable` to `$GITHUB_PATH`. The input is routed through the env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. A newline in the input value could inject an arbitrary directory into PATH. This pattern appears in both action.yml and base-action/action.yml.

Locations:

- `action.yml:237`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes an unsanitized value derived from `inputs.path_to_claude_code_executable` to `$GITHUB_PATH`. The input is routed through the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. A newline in the input value could inject an arbitrary directory into PATH.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (Revoke app token, line 499) - script-injection: Moved `${{ steps.run.outputs.github_token }}` into env block as APP_TOKEN, referenced as $APP_TOKEN in curl Authorization header.

2. agent-approval-check/action.yml (line 51) - script-injection: Moved `${{ github.action_path }}` into env block as ACTION_PATH, referenced as $ACTION_PATH in python command. Merged with existing env block to avoid duplicate YAML keys.

3. base-action/action.yml (lines 148/151) - unsafe-shell: Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with download-then-execute: curl to a mktemp file, then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` separator (it was the shell's option terminator in the pipe form). Added temp file cleanup.

4. action.yml (line 237, Setup Custom Bun Path) - github-env-injection: Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

5. base-action/action.yml (lines 130 and 163) - github-env-injection: Added newline-stripping sanitization for both BUN_DIR (Setup Custom Bun Path step) and CLAUDE_DIR (Install Claude Code step) before writing to $GITHUB_PATH.

