<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.178

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.178** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks.

- ci.yml: `actions/checkout@v6` (×3), `oven-sh/setup-bun@v2` (×2), `oven-sh/setup-bun@v1` (×1)
- claude-review.yml: `actions/checkout@v6`, `anthropics/claude-code-action@v1`
- claude.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- issue-triage.yml: `actions/checkout@v6`, `anthropics/claude-code-action@main`
- release.yml: `actions/checkout@v6` (×3)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:22`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:33`
- `.github/workflows/ci.yml:36`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:19`
- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:26`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`
- `.github/workflows/release.yml:30`
- `.github/workflows/release.yml:95`
- `.github/workflows/release.yml:120`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. Without explicit permissions, the workflow inherits the default repository token permissions, which may be broader than necessary.

Locations:

- `.github/workflows/ci.yml:1`

### script-injection (severity: high)

Multiple `run:` blocks interpolate `${{ ... }}` expressions directly into shell commands, bypassing shell quoting and enabling script injection.

(a) action.yml — 'Revoke app token' step: `${{ steps.run.outputs.github_token }}` is interpolated directly into a curl `-H "Authorization: Bearer ..."` header string inside a `run:` block. Any newline or shell metacharacter in the step output would be interpreted by the shell.

(b) release.yml — 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` — the tag value comes from git tags on the repo and is interpolated directly into the shell script. 'Display dry run info', 'Create and push tag', and 'Create Release' steps also interpolate `${{ steps.next_version.outputs.next_version }}` directly. The 'Update major version tag' job interpolates `${{ needs.create-release.outputs.next_version }}` directly.

(c) sync-base-action.yml — 'Setup SSH and clone target repository' step: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` — a secrets context expression is interpolated directly into the shell command.

(d) test-base-action.yml, test-settings.yml, test-custom-executables.yml, test-structured-output.yml — verification steps interpolate `${{ steps.*.outputs.execution_file }}`, `${{ steps.*.outputs.conclusion }}`, and `${{ steps.*.outputs.structured_output }}` directly into `run:` blocks.

Locations:

- `action.yml:393`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:52`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:73`
- `.github/workflows/release.yml:100`
- `.github/workflows/sync-base-action.yml:24`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:39`
- `.github/workflows/test-base-action.yml:87`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-settings.yml:38`
- `.github/workflows/test-settings.yml:39`
- `.github/workflows/test-custom-executables.yml:60`
- `.github/workflows/test-custom-executables.yml:61`
- `.github/workflows/test-structured-output.yml:42`

### github-env-injection (severity: high)

Several `run:` blocks write values derived from untrusted inputs to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`).

(a) action.yml — 'Setup Custom Bun Path' step: `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (caller-controlled). The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without sanitizing newlines. An attacker-supplied path containing a newline could inject arbitrary entries into PATH.

(b) base-action/action.yml — 'Setup Custom Bun Path' step: identical pattern — `BUN_DIR` derived from `inputs.path_to_bun_executable` written to `$GITHUB_PATH` unsanitized.

(c) base-action/action.yml — 'Install Claude Code' step: `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (caller-controlled). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitizing newlines.

Locations:

- `action.yml:218`
- `base-action/action.yml:131`
- `base-action/action.yml:158`

### unsafe-shell (severity: high)

Several `run:` blocks pipe remote content directly to a shell interpreter without first downloading and verifying the script.

(a) base-action/action.yml — 'Install Claude Code' step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant inside a `bash -c` string with `timeout`). The install script is fetched and executed in a single pipeline with no integrity check.

(b) .github/workflows/test-custom-executables.yml — 'Install Bun manually' step: `curl -fsSL https://bun.sh/install | bash`. 'Install Claude Code manually' step: `curl -fsSL https://claude.ai/install.sh | bash -s latest`. Both fetch and execute remote scripts without verification.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`
- `.github/workflows/test-custom-executables.yml:21`
- `.github/workflows/test-custom-executables.yml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 security findings:

1. unpinned-uses: Pinned all action references to full SHAs - actions/checkout@v6 → @df4cb1c069e1874edd31b4311f1884172cec0e10, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → @af0559ee4f514d1ef21826982bed13f7edc3c35e across ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. missing-permissions: Added `permissions: contents: read` top-level block to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks in action.yml (Revoke app token), release.yml (5 steps), sync-base-action.yml (Setup SSH), test-base-action.yml (2 verify steps), test-settings.yml (4 verify steps), test-custom-executables.yml (1 verify step), and test-structured-output.yml (5 verify steps).

4. github-env-injection: Added `safe_var=$(printf '%s' "$VAR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH in action.yml's Setup Custom Bun Path step and both Setup Custom Bun Path and Install Claude Code steps in base-action/action.yml.

5. unsafe-shell: Replaced curl|bash patterns with download-to-tempfile-then-execute patterns in base-action/action.yml's Install Claude Code step and test-custom-executables.yml's Install Bun manually and Install Claude Code manually steps.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:

1. hardened/action/.github/workflows/test-structured-output.yml (line 296): Moved all `${{ needs.*.result }}` expressions from the `run:` shell block into an `env:` block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE variables. Replaced inline ternary expressions with a `pass_or_fail()` shell function and replaced the multi-condition `ALL_PASSED=${{ ... }}` with proper shell `[ ... ] && [ ... ]` conditionals.

2. hardened/action/.github/workflows/test-base-action.yml (line 71): Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc delimiter allowed shell metacharacter expansion of the user-controlled PROMPT value; the printf approach safely writes the variable content without any shell interpretation.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/agent-approval-check/action.yml line 59: moved `${{ github.action_path }}` out of the `run:` shell command string and into the step's `env:` block as `ACTION_PATH: ${{ github.action_path }}`. The shell command now references it as `"$ACTION_PATH/agent_approval_check.py"` instead of `"${{ github.action_path }}/agent_approval_check.py"`.

