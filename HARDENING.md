<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.225

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.225** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): ${{ github.action_path }} is interpolated directly inside a run: shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` passes the github.action_path context value through YAML template substitution before the shell sees it. Although github.action_path is not attacker-controlled, any ${{ }} expression directly in a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Rule (a): ${{ steps.run.outputs.github_token }} is interpolated directly inside a run: shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The steps.*.outputs.* context is listed as an untrusted-input source and must not appear directly in a run: block.

Locations:

- `action.yml:432`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, PATH_TO_BUN_EXECUTABLE is set from inputs.path_to_bun_executable (an untrusted input). The script computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and then writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without applying the required sanitization step (printf '%s' ... | tr -d '\n\r') before the write. A newline in the input value could inject additional entries into $GITHUB_PATH.

Locations:

- `action.yml:204`
- `base-action/action.yml:134`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, PATH_TO_CLAUDE_CODE_EXECUTABLE is set from inputs.path_to_claude_code_executable (an untrusted input). The script computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and then writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r') before the write.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The install script is fetched and executed in a single pipeline without first saving it to a file for inspection.

Locations:

- `base-action/action.yml:160`
- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved ${{ github.action_path }} into env: block as ACTION_PATH, referenced as $ACTION_PATH in run: shell command.

2. action.yml (script-injection, Revoke app token step): Moved ${{ steps.run.outputs.github_token }} into env: block as APP_TOKEN, referenced as $APP_TOKEN in the curl -H Authorization header.

3. action.yml (github-env-injection, Setup Custom Bun Path): Replaced `echo "$BUN_DIR" >> "$GITHUB_PATH"` with `printf '%s' "$BUN_DIR" | tr -d '\n\r' >> "$GITHUB_PATH"` + `echo >> "$GITHUB_PATH"` to strip newlines before writing to GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code): Downloaded install.sh to a mktemp file before executing (fixing both pipe-to-bash patterns); dropped the '--' separator since we're no longer using bash -s; cleaned up the temp file after use. Also applied printf/tr sanitization to CLAUDE_DIR before writing to GITHUB_PATH.

