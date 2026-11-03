<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.266

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.266** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR from inputs.path_to_bun_executable (passed in via env PATH_TO_BUN_EXECUTABLE) and writes it to $GITHUB_PATH without stripping newlines first: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. If the input contains a newline, extra arbitrary entries get added to PATH. Fix: run `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before the write.

Locations:

- `action.yml:218`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside its run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Fix: pass the value in through an env: variable and use it double-quoted ("$APP_TOKEN").

Locations:

- `action.yml:458`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/action.yml b/action.yml
index cf636eb..8006c84 100644
--- a/action.yml
+++ b/action.yml
@@ -189,10 +189,27 @@ outputs:
 runs:
   using: "composite"
   steps:
     - name: Install Bun
       id: setup-bun
       if: inputs.path_to_bun_executable == ''
       uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # https://github.com/oven-sh/setup-bun/releases/tag/v2.2.0
       with:
         bun-version: 1.4.4
         token: ${{ inputs.github_token || github.token }}
@@ -214,7 +231,8 @@ runs:
         echo "Using custom Bun executable: $PATH_TO_BUN_EXECUTABLE"
         # Add the directory containing the custom executable to PATH
         BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")
-        echo "$BUN_DIR" >> "$GITHUB_PATH"
+        SAFE_BUN_DIR=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')
+        echo "$SAFE_BUN_DIR" >> "$GITHUB_PATH"
 
     - name: Install Dependencies
       shell: bash
@@ -448,12 +466,14 @@ runs:
     - name: Revoke app token
       if: always() && inputs.github_token == '' && steps.run.outputs.github_token != '' && steps.run.outputs.skipped_due_to_workflow_validation_mismatch != 'true'
       shell: bash
+      env:
+        APP_TOKEN: ${{ steps.run.outputs.github_token }}
       run: |
         curl -L \
           --connect-timeout 5 \
           --max-time 10 \
           -X DELETE \
           -H "Accept: application/vnd.github+json" \
-          -H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \
+          -H "Authorization: Bearer $APP_TOKEN" \
           -H "X-GitHub-Api-Version: 2022-11-28" \
           ${GITHUB_API_URL:-https://api.github.com}/installation/token || true

```

Locations:

- `action.yml`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, prior-fix

**Notes:**

In action.yml, the 'Setup Custom Bun Path' step now removes newlines from BUN_DIR (printf '%s' | tr -d '\n\r') before writing it to $GITHUB_PATH. base-action/action.yml has the same step, so it got the same fix. In the 'Revoke app token' step, steps.run.outputs.github_token now comes in through env as APP_TOKEN and is used as "$APP_TOKEN" in the Authorization header. These are the same changes the previous harden made.

