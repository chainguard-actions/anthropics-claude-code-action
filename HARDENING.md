<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.184

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.184** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The `run:` block in the 'agent-approval-check' composite action directly interpolates `${{ github.action_path }}` inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. The safe pattern is to pass the value via an `env:` variable and reference it as `"$ENV_VAR"` in the shell.

Locations:

- `agent-approval-check/action.yml:54`

### script-injection (severity: high)

Rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is substituted by the template engine before the shell runs, making this a script-injection risk. The safe pattern is to pass the token via an `env:` variable and reference it as `"$TOKEN"` in the curl command.

Locations:

- `action.yml:349`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE` which is set from `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`). A caller-controlled newline in the input value can inject arbitrary entries into `$GITHUB_PATH`, enabling PATH-hijacking attacks.

Locations:

- `action.yml:180`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes `$BUN_DIR` — derived from `$PATH_TO_BUN_EXECUTABLE` which is set from `inputs.path_to_bun_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' "$BUN_DIR" | tr -d '\n\r'`). A caller-controlled newline in the input value can inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `base-action/action.yml:143`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes `$CLAUDE_DIR` — derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` which is set from `inputs.path_to_claude_code_executable` — to `$GITHUB_PATH` without the required sanitization step (`printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'`). A caller-controlled newline in the input value can inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `base-action/action.yml:172`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping a remote script directly to a shell interpreter without first downloading and verifying it is a supply-chain risk — if the remote URL is compromised, arbitrary code executes immediately.

Locations:

- `base-action/action.yml:163`
- `base-action/action.yml:165`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 security findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the `run:` block into an `env:` variable `ACTION_PATH`, merged with the existing env block, and referenced as `"$ACTION_PATH"` in the shell command.

2. action.yml (script-injection): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` block in the 'Revoke app token' step into an `env:` variable `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl command.

3. action.yml (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH` in the 'Setup Custom Bun Path' step.

4. base-action/action.yml (github-env-injection, BUN_DIR): Added same sanitization before writing BUN_DIR to `$GITHUB_PATH` in the 'Setup Custom Bun Path' step.

5. base-action/action.yml (github-env-injection, CLAUDE_DIR): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH` in the 'Install Claude Code' step.

6. base-action/action.yml (unsafe-shell): Replaced both `curl ... | bash -s -- $VERSION` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` was dropped (it was the shell's option terminator, not the script's argument). A temp file is created with `mktemp` and cleaned up after installation.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all 4 findings across 9 workflow files:

1. unpinned-uses: Pinned all mutable action references to full SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs: actions/checkout@v6→d23441a, oven-sh/setup-bun@v2→0c5077e, oven-sh/setup-bun@v1→f4d14e0, anthropics/claude-code-action@v1 and @main→6b082c4.

2. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: blocks to env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA, GH_TOKEN), sync-base-action.yml (DEPLOY_KEY), test-base-action.yml (OUTPUT_FILE, CONCLUSION for both verify steps), test-custom-executables.yml (OUTPUT_FILE, CONCLUSION), test-settings.yml (OUTPUT_FILE, CONCLUSION for all 4 verify steps), and test-structured-output.yml (OUTPUT for 4 verify steps, FILE for execution file step, and all needs.*.result expressions in Generate Summary step replaced with shell conditionals).

4. unsafe-shell: Fixed both curl-pipe-to-bash patterns in test-custom-executables.yml by downloading scripts to temp files first then executing. For Claude Code install, dropped the '-s' flag (no longer reading from stdin) and passed 'latest' directly as a positional argument.

