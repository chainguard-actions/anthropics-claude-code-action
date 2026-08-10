<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.183

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.183** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command. In the step `run: python "${{ github.action_path }}/agent_approval_check.py"`, the expression `${{ github.action_path }}` is substituted directly into the shell command string before the shell ever sees it. Even though github.action_path is GitHub-controlled, any ${{ ... }} inside a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ steps.*.outputs.* }} expression is directly interpolated inside a run: shell command in the 'Revoke app token' step. The line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` injects the step output value directly into the shell command string. steps.*.outputs.* is listed as an untrusted-input source, and any ${{ ... }} directly inside a run: script is a script-injection finding.

Locations:

- `action.yml:305`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps inputs.path_to_bun_executable into the env var PATH_TO_BUN_EXECUTABLE, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:178`
- `base-action/action.yml:115`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps inputs.path_to_claude_code_executable into the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:143`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and inspecting it. Two occurrences: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:130`
- `base-action/action.yml:132`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the `run:` command into the step's `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell script.

2. action.yml (script-injection): Moved `${{ steps.run.outputs.github_token }}` out of the `run:` curl command into the step's `env:` block as `APP_TOKEN`, then referenced it as `$APP_TOKEN` in the Authorization header.

3. action.yml (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH` in the Setup Custom Bun Path step.

4. base-action/action.yml (github-env-injection): Added sanitization for both `BUN_DIR` (Setup Custom Bun Path step) and `CLAUDE_DIR` (Install Claude Code step) before writing to `$GITHUB_PATH`.

5. base-action/action.yml (unsafe-shell): Replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with a download-then-execute approach: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` separator was dropped as required (it was the shell's option terminator for the pipe form, not the script's own argument). Added proper cleanup of the temp file.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four findings across 8 workflow files:

1. unpinned-uses: Pinned all mutable action references to full 40-char SHAs in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to resolve: actions/checkout@v6→d23441a4, oven-sh/setup-bun@v2→0c5077e5, oven-sh/setup-bun@v1→f4d14e03, anthropics/claude-code-action@v1 and @main→6b082c41.

2. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions out of run: shell strings into env: blocks across release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA), sync-base-action.yml (DEPLOY_KEY, using printf for safe writing), test-base-action.yml (OUTPUT_FILE, CONCLUSION for both verify steps), test-structured-output.yml (OUTPUT for 4 verify steps, FILE for execution file step, RESULT_* vars for summary step with shell conditionals replacing ternary expressions), and test-custom-executables.yml (OUTPUT_FILE, CONCLUSION).

4. unsafe-shell: Replaced both curl-pipe-to-bash patterns in test-custom-executables.yml with download-to-tempfile-then-execute: curl downloads to mktemp file, then bash executes the file. For claude.ai/install.sh, dropped the -s flag and -- separator (per instructions), passing 'latest' directly as a positional argument.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all 6 script injection locations in .github/workflows/test-settings.yml. Moved ${{ steps.inline-settings-test.outputs.execution_file }}, ${{ steps.inline-settings-test.outputs.conclusion }}, ${{ steps.file-settings-test.outputs.execution_file }}, and ${{ steps.file-settings-test.outputs.conclusion }} expressions from inline shell strings into `env:` blocks on their respective steps. The shell scripts now reference these values as plain environment variables ($OUTPUT_FILE, $CONCLUSION), preventing shell metacharacter injection.

