<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.197

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.197** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string. This expression is substituted by the YAML template engine before the shell ever sees the value, allowing injection of shell metacharacters. The offending line is: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"

Locations:

- `action.yml:503`

### script-injection (severity: high)

Rule (a) violation: The step `run: python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates `${{ github.action_path }}` inside a `run:` shell command string. Any ${{ ... }} expression directly inside a run: script is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:47`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This downloads and executes arbitrary remote code without first saving it to a file for inspection, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:157`
- `base-action/action.yml:159`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes $BUN_DIR (derived from inputs.path_to_bun_executable via env var PATH_TO_BUN_EXECUTABLE) to $GITHUB_PATH without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH. Pattern: BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") then echo "$BUN_DIR" >> "$GITHUB_PATH" with no sanitization (case d violation).

Locations:

- `action.yml:248`
- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 4 findings across 3 files:

1. action.yml (script-injection, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into env: block as APP_TOKEN; referenced as $APP_TOKEN in curl -H header.

2. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` into env: block as ACTION_PATH; merged with existing env: block; referenced as "$ACTION_PATH/agent_approval_check.py" in run:.

3. base-action/action.yml (unsafe-shell): Converted both curl|bash patterns to download-then-execute using mktemp. Dropped the '--' per instructions (it was the shell's -s option terminator, not the script's argument). Temp file cleaned up after use.

4. action.yml + base-action/action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH in both files to prevent newline injection from attacker-controlled path_to_bun_executable input.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In hardened/action/base-action/action.yml, applied newline sanitization to CLAUDE_DIR before writing to $GITHUB_PATH. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and changed the echo to use `$safe_claude_dir` instead of `$CLAUDE_DIR`. This matches the existing sanitization pattern already used for BUN_DIR in the same file.

