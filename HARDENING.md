<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.181

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.181** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In agent-approval-check/action.yml, the step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Although `github.action_path` is not attacker-controlled, any `${{ ... }}` expression inside a run: block is a script-injection finding per the check rules, as the value flows through YAML template substitution before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:52`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In the 'Revoke app token' step of action.yml, the curl command contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly in the run: block. The value `steps.run.outputs.github_token` flows through YAML template substitution before the shell processes it, enabling script injection if the output contains shell metacharacters.

Locations:

- `action.yml:374`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (an untrusted input) via env:, then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:228`
- `base-action/action.yml:107`

### github-env-injection (severity: high)

The 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from inputs.path_to_claude_code_executable (an untrusted input) via env:, then computes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A newline-containing input value could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:152`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and also inside a `timeout ... bash -c "curl ... | bash -s -- $CLAUDE_CODE_VERSION"`). This downloads and executes a remote script without first saving it to a file for inspection, creating a supply-chain risk if the remote URL is compromised.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` out of the `run: python "${{ github.action_path }}/..."` command into an `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell command.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` out of the curl `-H "Authorization: Bearer ${{ ... }}"` argument into an `env:` block as `APP_TOKEN`, then referenced it as `$APP_TOKEN`.

3. action.yml (github-env-injection, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path step): Same sanitization fix as #3.

5. base-action/action.yml (unsafe-shell + github-env-injection, Install Claude Code step): Changed `curl ... | bash` and `timeout ... bash -c "curl ... | bash"` patterns to first download the install script to a temp file (`mktemp`), then execute it separately. Also added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`. The temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all four findings across multiple workflow files:

1. unpinned-uses: Pinned all action references to full SHA digests - actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → 44423bdec74b97d67543eb16c110546762c110b2.

2. missing-permissions: Added 'permissions: contents: read' to ci.yml top-level.

3. script-injection: Moved all ${{ }} expressions from run: shell strings into env: blocks in release.yml (5 steps), sync-base-action.yml (1 step using printf for the deploy key), test-base-action.yml (2 steps), test-custom-executables.yml (1 step), test-settings.yml (4 steps), and test-structured-output.yml (5 verify steps + rewrote Generate Summary to use shell conditionals instead of ${{ ternary }} expressions).

4. unsafe-shell: Fixed test-custom-executables.yml to download Bun and Claude Code installers to temp files (/tmp/bun-install.sh and /tmp/claude-install.sh) before executing them separately, eliminating the curl|bash pipe pattern.

