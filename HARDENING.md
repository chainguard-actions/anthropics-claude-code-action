<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.184

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.184** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks.

ci.yml: `actions/checkout@v6` (lines 11, 25, 40), `oven-sh/setup-bun@v2` (lines 13, 42), `oven-sh/setup-bun@v1` (line 27).
claude-review.yml: `actions/checkout@v6` (line 15), `anthropics/claude-code-action@v1` (line 20).
claude.yml: `actions/checkout@v6` (line 24), `anthropics/claude-code-action@main` (line 30).
issue-triage.yml: `actions/checkout@v6` (line 19), `anthropics/claude-code-action@main` (line 24).
release.yml: `actions/checkout@v6` (lines 30, 100, 130).

Locations:

- `.github/workflows/ci.yml:11`
- `.github/workflows/ci.yml:13`
- `.github/workflows/ci.yml:25`
- `.github/workflows/ci.yml:27`
- `.github/workflows/ci.yml:40`
- `.github/workflows/ci.yml:42`
- `.github/workflows/claude-review.yml:15`
- `.github/workflows/claude-review.yml:20`
- `.github/workflows/claude.yml:24`
- `.github/workflows/claude.yml:30`
- `.github/workflows/issue-triage.yml:19`
- `.github/workflows/issue-triage.yml:24`
- `.github/workflows/release.yml:30`
- `.github/workflows/release.yml:100`
- `.github/workflows/release.yml:130`

### script-injection (severity: high)

Multiple `run:` blocks interpolate `${{ ... }}` expressions directly into shell commands, bypassing shell quoting and enabling script injection.

(a) `agent-approval-check/action.yml` — `run: python "${{ github.action_path }}/agent_approval_check.py"` interpolates `github.action_path` directly into the shell command.

(b) `action.yml` "Revoke app token" step — `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` interpolates a step output directly into a curl command.

(c) `release.yml` — multiple run blocks interpolate step/needs outputs and github context directly:
  - `latest_tag="${{ steps.get_latest_tag.outputs.latest_tag }}"`
  - `echo "Would create tag: ${{ steps.next_version.outputs.next_version }}"`
  - `echo "From commit: ${{ github.sha }}"`
  - `next_version="${{ steps.next_version.outputs.next_version }}"`
  - `next_version="${{ needs.create-release.outputs.next_version }}"`

(d) `sync-base-action.yml` — `echo "${{ secrets.CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY }}" > ~/.ssh/deploy_key_base` interpolates a secret directly into a shell command.

(e) `test-base-action.yml`, `test-custom-executables.yml`, `test-settings.yml`, `test-structured-output.yml` — run blocks interpolate `${{ steps.*.outputs.* }}` (including Claude's structured output) directly into shell variables.

Locations:

- `agent-approval-check/action.yml:47`
- `action.yml:299`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:58`
- `.github/workflows/release.yml:59`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:70`
- `.github/workflows/release.yml:108`
- `.github/workflows/sync-base-action.yml:29`
- `.github/workflows/test-base-action.yml:43`
- `.github/workflows/test-base-action.yml:44`
- `.github/workflows/test-custom-executables.yml:55`
- `.github/workflows/test-settings.yml:40`
- `.github/workflows/test-structured-output.yml:42`

### permissions (severity: medium)

`missing-permissions`: `.github/workflows/ci.yml` has no top-level `permissions:` key and none of its three jobs (`test`, `prettier`, `typecheck`) define a `permissions:` block. This means the workflow runs with the default (potentially broad) token permissions.

Locations:

- `.github/workflows/ci.yml:1`

### unsafe-shell (severity: high)

Remote install scripts are fetched and piped directly to `bash` without first downloading and verifying them. This pattern executes whatever content the remote server returns at the time of the request.

- `base-action/action.yml` "Install Claude Code" step: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a variant wrapped in `timeout ... bash -c "curl ... | bash ..."`).
- `.github/workflows/test-custom-executables.yml`: `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest`.

Locations:

- `base-action/action.yml:119`
- `base-action/action.yml:121`
- `.github/workflows/test-custom-executables.yml:22`
- `.github/workflows/test-custom-executables.yml:33`

