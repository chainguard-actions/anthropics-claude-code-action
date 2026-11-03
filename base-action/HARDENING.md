<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1** was hardened automatically. 7 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with echo "$BUN_DIR" >> "$GITHUB_PATH". It never strips newlines with printf '%s' ... | tr -d '\n\r', so an input containing a newline can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". It never strips newlines with printf '%s' ... | tr -d '\n\r'.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' sends a remote script straight to a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". It should be downloaded to a file and run as a separate step.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' fallback branch sends a remote script straight to a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". It should be downloaded to a file and run as a separate step.

Locations:

- `action.yml:158`

### script-injection (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. Sub-rule (b): step 'Install Dependencies' expands an inherited environment variable without quotes: `cd ${GITHUB_ACTION_PATH}`. It should be quoted as "${GITHUB_ACTION_PATH}".

Locations:

- `action.yml:141`

### script-injection (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. Sub-rule (b): step 'Run Claude Code Action' expands an inherited environment variable without quotes: `bun run ${GITHUB_ACTION_PATH}/src/index.ts`. It should be quoted as "${GITHUB_ACTION_PATH}/src/index.ts".

Locations:

- `action.yml:186`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/base-action/action.yml b/base-action/action.yml
index 43ea14b..617aff6 100644
--- a/base-action/action.yml
+++ b/base-action/action.yml
@@ -109,6 +109,23 @@ outputs:
 runs:
   using: "composite"
   steps:
     - name: Setup Node.js
       uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # https://github.com/actions/setup-node/releases/tag/v6.4.0
       with:
@@ -133,12 +150,13 @@ runs:
         echo "Using custom Bun executable: $PATH_TO_BUN_EXECUTABLE"
         # Add the directory containing the custom executable to PATH
         BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
-        echo "$BUN_DIR" >> "$GITHUB_PATH"
+        SAFE_BUN_DIR=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')
+        printf '%s\n' "$SAFE_BUN_DIR" >> "$GITHUB_PATH"
 
     - name: Install Dependencies
       shell: bash
       run: |
-        cd ${GITHUB_ACTION_PATH}
+        cd "${GITHUB_ACTION_PATH}"
         bun install --production
 
     - name: Install Claude Code
@@ -149,13 +167,16 @@ runs:
         if [ -z "$PATH_TO_CLAUDE_CODE_EXECUTABLE" ]; then
           CLAUDE_CODE_VERSION="2.1.317"
           echo "Installing Claude Code v${CLAUDE_CODE_VERSION}..."
+          INSTALL_SCRIPT="$(mktemp)"
           for attempt in 1 2 3; do
             echo "Installation attempt $attempt..."
-            if command -v timeout &> /dev/null; then
-              # Use --foreground to kill entire process group on timeout, --kill-after to send SIGKILL if SIGTERM fails
-              timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION" && break
-            else
-              curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION" && break
+            if curl -fsSL --max-time 60 https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && [ -s "$INSTALL_SCRIPT" ]; then
+              if command -v timeout &> /dev/null; then
+                # Use --foreground to kill entire process group on timeout, --kill-after to send SIGKILL if SIGTERM fails
+                timeout --foreground --kill-after=10 120 bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION" && break
+              else
+                bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION" && break
+              fi
             fi
             if [ $attempt -eq 3 ]; then
               echo "Failed to install Claude Code after 3 attempts"
@@ -171,7 +192,8 @@ runs:
           echo "Using custom Claude Code executable: $PATH_TO_CLAUDE_CODE_EXECUTABLE"
           # Add the directory containing the custom executable to PATH
           CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")
-          echo "$CLAUDE_DIR" >> "$GITHUB_PATH"
+          SAFE_CLAUDE_DIR=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')
+          printf '%s\n' "$SAFE_CLAUDE_DIR" >> "$GITHUB_PATH"
         fi
 
     - name: Run Claude Code Action
@@ -183,7 +205,7 @@ runs:
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

action.yml: (1) The 'Setup Custom Bun Path' step and the custom-path branch of 'Install Claude Code' now remove newlines from the directory (printf '%s' | tr -d '\n\r') before writing it to $GITHUB_PATH. (2) 'Install Claude Code' no longer pipes curl into bash. It downloads install.sh to a mktemp file (curl --max-time 60, then checks the file isn't empty) and runs 'bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"'. It keeps the timeout wrapper and the 3 retries, and drops '-s --' so the script gets the version as $1. (3) ${GITHUB_ACTION_PATH} is now quoted in 'Install Dependencies' (cd) and 'Run Claude Code Action' (bun run). One of my edits garbled the install step mid-way; I repaired it and re-read the whole steps section to confirm it is intact. Not re-applied: the earlier patch also added 17 lines at the start of runs.steps, but the diff only showed surrounding unchanged lines, not what was added, so I couldn't reproduce them.

