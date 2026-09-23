<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.228

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.228** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. A `steps.*.outputs.*` context value is injected directly into the shell string before the shell ever sees it, enabling script injection if the output value contains shell metacharacters.

Locations:

- `action.yml:495`

### script-injection (severity: high)

Sub-rule (a): In agent-approval-check/action.yml, the run: command `python "${{ github.action_path }}/agent_approval_check.py"` directly interpolates a `github.*` context expression (`github.action_path`) inside the shell command string. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). The script is not downloaded to a file first and verified before execution.

Locations:

- `base-action/action.yml:175`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes an untrusted input-derived value to $GITHUB_PATH without sanitization. `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into the PATH environment file.

Locations:

- `action.yml:250`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes an untrusted input-derived value to $GITHUB_PATH without sanitization. `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into the PATH environment file.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:
1. action.yml (Revoke app token, line 495): Moved `${{ steps.run.outputs.github_token }}` out of the shell command string into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the curl command.
2. agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` out of the `run:` string into the `env:` block as `ACTION_PATH`, merged with the existing env vars, and referenced as `$ACTION_PATH` in the run command.
3. base-action/action.yml (Install Claude Code, line 175): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $VERSION` (and the timeout-wrapped variant) with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `--` separator as required since we're no longer using `bash -s`.
4. action.yml (Setup Custom Bun Path, line 250): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.
5. base-action/action.yml (Setup Custom Bun Path, line 155): Same sanitization fix as above.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Install Claude Code' step in hardened/action/base-action/action.yml to sanitize CLAUDE_DIR before writing to $GITHUB_PATH. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and replaced `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` with `echo "$safe_claude_dir" >> "$GITHUB_PATH"`. This matches the sanitization pattern already used in the sibling 'Setup Custom Bun Path' step, preventing an attacker-controlled input with embedded newlines from injecting arbitrary entries into $GITHUB_PATH.

### Iteration 3

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all 14 findings across 12 files:

**script-injection fixes:**
- examples/test-failure-analysis.yml: Moved `${{ steps.detect.outputs.structured_output }}` from 3 `run:` blocks into `env:` blocks as `STRUCTURED_OUTPUT`; also moved `${{ github.event.workflow_run.html_url }}` to `WORKFLOW_RUN_HTML_URL` env var. Shell scripts now reference `$STRUCTURED_OUTPUT` and `$WORKFLOW_RUN_HTML_URL` instead of direct template interpolation.
- base-action/examples/issue-triage.yml: Moved `${{ github.event.issue.number }}` from inside the heredoc into the step's `env:` block as `ISSUE_NUMBER`. Changed heredoc delimiter from single-quoted `'EOF'` to unquoted `EOF` so shell variables expand, and used `${ISSUE_NUMBER}` in the heredoc body. Merged duplicate `env:` blocks into one.

**unpinned-uses fixes (all SHAs resolved via lookup_action_sha):**
- actions/checkout@v4 → SHA 11d5960a326750d5838078e36cf38b85af677262
- actions/checkout@v6 → SHA d23441a48e516b6c34aea4fa41551a30e30af803
- actions/github-script@v7 → SHA f28e40c7f34bde8b3046d885e986cb6290c5673b
- anthropics/claude-code-action@v1 / @main → SHA 2261fcfc88e7de1b55f179edd588805e12de71f2
- anthropics/claude-code-action/agent-approval-check@main → SHA 2261fcfc88e7de1b55f179edd588805e12de71f2
- anthropics/claude-code-base-action@beta → SHA e8132bc5e637a42c27763fc757faa37e1ee43b34

All 11 example workflow files updated with pinned SHA references.