### github-env-injection (severity: high)

User-controlled inputs are written to `$GITHUB_PATH` without sanitization (no `printf '%s' ... | tr -d '\n\r'` step before the write), allowing newline injection that could add arbitrary entries to PATH.

(a) `action.yml` "Setup Custom Bun Path" step: `inputs.path_to_bun_executable` is mapped to `PATH_TO_BUN_EXECUTABLE`, then `dirname "$PATH_TO_BUN_EXECUTABLE"` is written directly to `$GITHUB_PATH`.

(b) `base-action/action.yml` "Setup Custom Bun Path" step: same pattern — `inputs.path_to_bun_executable` → `PATH_TO_BUN_EXECUTABLE` → `dirname "$PATH_TO_BUN_EXECUTABLE"` → `$GITHUB_PATH` without sanitization.

(c) `base-action/action.yml` "Install Claude Code" step: `inputs.path_to_claude_code_executable` is mapped to `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` is written directly to `$GITHUB_PATH` without sanitization.

Locations:

- `action.yml:234`
- `base-action/action.yml:100`
- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, permissions, unsafe-shell, github-env-injection

**Notes:**

Fixed all findings across action files:

1. unpinned-uses: Pinned actions/checkout@v6 → SHA d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → SHA 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → SHA f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → SHA 86180fa9e4d311eed10c9cc49854c53dab5d517a in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. script-injection: (a) agent-approval-check/action.yml: moved github.action_path to env block as ACTION_PATH; (b) action.yml Revoke app token: moved steps.run.outputs.github_token to env block as APP_GITHUB_TOKEN; (c) release.yml: moved all step outputs and github.sha to env blocks; (d) sync-base-action.yml: moved CLAUDE_CODE_BASE_ACTION_REPO_DEPLOY_KEY secret to env block as DEPLOY_KEY.

3. permissions: Added top-level 'permissions: contents: read' to ci.yml.

4. unsafe-shell: Fixed base-action/action.yml Install Claude Code step to download script to /tmp/claude_install.sh first, then execute separately instead of piping curl to bash.

5. github-env-injection: Added printf '%s' ... | tr -d '\n\r' sanitization before writing to GITHUB_PATH in action.yml Setup Custom Bun Path, base-action/action.yml Setup Custom Bun Path, and base-action/action.yml Install Claude Code steps.

Test harness files (test-*.yml) were not modified per instructions.

### Iteration 2

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 4 workflow files:

1. test-base-action.yml: Moved step outputs (execution_file, conclusion) to env: blocks in both verify steps. Fixed unsafe heredoc by replacing unquoted `<< EOF` with `printf '%s\n' "$PROMPT" > test-prompt.txt`.

2. test-custom-executables.yml: Replaced `curl -fsSL https://bun.sh/install | bash` with download-then-execute pattern (`curl -o /tmp/bun-install.sh ... && bash /tmp/bun-install.sh`). Same fix for Claude Code installer. Moved step outputs to env: block in verify step.

3. test-settings.yml: Moved all ${{ steps.*.outputs.* }} expressions from inline run: strings to env: blocks across all 4 verify steps (inline-allow, inline-deny, file-allow, file-deny).

4. test-structured-output.yml: Moved ${{ steps.test.outputs.structured_output }} to STRUCTURED_OUTPUT env var in 4 verify steps, moved ${{ steps.test.outputs.execution_file }} to FILE env var in execution file verify step, and moved all ${{ needs.*.result == ... }} ternary expressions and the ALL_PASSED boolean expression to env: block in the summary step.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

Fixed the 'Calculate next version' step in .github/workflows/release.yml (line 67). The `next_version` value derived from `LATEST_TAG` (a steps.*.outputs.* value from git tags) is now sanitized with `printf '%s' "$next_version" | tr -d '\n\r'` before being written to $GITHUB_OUTPUT. This prevents a malicious git tag containing a newline from injecting additional key=value pairs into GITHUB_OUTPUT. Also quoted the $GITHUB_OUTPUT reference for best practice.

