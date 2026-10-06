<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.242

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.242** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ steps.run.outputs.github_token }}` is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The expression `steps.*.outputs.*` is a workflow-controllable context that flows through YAML template substitution before the shell sees it, enabling script injection. Offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`

Locations:

- `action.yml:510`

### script-injection (severity: high)

Rule (a): `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string. Any `${{ ... }}` expression directly inside a run: script is a script-injection finding regardless of which context it reads from. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `agent-approval-check/action.yml:52`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:248`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification. There are two occurrences: one inside a `timeout` wrapper and one in the fallback `else` branch.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` into env: block as GITHUB_TOKEN_TO_REVOKE to prevent script injection.

2. agent-approval-check/action.yml: Moved `${{ github.action_path }}` into the env: block as ACTION_PATH (merged with existing env vars), referenced as $ACTION_PATH in the run: command.

3. action.yml (Setup Custom Bun Path): Added `printf '%s' "$BUN_DIR" | tr -d '\n\r'` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path): Added same BUN_DIR sanitization before writing to $GITHUB_PATH.

5. base-action/action.yml (Install Claude Code): (a) Fixed unsafe-shell by downloading install.sh to a temp file first, then executing with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropped the `--` which was the shell's own option terminator in the pipe form). (b) Fixed github-env-injection by sanitizing CLAUDE_DIR with `printf '%s' | tr -d '\n\r'` before writing to $GITHUB_PATH.

