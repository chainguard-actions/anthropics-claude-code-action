<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.255

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.255** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' takes inputs.path_to_bun_executable (through env PATH_TO_BUN_EXECUTABLE), runs it through dirname and writes it to $GITHUB_PATH with no `printf '%s' ... | tr -d '\n\r'` cleanup first. The line is `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"); echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value with a newline in it can add extra entries to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' takes inputs.path_to_claude_code_executable (through env PATH_TO_CLAUDE_CODE_EXECUTABLE), runs it through dirname and writes it to $GITHUB_PATH with no `printf '%s' ... | tr -d '\n\r'` cleanup first. The line is `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"); echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' downloads a remote script and pipes it straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (the branch used when timeout is not available) downloads a remote script and pipes it straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Fixed both findings in action.yml. github-env-injection: in the bun and claude path steps, the dirname output is now saved to a variable first, then cleaned with printf '%s' | tr -d '\n\r' before it goes to $GITHUB_PATH. A failed dirname still stops the step. unsafe-shell: install.sh is now saved to a mktemp file with curl -o and checked to be non-empty. Then it runs as bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", with the '-s --' dropped so the version is still $1. Both the timeout branch and the no-timeout branch are changed. Each command in the timeout branch gets its own 120s timeout. The retry loop is unchanged, and the temp file is deleted after a successful install. Partway through, one edit mangled the install step; I restored upstream's lines and checked the result by reading the file again.

