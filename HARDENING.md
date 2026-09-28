<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.184

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.184** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds ${{ github.action_path }} directly in the shell command string. Although github.action_path is typically a controlled value, any ${{ ... }} expression inside a run: block is a script-injection finding per the check rules. The value should be passed via an env: variable instead.

Locations:

- `agent-approval-check/action.yml:52`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in the shell script body. The expression ${{ steps.run.outputs.github_token }} is substituted by the YAML template engine before the shell sees it, enabling script injection. It should be passed via an env: variable and referenced as $GITHUB_TOKEN or similar.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an unsanitized, input-derived value to $GITHUB_PATH. The env var PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable (an attacker-controlled input), and $BUN_DIR is computed as `dirname "$PATH_TO_BUN_EXECUTABLE"`. The result is then written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:196`
- `base-action/action.yml:121`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes an unsanitized, input-derived value to $GITHUB_PATH. The env var PATH_TO_CLAUDE_CODE_EXECUTABLE is set from inputs.path_to_claude_code_executable (an attacker-controlled input), and $CLAUDE_DIR is computed as `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"`. The result is then written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:148`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a timeout wrapper). This pattern executes whatever the remote server returns without any integrity verification, making it vulnerable to supply-chain attacks if the remote URL is compromised. The script should be downloaded to a file, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:145`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} from run: shell into env: variable ACTION_PATH.
2. action.yml 'Revoke app token': Moved ${{ steps.run.outputs.github_token }} from curl command into env: variable APP_GITHUB_TOKEN.
3. action.yml 'Setup Custom Bun Path': Sanitized BUN_DIR with printf/tr before writing to $GITHUB_PATH.
4. base-action/action.yml 'Setup Custom Bun Path': Same BUN_DIR sanitization fix.
5. base-action/action.yml 'Install Claude Code': (a) Replaced both curl-pipe-to-bash patterns with download-to-tempfile-then-execute pattern (dropping the '--' shell option terminator that was only needed for the pipe form); (b) Sanitized CLAUDE_DIR with printf/tr before writing to $GITHUB_PATH.

