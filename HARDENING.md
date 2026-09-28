<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.207

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.207** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml, the run: block contains: `python "${{ github.action_path }}/agent_approval_check.py"`. The github.action_path context value is substituted directly into the shell command string before the shell ever sees it, which is a script-injection risk per the check rules (any ${{ }} in a run: block is a finding). The value should be passed via an env: variable and referenced as $GITHUB_ACTION_PATH instead.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ steps.* }} expression is interpolated directly inside a run: shell command. In the 'Revoke app token' step of action.yml, the run: block contains: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The steps.run.outputs.github_token value is substituted directly into the curl command string before the shell processes it. This is a script-injection risk — the value should be passed via an env: variable and referenced as $GITHUB_TOKEN or similar.

Locations:

- `action.yml:383`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input inputs.path_to_bun_executable is mapped to the env var PATH_TO_BUN_EXECUTABLE, then used to compute BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and finally written unsanitized to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:203`
- `base-action/action.yml:168`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the input inputs.path_to_claude_code_executable is mapped to the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then used to compute CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), and finally written unsanitized to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write. An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:205`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a timeout wrapper). The script is fetched from a remote URL and executed immediately without first downloading it to a file for inspection. If the remote URL is compromised or the connection is intercepted, arbitrary code would execute on the runner.

Locations:

- `base-action/action.yml:185`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` — uses the built-in env var instead of an inline expression.
2. action.yml (Revoke app token): Moved `${{ steps.run.outputs.github_token }}` out of the curl command into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell.
3. action.yml (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe_bun_dir` to GITHUB_PATH instead of the raw value.
4. base-action/action.yml (Setup Custom Bun Path): Same sanitization fix as #3.
5. base-action/action.yml (Install Claude Code): Downloaded install.sh to a temp file via `mktemp` and executed it with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping `-s --` from the pipe form per the rules). Also sanitized CLAUDE_DIR with `tr -d '\n\r'` before writing to GITHUB_PATH. Temp file is cleaned up with `rm -f` after use.

