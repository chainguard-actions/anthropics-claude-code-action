<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.197

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.197** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ ... }} expressions are directly interpolated inside run: shell command strings in multiple workflow files and action.yml. This allows YAML template substitution to inject arbitrary shell content before the shell ever sees the string.

action.yml — 'Revoke app token' step: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

.github/workflows/release.yml — 'Calculate next version' step: `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`, and 'Create and push tag', 'Create Release', 'Update major version tag' steps: `next_version="${{ steps.next_version.outputs.next_version }}"`/`next_version="${{ needs.create-release.outputs.next_version }}"`

.github/workflows/sync-base-action.yml — 'Setup SSH and clone target repository' step: `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base`

.github/workflows/test-base-action.yml — 'Verify inline prompt output' and 'Verify prompt file output' steps: `OUTPUT_FILE="${{ steps.*.outputs.execution_file }}"`

.github/workflows/test-custom-executables.yml — 'Verify custom executables worked' step: `OUTPUT_FILE="${{ steps.custom-test.outputs.execution_file }}"`

.github/workflows/test-settings.yml — multiple 'Verify' steps: `OUTPUT_FILE="${{ steps.*.outputs.execution_file }}"`

.github/workflows/test-structured-output.yml — multiple 'Verify' steps: `OUTPUT='${{ steps.test.outputs.structured_output }}'` and `FILE="${{ steps.test.outputs.execution_file }}"`, and 'Generate Summary' step: `echo "... ${{ needs.*.result ... }}"` directly in shell.

Locations:

- `action.yml:499`
- `.github/workflows/release.yml:50`
- `.github/workflows/release.yml:64`
- `.github/workflows/release.yml:73`
- `.github/workflows/release.yml:86`
- `.github/workflows/release.yml:107`
- `.github/workflows/release.yml:120`
- `.github/workflows/sync-base-action.yml:24`
- `.github/workflows/test-base-action.yml:38`
- `.github/workflows/test-base-action.yml:39`
- `.github/workflows/test-base-action.yml:88`
- `.github/workflows/test-base-action.yml:89`
- `.github/workflows/test-custom-executables.yml:65`
- `.github/workflows/test-custom-executables.yml:66`
- `.github/workflows/test-settings.yml:40`
- `.github/workflows/test-settings.yml:41`
- `.github/workflows/test-settings.yml:84`
- `.github/workflows/test-settings.yml:116`
- `.github/workflows/test-settings.yml:117`
- `.github/workflows/test-settings.yml:160`
- `.github/workflows/test-structured-output.yml:47`
- `.github/workflows/test-structured-output.yml:100`
- `.github/workflows/test-structured-output.yml:153`
- `.github/workflows/test-structured-output.yml:206`
- `.github/workflows/test-structured-output.yml:247`
- `.github/workflows/test-structured-output.yml:268`

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character commit SHAs, making them vulnerable to supply-chain attacks if the referenced tag or branch is moved.

Failing references:
- actions/checkout@v6 (ci.yml, claude-review.yml, claude.yml, issue-triage.yml, release.yml)
- oven-sh/setup-bun@v2 (ci.yml)
- oven-sh/setup-bun@v1 (ci.yml)
- anthropics/claude-code-action@main (claude.yml, issue-triage.yml)
- anthropics/claude-code-action@v1 (claude-review.yml)

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:24`
- `.github/workflows/ci.yml:28`
- `.github/workflows/ci.yml:38`
- `.github/workflows/ci.yml:42`
- `.github/workflows/claude-review.yml:17`
- `.github/workflows/claude-review.yml:21`
- `.github/workflows/claude.yml:20`
- `.github/workflows/claude.yml:24`
- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:22`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:100`

### missing-permissions (severity: medium)

ci.yml has no top-level `permissions:` key and none of its three jobs (test, prettier, typecheck) define job-level `permissions:` blocks. Without explicit permissions, the workflow inherits the default repository permissions, which may be overly broad (e.g., write access to contents on some repository configurations).

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote scripts are fetched with curl and piped directly to bash without first downloading and inspecting them. This pattern executes whatever content the remote server returns, with no integrity check.

base-action/action.yml — 'Install Claude Code' step:
  `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`
  `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`

.github/workflows/test-custom-executables.yml — 'Install Bun manually' step:
  `curl -fsSL https://bun.sh/install | bash`

.github/workflows/test-custom-executables.yml — 'Install Claude Code manually' step:
  `curl -fsSL https://claude.ai/install.sh | bash -s latest`

Locations:

- `base-action/action.yml:119`
- `base-action/action.yml:121`
- `.github/workflows/test-custom-executables.yml:24`
- `.github/workflows/test-custom-executables.yml:35`

### github-env-injection (severity: high)

Input-derived values are written to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing newlines can inject additional entries into GITHUB_PATH or GITHUB_ENV.

action.yml — 'Setup Custom Bun Path' step: `inputs.path_to_bun_executable` is placed into env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is written directly to `$GITHUB_PATH` without sanitization.

base-action/action.yml — 'Setup Custom Bun Path' step: same pattern with `PATH_TO_BUN_EXECUTABLE` → `BUN_DIR` → `$GITHUB_PATH`.

base-action/action.yml — 'Install Claude Code' step: `inputs.path_to_claude_code_executable` is placed into env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is written directly to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:228`
- `base-action/action.yml:100`
- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell, github-env-injection

**Notes:**

Fixed all 5 security findings:

1. script-injection: Moved all ${{ }} expressions from run: shell strings to env: blocks across action.yml, release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

2. unpinned-uses: Pinned all action references to full commit SHAs - actions/checkout@v6→d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2→0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1→f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@main and @v1→5ee796a55f92566ecd7e39d70dd613abcbea0d7c.

3. missing-permissions: Added 'permissions: contents: read' to ci.yml.

4. unsafe-shell: Fixed curl|bash pipe patterns in base-action/action.yml and test-custom-executables.yml by downloading scripts to temp files first, then executing them separately. Dropped the '--' separator from the install.sh invocation as required (the '--' was the shell's option terminator, not the script's).

5. github-env-injection: Added sanitization using 'printf "%s" | tr -d "\n\r"' before writing BUN_DIR and CLAUDE_DIR to GITHUB_PATH in action.yml and base-action/action.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed two script-injection vulnerabilities: (1) In agent-approval-check/action.yml line 57, replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` — the built-in environment variable is safe because it doesn't go through YAML template substitution before the shell sees it. (2) In .github/workflows/test-base-action.yml line 79, replaced an unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s' "$PROMPT" > test-prompt.txt` — this safely writes the PROMPT variable to the file without allowing command substitution that could execute attacker-controlled content like `$(malicious command)` embedded in the prompt input.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line 67). Added sanitization of the `next_version` value before writing to $GITHUB_OUTPUT: `safe_next_version=$(printf '%s' "$next_version" | tr -d '\n\r')` and then writing `safe_next_version` instead of `next_version`. This prevents a malicious tag name containing newlines from injecting arbitrary key=value pairs into the GITHUB_OUTPUT file. Also quoted $GITHUB_OUTPUT properly.

