<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.206

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.206** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step interpolates ${{ steps.run.outputs.github_token }} directly inside a run: shell command: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}". The steps.*.outputs.* context is workflow-controllable and is expanded by the YAML template engine before the shell ever sees it, enabling command injection.

Locations:

- `action.yml:430`

### script-injection (severity: high)

Sub-rule (a): The run: block in agent-approval-check/action.yml uses ${{ github.action_path }} directly inside a shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression directly inside a run: block is a script-injection risk as it is expanded by the YAML template engine before the shell processes it.

Locations:

- `agent-approval-check/action.yml:56`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (untrusted input), then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes echo "$BUN_DIR" >> "$GITHUB_PATH" without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:215`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets PATH_TO_CLAUDE_CODE_EXECUTABLE from inputs.path_to_claude_code_executable (untrusted input), then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes echo "$CLAUDE_DIR" >> "$GITHUB_PATH" without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:158`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and also inside a timeout wrapper). The script is fetched from a remote URL and executed without first downloading and verifying it, which is an unsafe shell pattern.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (script-injection, line 430): Moved `${{ steps.run.outputs.github_token }}` out of the curl command's -H flag and into an env: block as APP_TOKEN, referenced as $APP_TOKEN in the shell.

2. agent-approval-check/action.yml (script-injection, line 56): Moved `${{ github.action_path }}` out of the python run: command into the env: block as ACTION_PATH, referenced as $ACTION_PATH in the shell.

3. action.yml (github-env-injection, line 215): Sanitized BUN_DIR before writing to GITHUB_PATH using `printf '%s' "$BUN_DIR" | tr -d '\n\r'` to strip newlines.

4. base-action/action.yml (github-env-injection, line 130): Same sanitization fix for Setup Custom Bun Path step.

5. base-action/action.yml (unsafe-shell lines 155/157 + github-env-injection line 158): Replaced curl-pipe-to-bash with download-then-execute pattern (curl to temp file, then bash on the file). Dropped the '--' separator as required (it was the shell's option terminator, not the script's). Also sanitized CLAUDE_DIR before writing to GITHUB_PATH.

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 8 workflow files:

1. unpinned-uses: Pinned all action references to full SHA digests in ci.yml, claude.yml, claude-review.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6, oven-sh/setup-bun@v1, oven-sh/setup-bun@v2, anthropics/claude-code-action@main, and anthropics/claude-code-action@v1.

2. missing-permissions: Added top-level `permissions: contents: read` block to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks in release.yml (5 steps), sync-base-action.yml (1 step), test-base-action.yml (2 verify steps + heredoc fix), test-custom-executables.yml (1 verify step), test-settings.yml (4 verify steps), and test-structured-output.yml (5 verify steps + summary step).

4. github-env-injection: In release.yml, sanitized GITHUB_OUTPUT writes using `printf '%s' ... | tr -d '\n\r'` in both the Get latest tag and Calculate next version steps.

5. unsafe-shell: In test-custom-executables.yml, converted both curl-pipe-to-bash patterns to download-then-execute: (a) bun install script, (b) claude.ai/install.sh with 'latest' positional arg (dropping the shell's -s flag per the rules).

