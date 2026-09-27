<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.176

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.176** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: `${{ steps.run.outputs.github_token }}` (a steps.*.outputs.* context expression) is directly interpolated inside a `run:` shell command in the 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ }} expression in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing injection of shell metacharacters.

Locations:

- `action.yml:340`

### script-injection (severity: high)

Rule (a) violation: `${{ github.action_path }}` (a github.* context expression) is directly interpolated inside a `run:` shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ }} expression in a run: block is a script-injection risk regardless of whether the context is attacker-controlled, because YAML template substitution occurs before shell quoting.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` to the env var `PATH_TO_BUN_EXECUTABLE`, then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:253`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` to the env var `PATH_TO_BUN_EXECUTABLE`, then derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:140`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps `inputs.path_to_claude_code_executable` to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then derives `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:172`

### unsafe-shell (severity: high)

Remote content is piped directly to bash without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a `timeout` wrapper). If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:160`
- `base-action/action.yml:162`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. action.yml (Revoke app token, line 340): Moved `${{ steps.run.outputs.github_token }}` into the step's `env:` block as `APP_TOKEN` and replaced the inline expression with `$APP_TOKEN` in the curl command.

2. agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` into the step's `env:` block as `ACTION_PATH`, merged it with the existing env vars into a single `env:` block, and replaced the inline expression with `$ACTION_PATH` in the run command.

3. action.yml (Setup Custom Bun Path, line 253): Replaced `echo "$BUN_DIR" >> "$GITHUB_PATH"` with `printf '%s' "$BUN_DIR" | tr -d '\n\r' >> "$GITHUB_PATH"` followed by `echo >> "$GITHUB_PATH"` to strip newlines before writing to GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path, line 140): Same fix as #3 for the BUN_DIR path.

5. base-action/action.yml (Install Claude Code, line 172): Same sanitization fix for CLAUDE_DIR written to GITHUB_PATH.

6. base-action/action.yml (Install Claude Code, lines 160/162): Replaced `curl ... | bash -s -- "$VERSION"` with a two-step approach: download to a temp file with `curl -fsSL ... -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` separator (it was the shell's option terminator for `-s`, not the script's own argument). Added cleanup of the temp file.

