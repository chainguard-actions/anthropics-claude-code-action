<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.185

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.185** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds the github.action_path context directly in the shell command before the shell ever sees it. Although github.action_path is not attacker-controlled in the same way as github.head_ref, any ${{ ... }} expression inside a run: block is a script-injection finding per the check rules.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In action.yml, the 'Revoke app token' step embeds `${{ steps.run.outputs.github_token }}` directly in the curl command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The steps.*.outputs.* context is a workflow-controllable value that flows through YAML template substitution before the shell sees it.

Locations:

- `action.yml:358`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and also inside a timeout wrapper: `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This executes whatever the remote server returns without first downloading and verifying the script.

Locations:

- `base-action/action.yml:143`
- `base-action/action.yml:147`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then does `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, so a newline-containing input value could inject additional entries into GITHUB_PATH.

Locations:

- `action.yml:222`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then does `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:121`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. When a custom executable path is provided, the script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then does `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 6 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the `run:` shell command into the step's `env:` block as `ACTION_PATH`. Merged the two env: blocks into one clean block.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the curl `-H "Authorization: Bearer ..."` argument into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell.

3. base-action/action.yml (unsafe-shell, Install Claude Code step): Replaced both `curl -fsSL ... | bash` patterns (the direct pipe and the one inside `bash -c`) with a download-then-execute pattern: `curl -fsSL --max-time 60 -o /tmp/claude-install.sh https://claude.ai/install.sh` followed by `bash /tmp/claude-install.sh -- "$CLAUDE_CODE_VERSION"`. Added cleanup of the temp file after installation.

4. action.yml (github-env-injection, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe_bun_dir` to `$GITHUB_PATH` instead of the raw `$BUN_DIR`.

5. base-action/action.yml (github-env-injection, Setup Custom Bun Path step): Same sanitization fix as #4.

6. base-action/action.yml (github-env-injection, Install Claude Code step): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write `$safe_claude_dir` to `$GITHUB_PATH` instead of the raw `$CLAUDE_DIR`.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings across 7 workflow files:

1. **unpinned-uses**: Pinned all action references to full SHA digests: actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → 9db594c7a0e82298c121c18b7f08aa1579ce7341.

2. **missing-permissions**: Added `permissions: contents: read` top-level block to ci.yml.

3. **script-injection**: Moved all ${{ steps.*.outputs.* }}, ${{ needs.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.result }} expressions from run: shell scripts into env: blocks in release.yml, test-base-action.yml, test-custom-executables.yml, and test-structured-output.yml. The test-structured-output.yml summary job's complex ${{ needs.*.result == 'success' && ... }} boolean expression was replaced with equivalent shell logic.

4. **unsafe-shell**: In test-custom-executables.yml, replaced both `curl -fsSL URL | bash` patterns with download-to-temp-file then execute pattern.

5. **github-env-injection**: In release.yml, sanitized both the latest_tag and next_version values with `printf '%s' ... | tr -d '\n\r'` before writing to $GITHUB_OUTPUT. The latest_tag input to the next_version step is now passed via env block (LATEST_TAG) instead of direct ${{ }} interpolation in the run script.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all script injection findings:

1. sync-base-action.yml: Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the `run:` shell string into an `env:` block as `DEPLOY_KEY`. Changed `echo "$DEPLOY_KEY"` to `printf '%s' "$DEPLOY_KEY"` for safer key file writing.

2. test-settings.yml: Moved all `${{ steps.*.outputs.* }}` expressions (execution_file and conclusion outputs) out of `run:` shell strings into `env:` blocks across all four jobs' verification steps. The shell scripts now reference plain environment variables `$OUTPUT_FILE` and `$CONCLUSION` instead of template expressions.

