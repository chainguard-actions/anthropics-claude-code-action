<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.190

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.190** was hardened automatically. 5 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates ${{ steps.run.outputs.github_token }} inside a run: shell command string — specifically in the curl -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" line. Any ${{ ... }} expression directly in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, bypassing shell quoting.

Locations:

- `action.yml:558`

### script-injection (severity: high)

Sub-rule (a): The step 'run: python "${{ github.action_path }}/agent_approval_check.py"' directly interpolates ${{ github.action_path }} inside a run: shell command string. Any ${{ ... }} expression directly in a run: block is a script-injection risk regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:47`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps inputs.path_to_bun_executable to the PATH_TO_BUN_EXECUTABLE env var, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes it to $GITHUB_PATH with 'echo "$BUN_DIR" >> "$GITHUB_PATH"' — without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input.path_to_bun_executable value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:271`
- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action maps inputs.path_to_claude_code_executable to PATH_TO_CLAUDE_CODE_EXECUTABLE env var, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes it to $GITHUB_PATH with 'echo "$CLAUDE_DIR" >> "$GITHUB_PATH"' — without the required sanitization step (printf '%s' ... | tr -d '\n\r'). An attacker-controlled input value containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:183`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: 'curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION' (and a variant inside a timeout wrapper). The install script is fetched from the network and executed immediately without first downloading to a file for inspection.

Locations:

- `base-action/action.yml:168`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. action.yml (Revoke app token, line 558): Moved `${{ steps.run.outputs.github_token }}` to env block as APP_TOKEN, referenced as $APP_TOKEN in curl -H.

2. agent-approval-check/action.yml (line 47): Moved `${{ github.action_path }}` to env block as ACTION_PATH, merged all env vars into single block, referenced as $ACTION_PATH in run: command.

3. action.yml (Setup Custom Bun Path, line 271): Replaced `echo "$BUN_DIR" >> "$GITHUB_PATH"` with `printf '%s' "$BUN_DIR" | tr -d '\n\r' >> "$GITHUB_PATH"` + trailing newline.

4. base-action/action.yml (Setup Custom Bun Path, line 148): Same fix as #3.

5. base-action/action.yml (Install Claude Code, lines 168+183): Fixed unsafe-shell by downloading install.sh to a temp file then executing it (dropping the `--` shell option terminator from the pipe form); fixed github-env-injection for CLAUDE_DIR with printf+tr sanitization before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** unpinned-uses, unsafe-shell, script-injection, missing-permissions

**Notes:**

Fixed all four findings:

1. **unpinned-uses**: Pinned all mutable action references to full SHAs:
   - actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803 (in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, release.yml)
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7
   - anthropics/claude-code-action@v1 → @5ef2e550a465a721f4f45e4a7d3c340c873e1dcc
   - anthropics/claude-code-action@main → @5ef2e550a465a721f4f45e4a7d3c340c873e1dcc

2. **unsafe-shell**: Fixed both curl-pipe-to-bash patterns in test-custom-executables.yml by downloading to a temp file first, then executing. For the Claude installer, dropped the shell's `-s` and `--` options (passing `latest` directly as $1 to the script).

3. **script-injection**: Moved all ${{ }} expressions out of run: blocks into env: blocks across release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, and test-structured-output.yml. In test-structured-output.yml, the needs.*.result ternary expressions were moved to env vars in the summary job.

4. **missing-permissions**: Added `permissions: contents: read` top-level block to ci.yml.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed all 6 script injection occurrences across 4 `run:` steps in `.github/workflows/test-settings.yml`. Each `${{ steps.*.outputs.* }}` expression was moved from inline shell string interpolation into the step's `env:` block, and the shell script now references them as plain quoted environment variables (`$OUTPUT_FILE`, `$CONCLUSION`). This prevents attacker-controlled step output values from being interpreted as shell commands before the shell parses the script.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line 59). Added sanitization of `next_version` before writing to $GITHUB_OUTPUT: the value is now passed through `printf '%s' "$next_version" | tr -d '\n\r'` and stored in `safe_next_version`, which is then written to $GITHUB_OUTPUT. Also quoted $GITHUB_OUTPUT as best practice.

