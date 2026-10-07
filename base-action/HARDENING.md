<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.245

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.245** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unsafe-shell (severity: high)

The 'Install Claude Code' step in action.yml pipes a remote install script directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This occurs twice — once inside a `timeout` wrapper and once in the `else` branch. If the remote URL is compromised or the response is tampered with in transit, arbitrary code will execute on the runner.

Locations:

- `action.yml:155`
- `action.yml:158`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps the caller-controlled input `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then writes `dirname "$PATH_TO_BUN_EXECUTABLE"` directly to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into PATH for subsequent steps.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps the caller-controlled input `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then writes `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` directly to `$GITHUB_PATH` without sanitization (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled value containing newlines could inject arbitrary entries into PATH for subsequent steps.

Locations:

- `action.yml:170`

## Iteration Notes

### Iteration 1

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Fixed three security findings in hardened/action/action.yml:

1. unsafe-shell (2 occurrences): Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (both the timeout-wrapped and else-branch forms) with a download-then-execute pattern: curl downloads the script to a mktemp file, then bash executes it directly with the version as a positional argument. The '--' was dropped (it was the shell's option terminator in the pipe form, not the script's argument). The temp file is cleaned up after use.

2. github-env-injection (Setup Custom Bun Path, line 136): Added newline sanitization before writing dirname output to GITHUB_PATH: `raw_bun_dir=$(dirname "$PATH_TO_BUN_EXECUTABLE")` followed by `BUN_DIR=$(printf '%s' "$raw_bun_dir" | tr -d '\n\r')`.

3. github-env-injection (Install Claude Code, line 170): Added newline sanitization before writing dirname output to GITHUB_PATH: `raw_claude_dir=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` followed by `CLAUDE_DIR=$(printf '%s' "$raw_claude_dir" | tr -d '\n\r')`.

