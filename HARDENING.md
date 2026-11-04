<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.268

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.268** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value built from an input to $GITHUB_PATH without stripping newlines. PATH_TO_BUN_EXECUTABLE comes from ${{ inputs.path_to_bun_executable }}. The script runs BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and then echo "$BUN_DIR" >> "$GITHUB_PATH" with no `printf '%s' ... | tr -d '\n\r'` step first. If the input contains newlines, each extra line becomes its own PATH entry, so an attacker can add arbitrary directories to PATH.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Step 'Revoke app token' breaks sub-rule (a): a GitHub Actions expression sits directly inside the run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The value is pasted into the shell script before bash runs it. Pass it through env: instead (e.g. APP_TOKEN: ${{ steps.run.outputs.github_token }}) and use "Authorization: Bearer $APP_TOKEN". On the same step, ${GITHUB_API_URL:-https://api.github.com}/installation/token is also unquoted.

Locations:

- `action.yml:457`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection

**Notes:**

Setup Custom Bun Path: the dirname result is now passed through printf '%s' | tr -d '\n\r' before it is written to $GITHUB_PATH. Revoke app token: moved steps.run.outputs.github_token into env APP_TOKEN, used "Bearer $APP_TOKEN", and double-quoted the API URL.

### Iteration 2

**Fixes applied:** github-env-injection, script-injection

**Notes:**

action.yml: the 'Setup Custom Bun Path' step now strips newlines from BUN_DIR before writing it to GITHUB_PATH (printf '%s' | tr -d '\n\r'). I added double quotes around ${GITHUB_ACTION_PATH} in the 'cd' line and in the run.ts, cleanup-ssh-signing.ts and post-buffered-inline-comments.ts commands. The cleanup-ssh-signing.ts edit didn't save on the first try, so I made it again and searched to confirm it's there. base-action/action.yml had the same problems but wasn't in the findings, and I fixed it too: the 'cd' line and src/index.ts are now quoted, and newlines are stripped from CLAUDE_DIR before it goes to GITHUB_PATH. Still open and not fixed: base-action/action.yml pipes the Claude Code installer from the internet straight into bash ('curl -fsSL https://claude.ai/install.sh | bash -s --'). Nobody reported it in this pass, so I didn't change it, but it's the unsafe-shell (downloaded script piped to a shell) pattern.

