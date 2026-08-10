<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.177

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.177** was hardened automatically. 3 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates a ${{ }} expression inside the run: shell command string. The line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds the expression directly in the shell script before the shell ever sees it. Although `steps.*.outputs.*` is not attacker-controlled in the same way as `github.head_ref`, any ${{ }} expression inside a run: block is a script-injection finding per the check rules, as YAML template substitution occurs before the shell quotes the value.

Locations:

- `action.yml:491`

### github-env-injection (severity: high)

Multiple steps write values derived from user-controlled inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

1. action.yml 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written to `$GITHUB_PATH` with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — no newline sanitization.

2. base-action/action.yml 'Setup Custom Bun Path' step: same pattern — `PATH_TO_BUN_EXECUTABLE` from `${{ inputs.path_to_bun_executable }}` written to `$GITHUB_PATH` without sanitization.

3. base-action/action.yml 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` from `${{ inputs.path_to_claude_code_executable }}` is used to compute `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")`, then written to `$GITHUB_PATH` with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — no newline sanitization.

Locations:

- `action.yml:244`
- `base-action/action.yml:138`
- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes the output of a remote curl request directly to bash without first saving to a file and verifying it. Two occurrences:
1. `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`
2. `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`
This pattern executes remotely-fetched content directly in a shell, which is a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:153`
- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all three findings:

1. script-injection (action.yml ~line 491): In the 'Revoke app token' step, moved `${{ steps.run.outputs.github_token }}` out of the run: shell command into an env: block as APP_GITHUB_TOKEN, then referenced it as $APP_GITHUB_TOKEN in the curl command.

2. github-env-injection (3 locations):
   - action.yml 'Setup Custom Bun Path': Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH
   - base-action/action.yml 'Setup Custom Bun Path': Same sanitization pattern added
   - base-action/action.yml 'Install Claude Code': Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH

3. unsafe-shell (base-action/action.yml lines 153, 155): Replaced both `curl -fsSL https://claude.ai/install.sh | bash -s -- $VERSION` patterns with a download-then-execute approach using a temp file (`mktemp`). The `--` was dropped as it was the shell's own option terminator in the pipe form (not the script's argument), so the script now correctly receives CLAUDE_CODE_VERSION as $1. Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all four finding types:

1. script-injection: Moved all ${{ }} expressions from run: blocks to env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA env vars), sync-base-action.yml (DEPLOY_KEY), test-base-action.yml (OUTPUT_FILE, CONCLUSION), test-custom-executables.yml (OUTPUT_FILE, CONCLUSION), test-settings.yml (OUTPUT_FILE, CONCLUSION in all four verify steps), and test-structured-output.yml (OUTPUT, FILE, and all needs.*.result expressions replaced with env vars + shell conditionals).

2. unpinned-uses: Pinned all mutable action references to full 40-char SHAs: actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main→6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975.

3. missing-permissions: Added top-level `permissions: contents: read` to ci.yml.

4. unsafe-shell: Replaced both `curl ... | bash` pipes in test-custom-executables.yml with download-then-execute pattern using mktemp. The claude.ai/install.sh script receives 'latest' as $1 (no '--' prefix since that was the shell's option terminator, not the script's argument).

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml: moved `${{ github.action_path }}` out of the `run:` shell command and into the `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now uses `python "$ACTION_PATH/agent_approval_check.py"` instead of embedding the expression directly.

