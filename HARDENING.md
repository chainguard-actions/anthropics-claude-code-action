<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.166

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.166** was hardened automatically. 4 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates the expression `${{ steps.run.outputs.github_token }}` inside a `run:` shell command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression interpolated directly into a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, bypassing shell quoting. The fix is to pass the token via an `env:` variable and reference it as `$GITHUB_TOKEN` in the shell command.

Locations:

- `action.yml:499`

### script-injection (severity: high)

Sub-rule (a): The third step in agent-approval-check/action.yml directly interpolates `${{ github.action_path }}` inside a `run:` shell command: `python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a run: block is a script-injection finding. The fix is to use the `$GITHUB_ACTION_PATH` environment variable instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `agent-approval-check/action.yml:52`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived via dirname from `$PATH_TO_BUN_EXECUTABLE`, which is set from `inputs.path_to_bun_executable`) to `$GITHUB_PATH` without sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. An attacker-controlled input containing newlines could inject additional entries into GITHUB_PATH. The required sanitization step (printf '%s' "$BUN_DIR" | tr -d '\n\r') is missing before the write. The same unsanitized pattern exists in base-action/action.yml for both BUN_DIR (from inputs.path_to_bun_executable) and CLAUDE_DIR (from inputs.path_to_claude_code_executable) written to $GITHUB_PATH.

Locations:

- `action.yml:238`
- `base-action/action.yml:126`
- `base-action/action.yml:152`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and inspecting it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a timeout wrapper). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g., via checksum), and only then executed.

Locations:

- `base-action/action.yml:145`
- `base-action/action.yml:148`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 4 findings across 3 files:

1. action.yml (script-injection, line 499): Moved `${{ steps.run.outputs.github_token }}` to an `env:` block as `APP_TOKEN` and referenced it as `$APP_TOKEN` in the curl Authorization header.

2. agent-approval-check/action.yml (script-injection, line 52): Replaced `${{ github.action_path }}` in the run: block with the built-in `$GITHUB_ACTION_PATH` environment variable.

3. action.yml (github-env-injection, line 238): Sanitized BUN_DIR before writing to $GITHUB_PATH using `printf '%s' "$BUN_DIR" | tr -d '\n\r'` followed by a bare `echo` for the newline.

4. base-action/action.yml (github-env-injection, lines 126 and 152): Applied the same sanitization for BUN_DIR (Setup Custom Bun Path step) and CLAUDE_DIR (Install Claude Code step).

5. base-action/action.yml (unsafe-shell, lines 145/148): Replaced `curl | bash` with a two-step approach: download to a temp file with `curl -fsSL -o "$INSTALL_SCRIPT"`, then execute separately with `bash "$INSTALL_SCRIPT"`. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all four security findings: (1) script-injection: Moved all ${{ }} expressions from run: shell blocks to env: variables in release.yml, sync-base-action.yml, test-base-action.yml, test-structured-output.yml, test-settings.yml, and test-custom-executables.yml. (2) unpinned-uses: Pinned all action references to full 40-char SHAs: actions/checkout@v6 to d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 to 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 to f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main to af0559ee4f514d1ef21826982bed13f7edc3c35e. (3) missing-permissions: Added top-level permissions: contents: read block to ci.yml. (4) unsafe-shell: Replaced both curl-pipe-bash patterns in test-custom-executables.yml with download-then-execute pattern using temp files.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script injection vulnerabilities:

1. `.github/workflows/test-structured-output.yml` (Generate Summary step, line ~283): Moved all `${{ needs.*.result }}` expressions out of the `run:` shell script into an `env:` block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE). The shell script now uses plain variable references and shell conditionals to compute pass/fail labels and the overall ALL_PASSED check.

2. `.github/workflows/test-base-action.yml` (Create test prompt file step, line ~72): Replaced the unsafe unquoted heredoc (`cat > test-prompt.txt << EOF / ${PROMPT} / EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. This safely writes the PROMPT value to the file without performing command substitution on its contents, preventing injection via attacker-controlled `$(...)` or backtick expressions in the workflow_dispatch input.

