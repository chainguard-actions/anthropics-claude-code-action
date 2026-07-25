<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.183

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.183** was hardened automatically. 5 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (in the curl Authorization header). The `steps.*.outputs.*` context is an untrusted-input expression that flows through YAML template substitution before the shell sees it, enabling script injection. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:392`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:233`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization. An attacker-controlled input containing newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:163`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout` wrapper). If the remote URL is compromised or the connection is intercepted, arbitrary code executes on the runner.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across action.yml and base-action/action.yml:
1. script-injection (action.yml ~line 392): Moved `${{ steps.run.outputs.github_token }}` out of the 'Revoke app token' run: shell string into an env: block as GITHUB_APP_TOKEN, then referenced it as $GITHUB_APP_TOKEN in the curl Authorization header.
2. github-env-injection (action.yml ~line 233): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH in the 'Setup Custom Bun Path' step.
3. github-env-injection (base-action/action.yml ~line 131): Same sanitization fix for BUN_DIR in base-action's 'Setup Custom Bun Path' step.
4. github-env-injection (base-action/action.yml ~line 163): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH in the 'Install Claude Code' step.
5. unsafe-shell (base-action/action.yml ~lines 152,155): Replaced `curl ... | bash -s -- $VERSION` pattern with download-to-tempfile-then-execute pattern: `curl -fsSL -o "$INSTALL_SCRIPT" https://claude.ai/install.sh && bash "$INSTALL_SCRIPT" -- "$CLAUDE_CODE_VERSION"`, with proper tempfile cleanup.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four findings across multiple workflow files:

1. **unpinned-uses**: Pinned all action references to full SHAs:
   - actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@v1 → @be7b93b1907a4abad570368f3c74b6fe3807510b # v1
   - anthropics/claude-code-action@main → @be7b93b1907a4abad570368f3c74b6fe3807510b # main

2. **missing-permissions**: Added `permissions: contents: read` top-level block to ci.yml.

3. **script-injection**: Moved all ${{ }} expressions from run: script bodies into step env: blocks in release.yml (LATEST_TAG, NEXT_VERSION, COMMIT_SHA), test-base-action.yml (OUTPUT_FILE, CONCLUSION), test-custom-executables.yml (OUTPUT_FILE, CONCLUSION), and test-structured-output.yml (OUTPUT, FILE, and all needs.*.result values). The test-structured-output.yml summary job was rewritten using shell if/else instead of ${{ }} ternary expressions.

4. **unsafe-shell**: In test-custom-executables.yml, replaced both `curl ... | bash` patterns with download-then-execute: `curl -fsSL https://bun.sh/install -o /tmp/bun-install.sh && bash /tmp/bun-install.sh` and `curl -fsSL https://claude.ai/install.sh -o /tmp/claude-install.sh && bash /tmp/claude-install.sh latest`.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 52: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the $GITHUB_ACTION_PATH environment variable to the same value as `github.action_path`, so no additional env: mapping is needed. This removes the ${{ }} expression from the shell command string entirely, eliminating the script-injection risk.

### Iteration 4

**Fixes applied:** script-injection

**Notes:**

Fixed three script injection vulnerabilities: (1) sync-base-action.yml: moved secret CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY from direct ${{ }} interpolation in run: to an env: block, using printf for safe file writing; (2) test-settings.yml: moved all four steps.*.outputs.* expressions from direct run: interpolation to env: blocks across all four jobs (test-settings-inline-allow, test-settings-inline-deny, test-settings-file-allow, test-settings-file-deny); (3) test-base-action.yml: replaced unquoted heredoc expansion of user-controlled PROMPT variable with printf '%s\n' "$PROMPT" > test-prompt.txt to prevent command substitution injection.

