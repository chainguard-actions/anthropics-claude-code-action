<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value built from untrusted input to $GITHUB_PATH without stripping newlines. BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), where PATH_TO_BUN_EXECUTABLE is ${{ inputs.path_to_bun_executable }}, then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. There is no `printf '%s' ... | tr -d '\n\r'` step, so a value containing a newline can add arbitrary PATH entries.

Locations:

- `action.yml:217`

### script-injection (severity: high)

Sub-rule (a): step 'Revoke app token' puts an expression directly inside a run: script: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}" \`. The step output is inserted into the shell script by template substitution before bash runs. Pass it through an env: variable instead and quote it as "$VAR".

Locations:

- `action.yml:457`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/action.yml b/action.yml
index cf636eb..7442fc6 100644
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
-          ${GITHUB_API_URL:-https://api.github.com}/installation/token || true
+          "${GITHUB_API_URL:-https://api.github.com}/installation/token" || true

```

Locations:

- `action.yml`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, prior-fix

**Notes:**

action.yml: In 'Setup Custom Bun Path', newlines and carriage returns are now stripped from BUN_DIR before it is written to $GITHUB_PATH. In 'Revoke app token', steps.run.outputs.github_token now comes in through env as APP_TOKEN and is used as "$APP_TOKEN". The API URL is now quoted. This brings back the earlier harden's changes. The earlier diff also had a 17-line insertion at the top of runs.steps, but its content was missing from the patch, so it could not be re-applied. A search found no other ${{ }} expressions left inside run scripts.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Revoke app token step: moved steps.run.outputs.github_token into env APP_TOKEN and referenced it as "Authorization: Bearer $APP_TOKEN" in the curl command.

