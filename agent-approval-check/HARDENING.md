<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.267

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.267** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): a GitHub Actions expression is placed directly inside a run: shell command. Offending line: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. Use the runner-provided env var instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

### prior-fix (severity: high)

Carried forward from this version's previous harden, which fixed it; fix it again unless the code no longer has the problem. The previous harden changed action.yml without recording a finding for it, and this analysis reported nothing there. Re-apply its security changes unless the code no longer needs them. The previous patch:
```diff
diff --git a/agent-approval-check/action.yml b/agent-approval-check/action.yml
index 4863f3b..88d6504 100644
--- a/agent-approval-check/action.yml
+++ b/agent-approval-check/action.yml
@@ -49,12 +49,29 @@ inputs:
 runs:
   using: composite
   steps:
     - uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065 # v5
       with:
         python-version: "3.12"
     - run: pip install 'httpx==0.28.1' 'pyyaml==6.0.3' 'tenacity==9.1.4'
       shell: bash
-    - run: python "${{ github.action_path }}/agent_approval_check.py"
+    - run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"
       shell: bash
       env:
         GH_TOKEN: ${{ inputs.github_token }}

```

Locations:

- `action.yml`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, prior-fix

**Notes:**

In action.yml, replaced the inline ${{ github.action_path }} in the run: line with "$GITHUB_ACTION_PATH" (shell: bash), re-applying the earlier harden's patch. The setup-python action was already pinned to a commit SHA.

