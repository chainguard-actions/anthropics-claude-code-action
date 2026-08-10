<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.185

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.185** was hardened automatically. 5 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step interpolates ${{ steps.run.outputs.github_token }} directly inside a run: shell command string. This expression is substituted by the GitHub Actions template engine before the shell ever sees it, allowing a step output containing shell metacharacters to be injected into the curl command. Offending line: -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"

Locations:

- `action.yml:349`

### script-injection (severity: high)

Sub-rule (a): The step 'run: python "${{ github.action_path }}/agent_approval_check.py"' interpolates ${{ github.action_path }} directly inside a run: shell command string. Any ${{ ... }} expression directly inside a run: script is a script-injection finding regardless of which context it reads from. Offending line: run: python "${{ github.action_path }}/agent_approval_check.py"

Locations:

- `agent-approval-check/action.yml:55`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes the output of curl directly to bash: 'curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION'. This executes remotely-fetched content without first downloading and verifying it, enabling a supply-chain attack if the remote URL is compromised.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input inputs.path_to_bun_executable to $GITHUB_PATH without sanitization. The input is placed into env var PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") is computed and written with 'echo "$BUN_DIR" >> "$GITHUB_PATH"'. A newline embedded in the input value could inject arbitrary entries into PATH. The required sanitization step (printf '%s' ... | tr -d '\n\r') is absent.

Locations:

- `action.yml:163`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input inputs.path_to_claude_code_executable to $GITHUB_PATH without sanitization. The input is placed into env var PATH_TO_CLAUDE_CODE_EXECUTABLE, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") is computed and written with 'echo "$CLAUDE_DIR" >> "$GITHUB_PATH"'. A newline embedded in the input value could inject arbitrary entries into PATH. The required sanitization step (printf '%s' ... | tr -d '\n\r') is absent.

Locations:

- `base-action/action.yml:163`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files: (1) action.yml Revoke app token: moved steps.run.outputs.github_token from curl -H header into env: block as APP_TOKEN; (2) agent-approval-check/action.yml: moved github.action_path from run: string into env: block as ACTION_PATH; (3) base-action/action.yml Install Claude Code: replaced curl|bash pipe with download-then-execute pattern (curl -o tmpfile then bash tmpfile), dropped the '--' separator as required; (4) action.yml Setup Custom Bun Path: sanitized BUN_DIR with printf/tr before writing to GITHUB_PATH; (5) base-action/action.yml: sanitized both BUN_DIR (Setup Custom Bun Path) and CLAUDE_DIR (Install Claude Code) with printf/tr before writing to GITHUB_PATH.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, unsafe-shell

**Notes:**

Fixed all findings across 8 workflow files:

1. unpinned-uses: Pinned all mutable action references to full SHAs in ci.yml, claude.yml, claude-review.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6 (d23441a48e516b6c34aea4fa41551a30e30af803), oven-sh/setup-bun@v2 (0c5077e51419868618aeaa5fe8019c62421857d6), oven-sh/setup-bun@v1 (f4d14e03ff726c06358e5557344e1da148b56cf7), and anthropics/claude-code-action@main/v1 (6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975).

2. missing-permissions: Added top-level 'permissions: contents: read' to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: blocks into env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-structured-output.yml, and test-settings.yml. Also fixed additional injection instances beyond those listed in the findings (5 verify steps in test-structured-output.yml, 4 verify steps in test-settings.yml).

4. unsafe-shell: Replaced both curl|bash pipes in test-custom-executables.yml with download-to-tempfile-then-execute pattern. For bun.sh/install: 'curl ... | bash' → download to mktemp then 'bash script'. For claude.ai/install.sh: 'curl ... | bash -s latest' → download to mktemp then 'bash script latest' (dropping -s since no longer reading from stdin).

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed two script injection findings:

1. hardened/action/.github/workflows/test-structured-output.yml (line 280): Moved all ${{ needs.*.result == 'success' && '✅ PASS' || '❌ FAIL' }} expressions out of the run: block into an env: block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE variables. Replaced the inline ternary expressions with a shell pass_fail() function and replaced the multi-condition ${{ ... }} ALL_PASSED assignment with a proper shell if/elif chain using [ "$VAR" = "success" ] comparisons.

2. hardened/action/.github/workflows/test-base-action.yml (line 68): Replaced the unsafe heredoc (which used unquoted ${PROMPT} subject to word splitting and glob expansion) with `printf '%s\n' "$PROMPT" > test-prompt.txt`, which properly double-quotes the env var. The PROMPT env var remains set via env: from the ${{ github.event.inputs.test_prompt || '...' }} expression.

