<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.211

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.211** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in a curl -H header). The `steps.*.outputs.*` context is an untrusted/workflow-controllable value that flows through YAML template substitution before the shell sees it, enabling script injection.

Locations:

- `action.yml:530`

### script-injection (severity: high)

Sub-rule (a): The step `run: python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates `${{ github.action_path }}` inside a `run:` shell command string. Any `${{ ... }}` expression directly inside a `run:` script is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This downloads and executes a remote script without first saving it to a file for inspection, enabling supply-chain attacks if the remote URL is compromised.

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:177`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable`, an untrusted input) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:265`
- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable`, an untrusted input) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:187`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (script-injection, line 530): Moved `${{ steps.run.outputs.github_token }}` into env block as APP_TOKEN; curl header now uses `$APP_TOKEN`.

2. agent-approval-check/action.yml (script-injection, line 55): Moved `${{ github.action_path }}` into env block as ACTION_PATH; run command now uses `$ACTION_PATH`.

3. base-action/action.yml (unsafe-shell, lines 175/177): Replaced `curl ... | bash -s -- $VERSION` with download-then-execute pattern: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropped `--` as required).

4. action.yml (github-env-injection, line 265): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH.

5. base-action/action.yml (github-env-injection, lines 148 and 187): Added sanitization for both BUN_DIR and CLAUDE_DIR before writing to GITHUB_PATH using `printf '%s' ... | tr -d '\n\r'`.

