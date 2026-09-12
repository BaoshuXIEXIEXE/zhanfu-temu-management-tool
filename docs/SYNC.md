# Mac and Windows synchronization

## Source of truth

The GitHub `main` branch is authoritative for shared TEMU operating rules. Device-local paths, shop IDs, browser ports, sessions, and credentials are not shared.

## Efficient user workflow

The user only needs ordinary language:

- `消息过滤13`
- `打开站斧26`
- `消息过滤skill调整：……`

Codex resolves the target store from the device-local authorized registry and applies the shared rule version.

## Required readback

After a rule update, each host reports:

- Git commit;
- Skill validation result;
- installed Skill path;
- whether the current task has reloaded the version;
- any local adapter or login blocker.

Until both hosts report the same commit, synchronization is incomplete.
