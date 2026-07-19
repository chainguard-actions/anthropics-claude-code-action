<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.69** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, the expression `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any expression inside a run: block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing an attacker-controlled or malformed token value to inject shell metacharacters.

Locations:

- `action.yml:196`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via the `PATH_TO_BUN_EXECUTABLE` env var) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline in the input value could inject arbitrary entries into PATH. The same pattern appears in base-action/action.yml. Additionally, base-action/action.yml 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable` via `PATH_TO_CLAUDE_CODE_EXECUTABLE`) to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:163`
- `base-action/action.yml:97`
- `base-action/action.yml:131`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading and verifying the script: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a second variant inside a timeout wrapper). If the remote URL is compromised or the connection is intercepted, arbitrary code will execute on the runner.

Locations:

- `base-action/action.yml:120`
- `base-action/action.yml:123`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed three security findings:

1. script-injection (action.yml): Moved `${{ steps.run.outputs.github_token }}` from the 'Revoke app token' run: shell string into the step's env: block as APP_TOKEN, then referenced it as $APP_TOKEN in the shell script.

2. github-env-injection (action.yml + base-action/action.yml): Added `printf '%s' "$VAR" | tr -d '\n\r'` sanitization before writing BUN_DIR to $GITHUB_PATH in action.yml's 'Setup Custom Bun Path' step, and in base-action/action.yml's 'Setup Custom Bun Path' step. Also sanitized CLAUDE_DIR before writing to $GITHUB_PATH in base-action/action.yml's 'Install Claude Code' step.

3. unsafe-shell (base-action/action.yml): Replaced both `curl -fsSL ... | bash` patterns with a download-then-execute approach: download the install script to a mktemp file, then execute it separately. The temp file is cleaned up after use in both success and failure paths.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four finding types across multiple workflow files:

1. unpinned-uses: Pinned all mutable action references to full SHA hashes in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml. actions/checkout@v6→df4cb1c, oven-sh/setup-bun@v2→0c5077e, oven-sh/setup-bun@v1→f4d14e0, anthropics/claude-code-action@v1 and @main→af0559e.

2. missing-permissions: Added 'permissions: contents: read' top-level blocks to ci.yml, test-base-action.yml, test-custom-executables.yml, test-mcp-servers.yml, and test-settings.yml.

3. script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA), sync-base-action.yml (DEPLOY_KEY), test-base-action.yml (OUTPUT_FILE, CONCLUSION), test-custom-executables.yml (OUTPUT_FILE, CONCLUSION), test-settings.yml (OUTPUT_FILE, CONCLUSION), and test-structured-output.yml (OUTPUT for each job's verify step; BASIC_TYPES_RESULT etc. for summary job with shell conditionals replacing inline ${{ needs.*.result }} ternary expressions).

4. unsafe-shell: Fixed curl-pipe-to-bash patterns in test-custom-executables.yml by downloading scripts to /tmp files first, then executing them separately, then removing the temp files.

