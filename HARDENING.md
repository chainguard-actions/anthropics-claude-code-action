<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.180

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.180** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the run block uses `python "${{ github.action_path }}/agent_approval_check.py"` — the expression ${{ github.action_path }} is expanded by the GitHub Actions template engine before the shell sees it, making this a script-injection risk. Any ${{ ... }} in a run: block is a violation regardless of context.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` — the expression ${{ steps.run.outputs.github_token }} is expanded by the template engine before the shell executes the command, constituting a script-injection risk.

Locations:

- `action.yml:461`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml downloads a remote install script and pipes it directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This executes arbitrary remote content without first saving it to a file for inspection, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:163`
- `base-action/action.yml:165`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The env var PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH.

Locations:

- `action.yml:213`
- `action.yml:214`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes a value derived from inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. PATH_TO_BUN_EXECUTABLE is set from ${{ inputs.path_to_bun_executable }}, BUN_DIR is computed from it, and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:130`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. PATH_TO_CLAUDE_CODE_EXECUTABLE is set from ${{ inputs.path_to_claude_code_executable }}, CLAUDE_DIR is computed from it, and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:172`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 6 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the `run:` shell string into the step's `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell command.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the curl command into the step's `env:` block as `APP_GITHUB_TOKEN`, then referenced it as `$APP_GITHUB_TOKEN` in the Authorization header.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell, Install Claude Code): Replaced `curl -fsSL ... | bash -s -- $VERSION` with a download-then-execute pattern: download to a temp file with `mktemp`, then execute the saved script with `bash "$INSTALL_SCRIPT"`. Temp file is cleaned up after use.

6. base-action/action.yml (github-env-injection, Install Claude Code): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, unsafe-shell, script-injection

**Notes:**

Fixed all four findings across 7 workflow files:

1. unpinned-uses: Pinned all mutable action references to full SHA digests in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. SHAs: actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main→fa7e2f0a29a126f0b81cdcf360561b36e44cf608.

2. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml.

3. unsafe-shell: Fixed test-custom-executables.yml by downloading bun.sh/install and claude.ai/install.sh to temp files (/tmp/bun-install.sh and /tmp/claude-install.sh) before executing them, eliminating the curl|bash pipe pattern.

4. script-injection: Moved all ${{ }} expressions out of run: shell strings into env: blocks in release.yml (5 steps), test-base-action.yml (2 steps), test-custom-executables.yml (1 step), test-settings.yml (4 steps), and test-structured-output.yml (6 steps including the summary step which was rewritten to use shell conditionals instead of inline ${{ }} ternary expressions).

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:
1. hardened/action/.github/workflows/sync-base-action.yml line 30: Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the `run:` shell string into an `env:` block as `DEPLOY_KEY`, then referenced it as `"$DEPLOY_KEY"` in the shell script.
2. hardened/action/.github/workflows/test-base-action.yml line 80: Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` expansion) with `printf '%s\n' "$PROMPT" > test-prompt.txt`, which safely writes the user-controlled value without shell expansion of its contents. The `PROMPT` env var remains in the `env:` block.

