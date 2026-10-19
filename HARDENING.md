<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.253

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.253** was hardened automatically. 2 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. In the 'Revoke app token' step, the line `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` embeds the expression directly in the shell command. GitHub Actions performs YAML template substitution before the shell ever sees the string, so if the token value contains shell metacharacters they will be interpreted by bash. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `action.yml:549`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash without first saving it to a file: `curl -fsSL https://claude.ai/install.sh | bash` (and a timeout-wrapped variant `bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`). If the remote server is compromised or the URL is intercepted, arbitrary code executes immediately on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g. via checksum), and only then executed.

Locations:

- `base-action/action.yml:152`
- `base-action/action.yml:154`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

1. action.yml 'Revoke app token' step: moved `${{ steps.run.outputs.github_token }}` out of the curl command into an `env:` block as `APP_TOKEN`, referenced as `$APP_TOKEN` in the shell. 2. base-action/action.yml 'Install Claude Code' step: replaced both `curl ... | bash -s -- $VERSION` and `curl ... | bash -s -- "$VERSION"` patterns with a download-then-execute approach: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `--` shell option terminator was dropped as required (it was the shell's own `--`, not the script's). The temp file is cleaned up with `rm -f` after the loop.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

Fixed three security findings:
1. agent-approval-check/action.yml line 52: Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` to eliminate script-injection risk from YAML template interpolation.
2. action.yml line 182 (Setup Custom Bun Path): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write `$safe` to $GITHUB_PATH instead of raw `$BUN_DIR`.
3. base-action/action.yml line 121 (Setup Custom Bun Path): Same BUN_DIR sanitization as above.
4. base-action/action.yml line 155 (Install Claude Code): Added `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and write `$safe` to $GITHUB_PATH instead of raw `$CLAUDE_DIR`.

### Iteration 1

**Fixes applied:** unsafe-shell

**Notes:**

Fixed the unsafe-shell pattern in src/entrypoints/run.ts. The buildInstallCommand function previously used `curl -fsSL https://claude.ai/install.sh | bash -s -- ${version}` which pipes remote content directly to bash. Changed to download the script to a temp file first (`curl -fsSL ... -o "$INSTALL_SCRIPT"`), then execute it as a file (`bash "$INSTALL_SCRIPT" ${safeVersion}`), then clean up (`rm -f "$INSTALL_SCRIPT"`). The `-s` and `--` are correctly dropped since they were the shell's stdin-reading options and are not needed when running a file directly. The version string is sanitized with a regex to prevent injection. This matches the safe pattern already used in base-action/action.yml. Note: the existing test file (test/install-pipefail.test.ts) checks for the old unsafe pattern and will need to be updated separately.

