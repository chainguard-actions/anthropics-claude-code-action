<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.191

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.191** was hardened automatically. 3 finding(s) were identified and resolved across 4 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string (inside the curl Authorization header). GitHub Actions performs template substitution before the shell ever sees the string, so any newlines or shell metacharacters in the token value are passed raw to the shell. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`

Locations:

- `action.yml:447`

### github-env-injection (severity: high)

Multiple 'Setup Custom Bun Path' and 'Install Claude Code' steps write values derived from action inputs to $GITHUB_PATH without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). Specifically: (1) action.yml 'Setup Custom Bun Path': `PATH_TO_BUN_EXECUTABLE` (from `inputs.path_to_bun_executable`) is passed to `dirname` and the result written to $GITHUB_PATH — `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) base-action/action.yml 'Setup Custom Bun Path': same pattern. (3) base-action/action.yml 'Install Claude Code': `PATH_TO_CLAUDE_CODE_EXECUTABLE` (from `inputs.path_to_claude_code_executable`) is passed to `dirname` and the result written to $GITHUB_PATH — `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A newline embedded in the input value would allow injecting arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:228`
- `base-action/action.yml:133`
- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes the output of curl directly to bash without first saving the script to a file: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same inside a `timeout ... bash -c "curl ... | bash ..."`). If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes immediately on the runner.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:156`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed three security findings: (1) script-injection in action.yml 'Revoke app token' step: moved ${{ steps.run.outputs.github_token }} to env: block as GITHUB_APP_TOKEN and referenced it as $GITHUB_APP_TOKEN in the curl Authorization header. (2) github-env-injection in action.yml and base-action/action.yml 'Setup Custom Bun Path' and 'Install Claude Code' steps: added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH. (3) unsafe-shell in base-action/action.yml 'Install Claude Code' step: replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern using mktemp, dropping the '--' (which was the shell's option terminator in the pipe form, not the script's argument), and cleaning up the temp file after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all 4 findings across 8 files:

1. script-injection (22 locations): Moved all ${{ }} expressions out of run: shell strings into env: blocks. Used $GITHUB_ACTION_PATH built-in env var for agent-approval-check/action.yml. Used printf for safe secret writing in sync-base-action.yml.

2. unpinned-uses (15 locations): Pinned actions/checkout@v6 to SHA d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 to 0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 to f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main both to 239e3a730883eeb5c53db12b0fc9573b3024b126.

3. missing-permissions: Added 'permissions: contents: read' top-level block to ci.yml.

4. unsafe-shell: Converted both curl-pipe-to-bash patterns in test-custom-executables.yml to download-then-execute pattern using mktemp. For claude.ai/install.sh, dropped -s flag (no longer reading from stdin) and passed 'latest' directly as positional argument without '--'.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Generate Summary' step in the test-summary job of .github/workflows/test-structured-output.yml. Moved all six ${{ needs.*.result }} expressions out of the run: shell script and into the step's env: block as RESULT_BASIC_TYPES, RESULT_COMPLEX_TYPES, RESULT_EDGE_CASES, RESULT_NAME_SANITIZATION, and RESULT_EXECUTION_FILE. Rewrote the shell script to use plain environment variable references and standard shell conditionals instead of ${{ }} ternary expressions. The ALL_PASSED check was also rewritten as a series of [ ] test conditions rather than a ${{ }} multi-line expression assigned to a shell variable.

### Iteration 4

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`<< EOF` with `${PROMPT}` inside) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The original unquoted heredoc delimiter allowed bash to perform command substitution on the heredoc body, enabling injection attacks via the `github.event.inputs.test_prompt` input. The `printf` approach safely writes the environment variable content to the file without any shell interpretation.

