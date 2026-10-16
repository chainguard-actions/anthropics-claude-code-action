<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.252

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.252** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In agent-approval-check/action.yml, the step `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command string. Per the check rules, any ${{ ... }} expression inside a run: block is a script-injection finding regardless of which context it reads from. The value should be passed via an env: variable and referenced as `"$GITHUB_ACTION_PATH"` instead.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in the shell script. `steps.*.outputs.*` is an explicitly listed untrusted input source. The token should be passed via an env: variable (e.g., `APP_TOKEN: ${{ steps.run.outputs.github_token }}`) and referenced as `"$APP_TOKEN"` in the shell command.

Locations:

- `action.yml:497`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern (curl ... | bash) executes remotely-fetched content without first downloading and verifying it. The script should be downloaded to a file, inspected/verified, and then executed separately. This pattern appears twice in the same step (once inside a `timeout` wrapper and once in the else branch).

Locations:

- `base-action/action.yml:156`
- `base-action/action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed three security findings: (1) agent-approval-check/action.yml line 57: replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` in the python run command to eliminate script-injection. (2) action.yml line 497 (Revoke app token step): moved `${{ steps.run.outputs.github_token }}` to an env: block as APP_TOKEN and referenced it as `$APP_TOKEN` in the curl Authorization header. (3) base-action/action.yml lines 156/158 (Install Claude Code step): replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` patterns with download-then-execute: script downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` per instructions since it was the shell's option terminator for `-s`, not the script's own argument).

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed three github-env-injection findings:
1. action.yml (~line 217): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the 'Setup Custom Bun Path' step.
2. base-action/action.yml (~line 136): Same fix for BUN_DIR in the 'Setup Custom Bun Path' step.
3. base-action/action.yml (~line 176): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in the 'Install Claude Code' step's else branch.
All three cases now sanitize attacker-controlled path values by stripping newlines before writing to $GITHUB_PATH, preventing PATH injection attacks.

