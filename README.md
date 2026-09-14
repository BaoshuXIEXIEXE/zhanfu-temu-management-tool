# 站斧 + TEMU 管理工具

Continuously updated source of truth for managing authorized TEMU US Seller Central stores through ZhanFu and approved TEMU Open Platform APIs. The repository keeps the Mac planning task and the dedicated Windows execution task on the same reviewed rule set.

## What it supports

- Securely start or reuse an authorized ZhanFu shop session and verify kernel 140, a live WebDriver/CDP endpoint, the TEMU Seller Central domain, and the visible US site.
- Run `消息过滤 <店铺入口>` across all six message categories: 店铺通知、商品合规、订单履约、售后通知、库存管理、其他.
- Traverse every page/backlog layer, mark only approved low-risk or closed historical notices as read, retain actionable risks, and finish with a six-category readback.
- Triage deadlines, pre-sale/after-sale tickets, refunds, returns, chargebacks, delivery failures, tracking exceptions, fulfillment appeals, compliance/IP notices, inventory risk, ads, traffic, ROAS, finance, and account health.
- Locate products, orders, tickets, SPU/SKU records and prepare evidence, summaries, drafts, and recommended actions.
- Prefer authorized official TEMU APIs for structured monitoring and supported operations; use ZhanFu/CDP for Seller Central capabilities outside the approved API scope.

## Safety boundary

“Clear” means **mark read**, never delete. Reading, classification, aggregation, comparison, and mark-read actions covered by approved rules may run directly. Customer replies, refunds/returns, chargeback evidence, appeals, listing or pricing changes, listing/unlisting, ad budget/bid changes, procurement, and funds/account actions require the user's approval before submission.

Credentials, cookies, tokens, OTPs, customer data, and real shop IDs are not stored in this repository. Touch ID, CAPTCHA, verification codes, and 2FA remain user actions.

## Skills

- `skills/zhanfu-temu-management`: shared store-management rules, six-category message filtering, official-API routing, reporting, and approval gates.
- `skills/zhanfu-temu-us-launcher`: deterministic Mac launcher and live US-site verification.

The Windows execution host follows the same business rules but uses its local ZhanFu installation and paths. Host-specific launch adapters and `stores.local.json` remain local until separately reviewed and sanitized.

## Store configuration

Copy `config/stores.example.json` to the launcher's local `assets/stores.json`, then populate only stores explicitly authorized by the user. Never commit the populated file.

## Synchronization contract

`main` is the shared rule source. When the user says `消息过滤skill调整` in either the Mac or Windows task:

1. Update the relevant Skill/reference files.
2. Validate the Skill.
3. Commit and push the rule delta.
4. Update the other host to the same commit.
5. Report “双端已同步” only after both hosts read back the same validated commit.

If one host is offline, report exactly which host was updated and keep the other pending.

## Current operating command

```text
消息过滤13
```

The number selects the registered target store only. The same workflow applies to every current or future authorized store.
