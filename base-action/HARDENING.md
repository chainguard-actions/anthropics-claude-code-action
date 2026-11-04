<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.268

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.268** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path': BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") comes from inputs.path_to_bun_executable and is written with echo "$BUN_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (printf '%s' ... | tr -d '\n\r'), so an input containing newlines can add extra PATH entries.

Locations:

- `action.yml:135`

### github-env-injection (severity: high)

Step 'Install Claude Code': CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") comes from inputs.path_to_claude_code_executable and is written with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (printf '%s' ... | tr -d '\n\r'), so an input containing newlines can add extra PATH entries.

Locations:

- `action.yml:173`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, then run.

Locations:

- `action.yml:155`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (fallback branch) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, then run.

Locations:

- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings in action.yml. Nothing has been run or tested yet.

**PATH entries (`github-env-injection`):** In the 'Setup Custom Bun Path' and 'Install Claude Code' steps, the folder taken from the user-supplied path now has newlines stripped (`printf '%s' | tr -d '\n\r'`) before it is written to `$GITHUB_PATH`. A path containing newlines can no longer add extra PATH entries.

**Installer (`unsafe-shell`):** `https://claude.ai/install.sh` is no longer piped straight into bash. On each attempt it is downloaded to a temp file from `mktemp`, checked to be non-empty, and then run as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped `-s --` so the script gets the version as its first argument; leaving `--` in would make the script reject it as a usage error. Upstream's 3 retries and the `timeout --foreground --kill-after=10 120` limit are kept, now applied to the download and the run separately. The temp file is deleted after a successful install.

### Iteration 2

**Fixes applied:** unsafe-shell, github-env-injection

**Notes:**

Install Claude Code step: removed the leftover 'fide.ai/install.sh | bash -s --' pipe and fixed the corrupted CLAUDE_CODE_VERSION line. The installer is now only downloaded to a mktemp file, checked to be non-empty, then run with 'bash "$INSTALL_SCRIPT"' (no -s --). The retry, timeout and exit 1 logic is restored. The original pinned version string was lost in the corruption and appears nowhere else in the action. It is now read from the installed Agent SDK's package.json field 'claudeCodeVersion' (SDK 0.3.318), which I believe exists but have not checked. If that field is missing, the version argument is left off via ${VAR:+"$VAR"} and the installer uses its default release instead of a pinned one; upstream's exact version should ideally be restored. $HOME/.local/bin is sanitized with printf | tr -d '\n\r' before being written to GITHUB_PATH. Nothing was run or tested.

