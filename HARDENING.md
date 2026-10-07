<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.245

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.245** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Although github.action_path is GitHub-controlled, any ${{ ... }} expression inside a run: block is a script-injection finding per the check rules, as the value flows through YAML template substitution before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:48`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in the shell script. The value `steps.run.outputs.github_token` flows through YAML template substitution before the shell processes it, enabling script injection if the output contains shell metacharacters.

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:237`
- `base-action/action.yml:137`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into $GITHUB_PATH.

Locations:

- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a second variant inside a `timeout` wrapper). The script is fetched from the network and executed immediately without being saved to a file first, verified, or inspected. A compromised or MITM'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` using the built-in env var.

2. action.yml (script-injection, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_GITHUB_TOKEN` and referenced it as `$APP_GITHUB_TOKEN` in the curl command.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code): Downloaded install script to a temp file first then executed it separately (dropping the `--` shell option terminator from the pipe form), and added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

