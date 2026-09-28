<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.198

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.198** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (inside a curl -H header argument). Any `${{ ... }}` expression directly in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. Offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:476`

### script-injection (severity: high)

Sub-rule (a): The run: step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside a shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:47`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` to the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:230`
- `base-action/action.yml:121`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` to the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required sanitization step. An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:155`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the timeout-wrapped variant: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This executes whatever the remote server returns without any integrity verification, making it vulnerable to supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:151`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (Revoke app token, line 476): Moved `${{ steps.run.outputs.github_token }}` into an env: block as GITHUB_TOKEN_TO_REVOKE, referenced as $GITHUB_TOKEN_TO_REVOKE in the shell script.

2. agent-approval-check/action.yml (line 47): Moved `${{ github.action_path }}` into the env: block as ACTION_PATH, referenced as $ACTION_PATH in the run: command.

3. action.yml (Setup Custom Bun Path, line 230): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path, line 121): Same sanitization fix as #3.

5. base-action/action.yml (Install Claude Code, lines 148/151/155): (a) Replaced curl-pipe-to-bash with download-then-execute pattern using a mktemp file; dropped the '--' (it was the shell's option terminator, not the script's); cleaned up temp file after use. (b) Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing CLAUDE_DIR to $GITHUB_PATH.

