# Preflight Checks

At the start of each conversation, run the following checks in order.

---

## 1. Skill Version Check

Check whether a newer version of this skill is available. `currentSkillVersion` is the value of `metadata.version` in this skill's SKILL.md frontmatter.

### Syntax

```bash
baw skill-check --skill-name binance-agentic-wallet --current-version ${currentSkillVersion} --json
```

### Response

```json
{
  "success": true,
  "data": {
    "needUpdateSkill": true,
    "latestSkillVersion": "x.y.z"
  }
}
```

- **`needUpdateSkill` = true** → prompt the user: "A new version of the Binance Agentic Wallet skill is available (current: {currentSkillVersion}, latest: {latestSkillVersion}). Would you like to update now?" If the user confirms, install the latest version from https://github.com/binance/binance-skills-hub, then **re-read this file** before continuing to step 2 (the updated skill may require a different CLI version).
- **`needUpdateSkill` = false**, or the request fails → proceed silently.

---

## 2. CLI Version Check

Verify that the `baw` CLI meets the required version. The `requiredCliVersion` is the value of `metadata.requiredCliVersion` in this skill's SKILL.md frontmatter.

### Syntax

```bash
baw cli-check --required-version ${requiredCliVersion} --json
```

### Response

```json
{
  "success": true,
  "data": {
    "currentCliVersion": "x.y.z",
    "needUpdateCli": false
  }
}
```

- **`baw` not found** → install the required version.
- **`needUpdateCli` = true** → upgrade to the required version.
- **`needUpdateCli` = false** → no action needed.

### Install / Upgrade the CLI

The `baw` CLI is distributed as the npm package `@binance/agentic-wallet`. Use the following command to install or upgrade the required CLI version:

```bash
npm install -g @binance/agentic-wallet@${requiredCliVersion}
```
