<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.210

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.210** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. The line reads: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, bypassing shell quoting.

Locations:

- `agent-approval-check/action.yml:49`

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. `steps.*.outputs.*` is an untrusted context per the check rules, and any `${{ ... }}` directly in a `run:` block is a script-injection finding.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the variable `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which is set from `inputs.path_to_bun_executable`) and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into `$GITHUB_PATH`. The same pattern exists in both action.yml and base-action/action.yml.

Locations:

- `action.yml:196`
- `base-action/action.yml:121`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the variable `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which is set from `inputs.path_to_claude_code_executable`) and written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines could inject arbitrary entries into `$GITHUB_PATH`.

Locations:

- `base-action/action.yml:155`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash` (and a variant: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). This is unsafe because the script is downloaded and executed in a single pipeline without first verifying its integrity, allowing a compromised or MitM'd remote server to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:140`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml line 49: Moved `${{ github.action_path }}` out of run: block into env: block as ACTION_PATH variable.
2. action.yml line 399 (Revoke app token): Moved `${{ steps.run.outputs.github_token }}` out of run: block into env: block as APP_TOKEN variable.
3. action.yml line 196 (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.
4. base-action/action.yml line 121 (Setup Custom Bun Path): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to GITHUB_PATH.
5. base-action/action.yml line 140/155 (Install Claude Code): Replaced `curl -fsSL ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern (curl to temp file, then bash on the file). Also added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing CLAUDE_DIR to GITHUB_PATH. The '--' was dropped as required since it was the shell's option terminator, not the script's.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, missing-permissions, unsafe-shell

**Notes:**

Fixed all four findings across 7 workflow files:

1. unpinned-uses: Pinned all action references to full commit SHAs:
   - actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@v1 and @main → @a874e9ecd7bb36efdad65429c6b35815f5a08f10
   Applied to: ci.yml, claude-review.yml, claude.yml, issue-triage.yml, release.yml

2. script-injection: Moved all ${{ }} expressions from run: shell scripts into step env: blocks in:
   - release.yml: Calculate next version, Display dry run info, Create and push tag, Create Release, Update major version tag steps
   - test-base-action.yml: Verify inline prompt output, Verify prompt file output steps
   - test-custom-executables.yml: Verify custom executables worked step
   - test-structured-output.yml: All 5 Verify outputs steps
   - test-settings.yml: All 4 Verify steps

3. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml

4. unsafe-shell: Fixed test-custom-executables.yml by downloading install scripts to temp files (mktemp) before executing. Dropped the shell's -s and -- from the pipe form for claude.ai/install.sh, keeping only the 'latest' positional argument.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:

1. hardened/action/.github/workflows/sync-base-action.yml (line 30): Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` from direct shell interpolation to an `env:` block as `DEPLOY_KEY`. Changed `echo "${{ ... }}" > ~/.ssh/deploy_key_base` to `printf '%s\n' "$DEPLOY_KEY" > ~/.ssh/deploy_key_base`.

2. hardened/action/.github/workflows/test-structured-output.yml (lines 333-342): Moved all five `${{ needs.*.result }}` expressions and the multi-line ALL_PASSED expression to an `env:` block with variables RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, RESULT_EXECUTION_FILE. Replaced inline GitHub Actions ternary expressions with standard shell conditionals to compute pass/fail labels and determine overall success.

