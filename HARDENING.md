<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: `${{ steps.run.outputs.github_token }}` is directly interpolated into the `run:` shell command string in the 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ }}` expression inside a `run:` block is a script-injection risk because the expression is substituted by the YAML template engine before the shell ever sees it, allowing newlines or shell metacharacters in the value to break out of the string context.

Locations:

- `action.yml:381`

### script-injection (severity: high)

Rule (a) violation: `${{ github.action_path }}` is directly interpolated into the `run:` shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Per the check rules, ANY `${{ ... }}` expression — including `github.*` contexts — directly inside a `run:` block is a script-injection finding, because the expression is substituted by the YAML template engine before the shell processes the command.

Locations:

- `agent-approval-check/action.yml:52`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a path containing newline characters to inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `action.yml:226`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step of base-action, the input `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a path containing newline characters to inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `base-action/action.yml:131`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is piped directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. If the remote URL is compromised or redirected (e.g., via DNS hijacking or CDN compromise), arbitrary code will execute on the runner without any integrity verification. The script should be downloaded to a file first, its checksum verified, and then executed separately.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml 'Revoke app token' (script-injection): Moved `${{ steps.run.outputs.github_token }}` out of the run: shell string into an env: block as GITHUB_TOKEN_TO_REVOKE, referenced as plain env var in the curl command.

2. action.yml 'Setup Custom Bun Path' (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

3. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` to env block as ACTION_PATH, merged with the existing env vars into a single env: block, and referenced as `$ACTION_PATH` in the run: command.

4. base-action/action.yml 'Setup Custom Bun Path' (github-env-injection): Same sanitization fix as #2.

5. base-action/action.yml 'Install Claude Code' (unsafe-shell): Replaced `curl ... | bash -s -- $VERSION` pipe pattern with download-then-execute: script is downloaded to a mktemp file, then executed as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` (dropping the `--` shell option terminator per the rules, since it was the shell's own option terminator in the pipe form, not an argument to the install script).

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, unsafe-shell, missing-permissions, github-env-injection

**Notes:**

Fixed all 5 findings:

1. unpinned-uses: Pinned actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → @5ef2e550a465a721f4f45e4a7d3c340c873e1dcc across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. script-injection: Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions from run: shell strings into step env: blocks in release.yml, test-base-action.yml, test-custom-executables.yml, and test-structured-output.yml.

3. unsafe-shell: Fixed test-custom-executables.yml by downloading bun.sh/install and claude.ai/install.sh to temp files first, then executing them separately. Dropped the '--' from 'bash -s latest' per instructions (it was the shell's option terminator, not the script's).

4. missing-permissions: Added top-level 'permissions: contents: read' block to ci.yml.

5. github-env-injection: Fixed base-action/action.yml Install Claude Code step to sanitize CLAUDE_DIR before writing to $GITHUB_PATH using printf '%s' | tr -d '\n\r', matching the pattern already used for BUN_DIR in the Setup Custom Bun Path step.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all 7 script-injection findings across 4 workflow files:

1. **sync-base-action.yml**: Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` from the `run:` shell command into an `env:` block as `DEPLOY_KEY`, referenced as `$DEPLOY_KEY` in the shell.

2. **test-settings.yml** (4 locations): Moved all `${{ steps.*.outputs.* }}` expressions (execution_file and conclusion) from inline `run:` shell assignments into `env:` blocks for all four affected steps (inline-allow verify, inline-deny verify, file-allow verify, file-deny verify).

3. **test-structured-output.yml**: Moved all five `${{ needs.*.result }}` expressions into an `env:` block (RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE) and rewrote the shell logic to use plain shell conditionals (`[ "$VAR" = "success" ]`) instead of template expressions.

4. **test-base-action.yml**: Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s\n' "$PROMPT" > test-prompt.txt`, eliminating the heredoc delimiter injection risk where a PROMPT value containing a bare 'EOF' line could terminate the heredoc early.

