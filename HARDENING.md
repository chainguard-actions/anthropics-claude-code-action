<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.187

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.187** was hardened automatically. 3 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ }}` expression is directly interpolated inside a `run:` shell command string. In `agent-approval-check/action.yml`, the run block uses `run: python "${{ github.action_path }}/agent_approval_check.py"` — `${{ github.action_path }}` is expanded by the GitHub Actions template engine before the shell sees the string, making it a script-injection vector. In `action.yml`, the "Revoke app token" step uses `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly inside a `run:` block — `steps.*.outputs.*` is a workflow-controllable context and must not be interpolated directly into shell commands.

Locations:

- `agent-approval-check/action.yml:59`
- `action.yml:348`

### unsafe-shell (severity: high)

The "Install Claude Code" step in `base-action/action.yml` pipes remote content directly to a shell interpreter without first downloading to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice — once inside a `bash -c "..."` string (with an unquoted `$CLAUDE_CODE_VERSION`) and once as a direct pipeline. An attacker who can influence the remote URL or perform a MITM attack could execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:162`

### github-env-injection (severity: high)

User-controlled input values are written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) In both `action.yml` and `base-action/action.yml`, the "Setup Custom Bun Path" step sets `PATH_TO_BUN_EXECUTABLE` from `inputs.path_to_bun_executable`, derives `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` — a newline in the input could inject additional PATH entries. (2) In `base-action/action.yml`, the "Install Claude Code" step sets `PATH_TO_CLAUDE_CODE_EXECUTABLE` from `inputs.path_to_claude_code_executable`, derives `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` with the same vulnerability.

Locations:

- `action.yml:248`
- `base-action/action.yml:138`
- `base-action/action.yml:178`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed all three findings across three files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the run: command into the env: block as ACTION_PATH. Merged the two env: blocks into one to avoid YAML duplication.

2. action.yml (script-injection): Moved `${{ steps.run.outputs.github_token }}` out of the curl -H flag in the Revoke app token step into the env: block as APP_TOKEN.

3. action.yml (github-env-injection): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH in the Setup Custom Bun Path step.

4. base-action/action.yml (unsafe-shell): Replaced both `curl -fsSL ... | bash -s -- $CLAUDE_CODE_VERSION` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped the `-s` and `--` shell option flags as required since the script is now run from a file, not stdin. Added temp file cleanup.

5. base-action/action.yml (github-env-injection, line 138): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH in the Setup Custom Bun Path step.

6. base-action/action.yml (github-env-injection, line 178): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH in the Install Claude Code step.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, missing-permissions, unsafe-shell

**Notes:**

Fixed all four findings:

1. unpinned-uses: Pinned all action references to full SHA digests:
   - actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@main → @1623c36729ac1cd5895198cded705a287de7db79 # main
   - anthropics/claude-code-action@v1 → @1623c36729ac1cd5895198cded705a287de7db79 # v1
   Applied to: ci.yml, claude.yml, claude-review.yml, release.yml, issue-triage.yml

2. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings into step env: blocks in:
   - release.yml: latest_tag, next_version, github.sha expressions
   - sync-base-action.yml: secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY (using printf to write)
   - test-base-action.yml: steps.inline-test.outputs.* and steps.prompt-file-test.outputs.*
   - test-custom-executables.yml: steps.custom-test.outputs.*
   - test-structured-output.yml: steps.test.outputs.structured_output (all jobs) and needs.*.result expressions in Summary step

4. unsafe-shell: Fixed both curl|bash patterns in test-custom-executables.yml:
   - curl -fsSL https://bun.sh/install | bash → download to temp file, then bash "$INSTALL_SCRIPT"
   - curl -fsSL https://claude.ai/install.sh | bash -s latest → download to temp file, then bash "$INSTALL_SCRIPT" latest (dropped the '--' separator as it was the shell's option terminator, not the script's)

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed all 6 script injection locations in .github/workflows/test-settings.yml by moving ${{ steps.*.outputs.* }} expressions out of run: shell strings and into env: blocks. Affected steps: 'Verify echo worked' (inline-allow job), 'Verify echo was denied' (inline-deny job), 'Verify echo worked' (file-allow job), and 'Verify echo was denied' (file-deny job). Shell scripts now reference OUTPUT_FILE and CONCLUSION as plain environment variables.

