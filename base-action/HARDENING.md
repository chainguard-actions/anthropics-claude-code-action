<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.267

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.267** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with echo "$BUN_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (printf '%s' ... | tr -d '\n\r'), so a value containing newlines can inject extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

The 'Install Claude Code' step builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (printf '%s' ... | tr -d '\n\r'), so a value containing newlines can inject extra PATH entries.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file first, checked, and then run.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

The 'Install Claude Code' fallback branch pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". The script should be downloaded to a file first, checked, and then run.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. Sub-rule (b): an environment variable is expanded without quotes in a composite run: block. Offending lines: `cd ${GITHUB_ACTION_PATH}` (step 'Install Dependencies') and `bun run ${GITHUB_ACTION_PATH}/src/index.ts` (step 'Run Claude Code Action'). Quote them as "${GITHUB_ACTION_PATH}". This is a low-risk, conservative finding: the runner sets GITHUB_ACTION_PATH, but the check treats any env var in a composite step as untrusted when in doubt.

Locations:

- `action.yml:141`
- `action.yml:186`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/base-action/action.yml b/base-action/action.yml
index 43ea14b..fde9eab 100644
--- a/base-action/action.yml
+++ b/base-action/action.yml
@@ -109,6 +109,23 @@ outputs:
 runs:
   using: "composite"
   steps:
     - name: Setup Node.js
       uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # https://github.com/actions/setup-node/releases/tag/v6.4.0
       with:
@@ -132,13 +149,15 @@ runs:
       run: |
         echo "Using custom Bun executable: $PATH_TO_BUN_EXECUTABLE"
         # Add the directory containing the custom executable to PATH
-        BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
+        SAFE_BUN_PATH=$(printf '%s' "$PATH_TO_BUN_EXECUTABLE" | tr -d '\n\r')
+        BUN_DIR=$(dirname "$SAFE_BUN_PATH")
+        BUN_DIR=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')
         echo "$BUN_DIR" >> "$GITHUB_PATH"
 
     - name: Install Dependencies
       shell: bash
       run: |
-        cd ${GITHUB_ACTION_PATH}
+        cd "${GITHUB_ACTION_PATH}"
         bun install --production
 
     - name: Install Claude Code
@@ -149,13 +168,18 @@ runs:
         if [ -z "$PATH_TO_CLAUDE_CODE_EXECUTABLE" ]; then
           CLAUDE_CODE_VERSION="2.1.317"
           echo "Installing Claude Code v${CLAUDE_CODE_VERSION}..."
+          INSTALL_SCRIPT="$(mktemp "${RUNNER_TEMP:-/tmp}/claude-install.XXXXXX.sh")"
           for attempt in 1 2 3; do
             echo "Installation attempt $attempt..."
             if command -v timeout &> /dev/null; then
               # Use --foreground to kill entire process group on timeout, --kill-after to send SIGKILL if SIGTERM fails
-              timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION" && break
+              timeout --foreground --kill-after=10 120 curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" \
+                && [ -s "$INSTALL_SCRIPT" ] \
+                && timeout --foreground --kill-after=10 120 bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION" && break
             else
-              curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION" && break
+              curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" \
+                && [ -s "$INSTALL_SCRIPT" ] \
+                && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION" && break
             fi
             if [ $attempt -eq 3 ]; then
               echo "Failed to install Claude Code after 3 attempts"
@@ -166,11 +190,14 @@ runs:
           done
           echo "Claude Code installed successfully"
           # Add ~/.local/bin to PATH so the claude executable is available in subsequent steps
-          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
+          SAFE_LOCAL_BIN=$(printf '%s' "$HOME/.local/bin" | tr -d '\n\r')
+          echo "$SAFE_LOCAL_BIN" >> "$GITHUB_PATH"
         else
           echo "Using custom Claude Code executable: $PATH_TO_CLAUDE_CODE_EXECUTABLE"
           # Add the directory containing the custom executable to PATH
-          CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")
+          SAFE_CLAUDE_PATH=$(printf '%s' "$PATH_TO_CLAUDE_CODE_EXECUTABLE" | tr -d '\n\r')
+          CLAUDE_DIR=$(dirname "$SAFE_CLAUDE_PATH")
+          CLAUDE_DIR=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')
           echo "$CLAUDE_DIR" >> "$GITHUB_PATH"
         fi
 
@@ -183,7 +210,7 @@ runs:
           echo "Changing directory to CLAUDE_WORKING_DIR: $CLAUDE_WORKING_DIR"
           cd "$CLAUDE_WORKING_DIR"
         fi
-        bun run ${GITHUB_ACTION_PATH}/src/index.ts
+        bun run "${GITHUB_ACTION_PATH}/src/index.ts"
       env:
         # Model configuration
         CLAUDE_CODE_ACTION: "1"

```

Locations:

- `action.yml`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell, script-injection, prior-fix

**Notes:**

Strip newlines from the bun and claude paths before writing them to GITHUB_PATH. The Claude installer is now downloaded to a temp file, checked that it isn't empty, then run with 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"' (I dropped the '-s --'). The retry and timeout logic is unchanged. GITHUB_ACTION_PATH is now quoted in the Install Dependencies and Run Claude Code Action steps. This re-applies the previous harden patch. Its first hunk (around line 109) showed only context lines and no added content, so there was nothing there to re-apply.

