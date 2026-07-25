<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.176

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.176** was hardened automatically. 17 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ steps.run.outputs.github_token }} is interpolated directly inside a run: shell command string in the 'Revoke app token' step. The expression is embedded in a curl -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" command, allowing the step output value to be injected into the shell before quoting.

Locations:

- `action.yml:381`

### script-injection (severity: high)

Sub-rule (a): Multiple ${{ }} expressions are interpolated directly inside run: shell command strings in release.yml. Affected steps: 'Calculate next version' uses ${{ steps.get_latest_tag.outputs.latest_tag }} in a variable assignment; 'Display dry run info' uses ${{ steps.next_version.outputs.next_version }}, ${{ github.sha }}, and ${{ steps.get_latest_tag.outputs.latest_tag }} in echo commands; 'Create and push tag' uses ${{ steps.next_version.outputs.next_version }}; 'Create Release' uses ${{ steps.next_version.outputs.next_version }}; 'Update major version tag' uses ${{ needs.create-release.outputs.next_version }}. All of these are steps.*/needs.*/github.* contexts injected directly into shell commands.

Locations:

- `.github/workflows/release.yml:40`
- `.github/workflows/release.yml:55`
- `.github/workflows/release.yml:65`
- `.github/workflows/release.yml:75`
- `.github/workflows/release.yml:100`

### script-injection (severity: high)

Sub-rule (a): ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} is interpolated directly inside a run: shell command string in the 'Setup SSH and clone target repository' step: echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base. Any ${{ }} expression in a run: block is a script-injection finding.

Locations:

- `.github/workflows/sync-base-action.yml:25`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.*.outputs.execution_file }} and ${{ steps.*.outputs.conclusion }} are interpolated directly inside run: shell command strings in test-base-action.yml. The 'Verify inline prompt output' step uses OUTPUT_FILE="${{ steps.inline-test.outputs.execution_file }}" and CONCLUSION="${{ steps.inline-test.outputs.conclusion }}"; the 'Verify prompt file output' step uses the same pattern with steps.prompt-file-test.outputs.*.

Locations:

- `.github/workflows/test-base-action.yml:35`
- `.github/workflows/test-base-action.yml:80`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.custom-test.outputs.execution_file }} and ${{ steps.custom-test.outputs.conclusion }} are interpolated directly inside a run: shell command string in the 'Verify custom executables worked' step of test-custom-executables.yml.

Locations:

- `.github/workflows/test-custom-executables.yml:60`

### script-injection (severity: high)

Sub-rule (a): ${{ steps.test.outputs.structured_output }} is interpolated directly inside run: shell command strings in multiple 'Verify' steps of test-structured-output.yml. The pattern OUTPUT='${{ steps.test.outputs.structured_output }}' appears in at least 5 separate run: blocks (test-basic-types, test-complex-types, test-edge-cases, test-name-sanitization, test-execution-file-structure jobs). Additionally, ${{ needs.*.result }} expressions are interpolated directly in the 'Generate Summary' run: block.

Locations:

- `.github/workflows/test-structured-output.yml:45`
- `.github/workflows/test-structured-output.yml:115`
- `.github/workflows/test-structured-output.yml:185`
- `.github/workflows/test-structured-output.yml:255`
- `.github/workflows/test-structured-output.yml:320`
- `.github/workflows/test-structured-output.yml:360`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (an untrusted input), then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes echo "$BUN_DIR" >> "$GITHUB_PATH" without the required sanitization step (printf '%s' ... | tr -d '\n\r'). A caller-controlled newline in the input value can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:218`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml sets PATH_TO_BUN_EXECUTABLE from inputs.path_to_bun_executable (an untrusted input), then computes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and writes echo "$BUN_DIR" >> "$GITHUB_PATH" without sanitization. Additionally, the 'Install Claude Code' step sets PATH_TO_CLAUDE_CODE_EXECUTABLE from inputs.path_to_claude_code_executable and writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH without sanitization.

Locations:

- `base-action/action.yml:130`
- `base-action/action.yml:160`

### github-env-injection (severity: high)

In release.yml, the 'Calculate next version' step reads latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}" (a steps.*.outputs.* untrusted source) and then writes echo "next_version=$next_version" >> $GITHUB_OUTPUT without sanitization. A newline embedded in the step output could inject additional key=value pairs into $GITHUB_OUTPUT.

Locations:

- `.github/workflows/release.yml:50`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION (and a variant wrapped in timeout ... bash -c "curl ... | bash ..."). The script is not downloaded to a file first and verified before execution.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:158`

### unsafe-shell (severity: high)

The test-custom-executables.yml workflow pipes remote content directly to bash in two steps: (1) 'Install Bun manually': curl -fsSL https://bun.sh/install | bash; (2) 'Install Claude Code manually': curl -fsSL https://claude.ai/install.sh | bash -s latest. Neither script is downloaded to a file first and verified before execution.

