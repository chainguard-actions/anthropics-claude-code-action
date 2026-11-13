<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.276

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.276** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step of action.yml, PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable. It goes through BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and is then written with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. The required `printf '%s' ... | tr -d '\n\r'` step is missing. dirname keeps newlines inside the value, so a multi-line input can add extra entries to PATH. Fix: safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r'); echo "$safe" >> "$GITHUB_PATH".

Locations:

- `action.yml:221`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In action.yml's 'Setup Custom Bun Path' step, BUN_DIR now has newlines and carriage returns removed (safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')) before it is written to $GITHUB_PATH. I made the same change in base-action/action.yml to the Bun directory write and the custom Claude directory write, which follow the same pattern but were not flagged. The remaining GITHUB_PATH writes only add fixed paths (/usr/bin, /bin, $HOME/.local/bin). Not checked: base-action/action.yml still pipes the Claude installer from the internet into bash (curl https://claude.ai/install.sh | bash -s --). That's outside this finding and I left it as is, but a later analysis pass may flag it.

