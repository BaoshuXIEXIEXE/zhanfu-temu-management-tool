# TEMU US “消息过滤” workflow

Use this workflow whenever the user says `消息过滤 <店铺入口>`.

## Scope and store resolution

- This workflow is store-agnostic. It applies to every current or future TEMU US store that the user has authorized and registered in the ZhanFu launcher store registry.
- Resolve the supplied entry number or name through the launcher registry. Current examples include `26`, `27`, `13`, and `14`; these examples are not a closed allowlist in this skill.
- A new store reuses this same workflow after it is added to the authorized registry. Do not create or copy a store-specific message-filter skill.
- Verify the live TEMU account name and visible 美国 site before reading or mutating messages. Report the live account name; do not infer it from the entry number.
- If the entry is absent from the authorized registry, stop before login or message mutation and ask the user to register/authorize that store.

## Required sequence

1. Resolve the requested store through the authorized launcher registry, then launch or reuse that ZhanFu session and verify kernel 140, live CDP, `agentseller-us.temu.com`, and 美国.
2. Record the initial unread badge for all six categories.
3. For each category, scan every page or repeatedly consume the unread list until clearing items no longer exposes additional messages.
4. For risky notification types, open the linked business page and record current state, deadline, identifiers, amount, and remaining action.
5. Mark read only items allowed by `message-rules.md`. Re-read the category after each batch because the first page may refill from deeper history.
6. Repeat until each category reaches a stable stopping condition: zero unread, or only intentionally retained items remain.
7. Read back all six badges and sample every retained type. Compare initial and final counts.

## Completion contract

Do not report completion unless all are true:

- all six categories were opened;
- all pagination/backlog layers were scanned;
- every remaining unread item is intentionally retained and represented in the report;
- urgent and same-day items were surfaced immediately;
- the final six-category readback is included;
- any blocked, timed-out, quota-limited, or unverified step is explicitly labelled incomplete.

If a badge remains `99+`, do not infer the quantity. Continue processing known safe types, then inspect the next exposed layer. A reduction hidden behind `99+` is progress but not completion.

## Report format

- Immediate: under 12 hours or active money/account/product risk.
- Today: 12–48 hours, active customer-service, logistics, inventory, or quality action.
- Compliance watchlist: complaint IDs, SPU/SKU, type, live sales status, appeal state.
- Cleared: counts by category and message type.
- Retained: counts by category and why each type remains unread.
- Final readback: 店铺通知 / 商品合规 / 订单履约 / 售后通知 / 库存管理 / 其他.

## Updating this skill

When the user says `消息过滤skill调整` in either the Mac planning task or the Windows execution task, treat it as a change to the same shared rule set. Update this workflow and `message-rules.md`, validate the skill, update the capability inventory and install log, and publish the revision to the configured GitHub remote. Then send the version/commit and rule delta to the peer task and require readback from the other host. Never claim both hosts are synchronized unless both installations report the same validated version; if one host is offline or inaccessible, report which host alone was updated and leave the other pending. Preserve approval boundaries unless the user explicitly changes them.
