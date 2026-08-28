<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.208

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.208** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In agent-approval-check/action.yml, the step `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Although github.action_path is GitHub-controlled, any ${{ ... }} expression directly inside a run: block is a script-injection finding per the check rules, as the value flows through YAML template substitution before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. In action.yml, the 'Revoke app token' step embeds `${{ steps.run.outputs.github_token }}` directly in a curl command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context is a workflow-controllable value that flows through YAML template substitution before the shell processes it, making this a script-injection risk.

Locations:

- `action.yml:493`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to $GITHUB_PATH without sanitization. The input is placed into env var PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into the PATH file.

Locations:

- `action.yml:237`
- `base-action/action.yml:130`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to $GITHUB_PATH without sanitization. The input is placed into env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into the PATH file.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without first downloading and inspecting the script. The pattern appears twice (once inside a `timeout` wrapper and once in the else branch).

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` from the run: command into env var `ACTION_PATH`, referenced as `$ACTION_PATH` in the shell.

2. action.yml (script-injection, Revoke app token): Moved `${{ steps.run.outputs.github_token }}` into env var `APP_GITHUB_TOKEN`, referenced as `$APP_GITHUB_TOKEN` in the curl command.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Same sanitization pattern for BUN_DIR.

5. base-action/action.yml (github-env-injection, Install Claude Code): Added sanitization for CLAUDE_DIR and HOME/.local/bin before writing to $GITHUB_PATH.

6. base-action/action.yml (unsafe-shell, Install Claude Code): Replaced both `curl | bash -s -- $VERSION` patterns with download-to-tempfile then execute. Dropped the `--` (it was the shell's option terminator in the pipe form). Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across 8 workflow files:

1. unpinned-uses: Pinned all action references to full SHAs - actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main→e8c2d7c16c018cf1e694711c1c07a5f5db2b5eb1.

2. missing-permissions: Added 'permissions: contents: read' top-level block to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. The test-structured-output.yml summary step's ALL_PASSED logic was rewritten using shell variable comparisons instead of a GitHub expression.

4. unsafe-shell: Fixed both curl-pipe-to-bash patterns in test-custom-executables.yml by downloading scripts to temp files first, then executing them. For the Claude Code installer, 'bash -s latest' became 'bash script latest' (dropping -s and -- per the rules).

5. github-env-injection: Fixed in release.yml by sanitizing tag values with 'printf "%s" | tr -d "\n\r"' before writing to GITHUB_OUTPUT in both the 'Get latest tag' and 'Calculate next version' steps.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in the 'Create test prompt file' step of .github/workflows/test-base-action.yml. The unquoted heredoc (`<< EOF`) was replaced with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc allowed command substitution on the PROMPT environment variable (sourced from `github.event.inputs.test_prompt`), meaning an attacker could supply a value like `$(malicious_command)` that would be executed by the shell. The `printf` approach with a properly double-quoted variable safely writes the content to the file without any shell interpretation.

