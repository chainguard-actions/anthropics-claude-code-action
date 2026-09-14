<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.223

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.223** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the run: shell command string. The expression is embedded in an HTTP Authorization header value: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression directly inside a run: block is a script-injection violation because YAML template substitution occurs before the shell ever sees the string, allowing injection of shell metacharacters.

Locations:

- `action.yml:370`

### script-injection (severity: high)

Rule (a): The third step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside the run: shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a run: block is a script-injection violation — the value is substituted by the YAML template engine before the shell processes it.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` to the env var PATH_TO_BUN_EXECUTABLE, then writes a derived value to $GITHUB_PATH without sanitization: `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input value containing newlines could inject additional entries into $GITHUB_PATH. The required sanitization step (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `action.yml:222`
- `base-action/action.yml:103`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml maps `inputs.path_to_claude_code_executable` to the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then writes a derived value to $GITHUB_PATH without sanitization: `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` followed by `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input value containing newlines could inject additional entries into $GITHUB_PATH. The required sanitization step (`printf '%s' ... | tr -d '\n\r'`) is absent.

Locations:

- `base-action/action.yml:140`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This executes whatever script is served at that URL without first downloading and verifying it, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:127`
- `base-action/action.yml:129`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 security findings across 3 files:

1. action.yml (Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` from the run: shell string to an env: block as APP_GITHUB_TOKEN, referenced as $APP_GITHUB_TOKEN in the curl Authorization header.

2. agent-approval-check/action.yml (python run step): Moved `${{ github.action_path }}` from the run: shell string to the env: block as ACTION_PATH (merged with existing env vars), referenced as $ACTION_PATH in the python command.

3. action.yml (Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path step): Same sanitization fix as above.

5. base-action/action.yml (Install Claude Code step): 
   - Fixed unsafe-shell: replaced `curl ... | bash -s -- $VERSION` with download-to-tempfile then execute pattern (dropping the '--' per instructions). Temp file cleaned up after use.
   - Fixed github-env-injection: added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

