<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **anthropics--claude-code-action/v1.0.69** was hardened automatically. 5 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Multiple workflow run: blocks directly interpolate ${{ }} expressions. In release.yml, the 'Calculate next version' step uses `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"` in a run: block; 'Create and push tag' and 'Create Release' steps use `next_version="${{ steps.next_version.outputs.next_version }}"`; 'Update major version tag' uses `next_version="${{ needs.create-release.outputs.next_version }}"`; 'Display dry run info' uses `${{ github.sha }}`. In test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml, run: blocks use `${{ steps.*.outputs.execution_file }}`, `${{ steps.*.outputs.conclusion }}`, and `${{ steps.*.outputs.structured_output }}` directly in shell commands.

Locations:

- `.github/workflows/release.yml:47`
- `.github/workflows/release.yml:60`
- `.github/workflows/release.yml:68`
- `.github/workflows/release.yml:76`
- `.github/workflows/release.yml:95`
- `.github/workflows/test-base-action.yml:33`
- `.github/workflows/test-base-action.yml:34`
- `.github/workflows/test-base-action.yml:80`
- `.github/workflows/test-base-action.yml:81`
- `.github/workflows/test-custom-executables.yml:55`
- `.github/workflows/test-custom-executables.yml:56`
- `.github/workflows/test-settings.yml:30`
- `.github/workflows/test-settings.yml:31`
- `.github/workflows/test-settings.yml:82`
- `.github/workflows/test-settings.yml:110`
- `.github/workflows/test-settings.yml:111`
- `.github/workflows/test-settings.yml:155`
- `.github/workflows/test-structured-output.yml:40`
- `.github/workflows/test-structured-output.yml:82`
- `.github/workflows/test-structured-output.yml:122`
- `.github/workflows/test-structured-output.yml:162`
- `.github/workflows/test-structured-output.yml:196`

### unpinned-uses (severity: high)

Multiple workflow files reference actions by mutable tags or branch names instead of full 40-character SHA digests. ci.yml: actions/checkout@v6, oven-sh/setup-bun@v2, oven-sh/setup-bun@v1. claude-review.yml: actions/checkout@v6, anthropics/claude-code-action@v1. claude.yml: actions/checkout@v6, anthropics/claude-code-action@main. issue-triage.yml: actions/checkout@v6, anthropics/claude-code-action@main. release.yml: actions/checkout@v6 (used in two jobs).

Locations:

- `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:12`
- `.github/workflows/ci.yml:23`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:34`
- `.github/workflows/ci.yml:36`
- `.github/workflows/claude-review.yml:14`
- `.github/workflows/claude-review.yml:19`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:29`
- `.github/workflows/issue-triage.yml:16`
- `.github/workflows/issue-triage.yml:21`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:88`
- `.github/workflows/release.yml:113`

### missing-permissions (severity: medium)

Several workflow files have no top-level permissions: block and no job-level permissions: blocks on any job, meaning they run with the default (potentially broad) token permissions. Affected files: ci.yml, test-base-action.yml, test-custom-executables.yml, test-mcp-servers.yml, test-settings.yml.

Locations:

- `.github/workflows/ci.yml:1`
- `.github/workflows/test-base-action.yml:1`
- `.github/workflows/test-custom-executables.yml:1`
- `.github/workflows/test-mcp-servers.yml:1`
- `.github/workflows/test-settings.yml:1`

### unsafe-shell (severity: high)

Remote content is piped directly to a shell interpreter without first downloading to a file for inspection. In test-custom-executables.yml: `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`. In base-action/action.yml: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (inside a timeout wrapper and also directly).

Locations:

- `.github/workflows/test-custom-executables.yml:16`
- `.github/workflows/test-custom-executables.yml:25`
- `base-action/action.yml:107`
- `base-action/action.yml:109`

### github-env-injection (severity: high)

In action.yml and base-action/action.yml, the 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived via `dirname` from the caller-controlled input `inputs.path_to_bun_executable`, mapped to env var PATH_TO_BUN_EXECUTABLE) to $GITHUB_PATH without sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Similarly, base-action/action.yml's 'Install Claude Code' step writes `$CLAUDE_DIR` (derived from `inputs.path_to_claude_code_executable`) to $GITHUB_PATH without sanitization. Neither value is passed through `printf '%s' ... | tr -d '\n\r'` before the write.

Locations:

- `action.yml:175`
- `base-action/action.yml:91`
- `base-action/action.yml:113`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 findings across multiple files:

1. script-injection: Moved all ${{ }} expressions from run: shell script bodies into env: blocks in release.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. The test-structured-output.yml summary job was rewritten to use env vars instead of inline ${{ }} ternary expressions.

2. unpinned-uses: Pinned all mutable tag/branch references to full 40-char SHAs: actions/checkout@v6→df4cb1c069e1874edd31b4311f1884172cec0e10, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main→37b464ce72700f7b2c5ff8d2db7fa7b15df792f5.

3. missing-permissions: Added top-level `permissions: contents: read` to ci.yml, test-base-action.yml, test-custom-executables.yml, test-mcp-servers.yml, and test-settings.yml.

4. unsafe-shell: Replaced `curl -fsSL ... | bash` patterns with download-then-execute approach (curl to /tmp file, then bash /tmp/file, then rm) in test-custom-executables.yml and base-action/action.yml.

5. github-env-injection: Added `printf '%s' ... | tr -d '\n\r'` sanitization before writing BUN_DIR to GITHUB_PATH in action.yml and base-action/action.yml, and before writing CLAUDE_DIR to GITHUB_PATH in base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection findings:
1. hardened/action/action.yml (line 261): Moved `${{ steps.run.outputs.github_token }}` out of the 'Revoke app token' run: shell command into an env: block as APP_TOKEN. The curl command now uses `$APP_TOKEN` instead of the inline expression.
2. hardened/action/.github/workflows/sync-base-action.yml (line 30): Moved `${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}` out of the 'Setup SSH and clone target repository' run: shell command into an env: block as DEPLOY_KEY. The echo command now uses `$DEPLOY_KEY` instead of the inline expression.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In .github/workflows/test-base-action.yml, replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc allowed shell command substitution (backticks, `$(...)`) on the content, creating a script injection risk when `test_prompt` contained malicious input. The `printf '%s\n'` form treats the variable value as a literal string argument, eliminating the injection vector while still correctly writing the prompt to the file.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line ~57). Added sanitization of the `next_version` value before writing to $GITHUB_OUTPUT: introduced `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and changed the echo to use `safe_next_version` instead of `next_version`. Also properly quoted `"$GITHUB_OUTPUT"` in the echo redirection.

