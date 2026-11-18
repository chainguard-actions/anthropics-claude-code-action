<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.281

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.281** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_bun_executable and is not sanitized with printf '%s' ... | tr -d '\n\r' first. An input containing newlines can add arbitrary PATH entries.

Locations:

- `action.yml:137`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_claude_code_executable and is not sanitized with printf '%s' ... | tr -d '\n\r' first, so newlines can inject extra PATH entries.

Locations:

- `action.yml:175`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:157`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:159`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I changed two things in action.yml. I haven't run the action to test them.

1. Path inputs: the folder taken from path_to_bun_executable and path_to_claude_code_executable now has line breaks removed (printf '%s' | tr -d '\n\r') before it is written to $GITHUB_PATH.

2. Claude Code install: the script from https://claude.ai/install.sh is now saved to a temp file first, checked to be non-empty, and then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped the `-s --` so the script still gets the version as $1. The timeout path now has two limits: 60s for the download and 120s for the install. Before, one 120s limit covered both. The 3-attempt retry loop is unchanged, and the temp file is deleted after each attempt.