Locations:

- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:31`

### unpinned-uses (severity: high)

ci.yml uses unpinned action references: actions/checkout@v6 (tag, not SHA), oven-sh/setup-bun@v2 (tag, not SHA), oven-sh/setup-bun@v1 (tag, not SHA). These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/ci.yml:9`
- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:38`

### unpinned-uses (severity: high)

claude-review.yml uses unpinned action references: actions/checkout@v6 (tag) and anthropics/claude-code-action@v1 (tag). These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/claude-review.yml:15`
- `.github/workflows/claude-review.yml:20`

### unpinned-uses (severity: high)

claude.yml uses unpinned action references: actions/checkout@v6 (tag) and anthropics/claude-code-action@main (mutable branch ref). These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/claude.yml:22`
- `.github/workflows/claude.yml:28`

### unpinned-uses (severity: high)

issue-triage.yml uses unpinned action references: actions/checkout@v6 (tag) and anthropics/claude-code-action@main (mutable branch ref). These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/issue-triage.yml:18`
- `.github/workflows/issue-triage.yml:23`

### unpinned-uses (severity: high)

release.yml uses unpinned action references: actions/checkout@v6 (tag) appears in both the create-release and update-major-tag jobs. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/release.yml:32`
- `.github/workflows/release.yml:90`

### permissions (severity: medium)

missing-permissions: ci.yml has no top-level permissions: key and none of its three jobs (test, prettier, typecheck) have job-level permissions: keys. Without explicit permissions, the workflow inherits the default token permissions which may be overly broad.

Locations:

- `.github/workflows/ci.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell, unpinned-uses, permissions

**Notes:**

Fixed all 17 findings across 9 files:

**action.yml**: (1) Moved ${{ steps.run.outputs.github_token }} to env block (APP_TOKEN) in 'Revoke app token' step. (2) Added printf sanitization for BUN_DIR before writing to GITHUB_PATH in 'Setup Custom Bun Path'.

**base-action/action.yml**: (1) Added printf sanitization for BUN_DIR in 'Setup Custom Bun Path'. (2) Fixed 'Install Claude Code': changed curl|bash to download-then-execute pattern using mktemp; added printf sanitization for CLAUDE_DIR before writing to GITHUB_PATH.

**release.yml**: (1) Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803 in both jobs. (2) Moved all ${{ steps.*.outputs.* }}, ${{ github.sha }}, and ${{ needs.*.outputs.* }} expressions to env blocks. (3) Added printf sanitization for latest_tag and next_version before writing to GITHUB_OUTPUT.

**sync-base-action.yml**: Moved ${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }} to env block as DEPLOY_KEY.

**test-base-action.yml**: Moved ${{ steps.inline-test.outputs.* }} and ${{ steps.prompt-file-test.outputs.* }} to env blocks in both verify steps.

**test-custom-executables.yml**: (1) Fixed 'Install Bun manually': curl|bash → download-then-execute. (2) Fixed 'Install Claude Code manually': curl|bash → download-then-execute. (3) Moved ${{ steps.custom-test.outputs.* }} to env block in 'Verify custom executables worked'.

**test-structured-output.yml**: Moved ${{ steps.test.outputs.structured_output }} to env blocks in all 5 verify steps; moved all ${{ needs.*.result }} expressions to env block in 'Generate Summary' step.

**ci.yml**: (1) Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803. (2) Pinned oven-sh/setup-bun@v2 to SHA 0c5077e51419868618aeaa5fe8019c62421857d6. (3) Pinned oven-sh/setup-bun@v1 to SHA f4d14e03ff726c06358e5557344e1da148b56cf7. (4) Added top-level permissions: contents: read.

**claude-review.yml**: Pinned actions/checkout@v6 and anthropics/claude-code-action@v1 to full SHAs.

**claude.yml**: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

**issue-triage.yml**: Pinned actions/checkout@v6 and anthropics/claude-code-action@main to full SHAs.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed all script injection findings by moving ${{ }} expressions from run: shell strings into env: blocks:
1. agent-approval-check/action.yml: Added ACTION_PATH env var for github.action_path and updated the python command to use $ACTION_PATH.
2. .github/workflows/test-settings.yml: Moved steps.*.outputs.execution_file and steps.*.outputs.conclusion expressions into env: blocks for all four verification steps (inline-allow verify, inline-deny verify, file-allow verify, file-deny verify). Shell scripts now reference plain $OUTPUT_FILE and $CONCLUSION environment variables.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF / ${PROMPT} / EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The unquoted heredoc delimiter caused bash to perform full shell expansion on the body, meaning attacker-controlled command substitutions in the test_prompt input would be executed. The printf approach safely writes the variable's value as a literal string without any shell expansion of its contents.

