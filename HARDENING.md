<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.267

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.267** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable, then writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Newlines are not removed first (`printf '%s' ... | tr -d '\n\r'`), so a value with newlines can add extra PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside its run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The fix is to pass the value through an env: variable and use it as "$VAR" in quotes.

Locations:

- `action.yml:457`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/action.yml b/action.yml
index cf636eb..34db183 100644
--- a/action.yml
+++ b/action.yml
@@ -189,6 +189,23 @@ outputs:
 runs:
   using: "composite"
   steps:
     - name: Install Bun
       id: setup-bun
       if: inputs.path_to_bun_executable == ''
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

Fixed both findings in action.yml. 'Setup Custom Bun Path': BUN_DIR now has newlines and carriage returns removed (printf '%s' | tr -d '\n\r') before it is written to $GITHUB_PATH. 'Revoke app token': moved steps.run.outputs.github_token into an env var (APP_TOKEN) and the script now uses it in quotes as "$APP_TOKEN". These are the same two changes the previous harden made, so they also cover the prior-fix finding. That earlier diff also showed 17 lines added near line 189, but their content wasn't in the diff, so they weren't reproduced. Nothing was tested; no workflow was run.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Revoke app token step: moved steps.run.outputs.github_token into env APP_TOKEN and referenced it as "Authorization: Bearer $APP_TOKEN".

