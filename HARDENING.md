<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.180

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.180** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ github.action_path }} expression is interpolated directly inside a run: shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds a GitHub Actions expression directly into the shell command before the shell ever sees it. Per the check rules, any ${{ ... }} expression directly inside a run: block is a script-injection finding regardless of which context it reads from. The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH instead.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ steps.run.outputs.github_token }} expression is interpolated directly inside a run: shell command string in the 'Revoke app token' step. The line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds a steps.* context expression directly into the curl command. This is a script-injection risk as the expression is substituted by the template engine before the shell processes it. The token should be passed via an env: variable and referenced as $GITHUB_TOKEN or similar.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps inputs.path_to_bun_executable into the PATH_TO_BUN_EXECUTABLE env var, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH, enabling path-hijacking attacks.

Locations:

- `action.yml:196`
- `base-action/action.yml:113`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps inputs.path_to_claude_code_executable into the PATH_TO_CLAUDE_CODE_EXECUTABLE env var, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:143`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `timeout ... bash -c "curl ... | bash ..."`). This pattern executes whatever the remote server returns without any integrity verification. The install script should be downloaded to a file first, its checksum verified, and then executed separately.

Locations:

- `base-action/action.yml:133`
- `base-action/action.yml:135`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Replaced `${{ github.action_path }}` in run: with `$GITHUB_ACTION_PATH` (the built-in env var GitHub Actions always sets).

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl command.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code): Downloaded install.sh to a mktemp file and executed it directly (dropping the shell's `--` option terminator from the pipe form, passing version as direct positional arg). Also added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

