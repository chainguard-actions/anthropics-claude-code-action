<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.69** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The expression `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression directly inside a run block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing injection of shell metacharacters.

Locations:

- `action.yml:285`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` (an untrusted input) to the env var `PATH_TO_BUN_EXECUTABLE`, then writes `dirname "$PATH_TO_BUN_EXECUTABLE"` to `$GITHUB_PATH` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into the runner's PATH. This is a case (d) violation.

Locations:

- `action.yml:175`
- `base-action/action.yml:120`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` (an untrusted input) to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then writes `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` to `$GITHUB_PATH` without the required sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into the runner's PATH. This is a case (d) violation.

Locations:

- `base-action/action.yml:157`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (two occurrences — one inside a `timeout` wrapper and one in the else branch). If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner immediately.

Locations:

- `base-action/action.yml:138`
- `base-action/action.yml:140`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across action.yml and base-action/action.yml:

1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` from the 'Revoke app token' run: block into an env: block as APP_TOKEN, referenced as $APP_TOKEN in the curl command.

2. github-env-injection (action.yml + base-action/action.yml): In both 'Setup Custom Bun Path' steps, sanitized the dirname output with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

3. github-env-injection (base-action/action.yml): In the 'Install Claude Code' step's else branch, sanitized the dirname output with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

4. unsafe-shell (base-action/action.yml): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` occurrences with a download-then-execute pattern: curl downloads to a mktemp file, then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` executes it (dropping `-s` and `--` which were pipe-form shell options, not script arguments). Temp file is cleaned up after installation.

