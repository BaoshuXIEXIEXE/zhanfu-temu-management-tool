---
name: zhanfu-temu-us-launcher
description: Start or reuse an authorized ZhanFu shop browser and enter the TEMU US Seller Central. Use when the user asks to open 13希音, 14希音, 26希音, or 27希音 for TEMU US operations, verify ZhanFu WebDriver/CDP readiness, close known startup tabs, or resume after Touch ID login.
---

# 站斧 TEMU 美国站快速启动

Use the deterministic launcher instead of reconstructing the ZhanFu startup sequence with individual tool calls.

## Run

```bash
zhanfu-temu <店铺名称>
```

Allowed stores are defined in `assets/stores.json`. The initial validated store is `27希音`.

The launcher defaults to the **United States site for a semi-managed China-based seller**. It must not silently enter a different market or seller model.

The launcher:

1. Reuses the ZhanFu WebDriver HTTP service on `127.0.0.1:12678`, or starts ZhanFu with the official WebDriver arguments when it is not running.
2. Resolves the exact shop name through `GetMallByName` and opens only that shop.
3. Requires browser kernel 140 and verifies the returned CDP `/json/version` endpoint before browser automation.
4. Uses a confirmed startup page to reach the Seller Central bookmark, then closes confirmed unrelated startup, SHEIN, extension, marketing, blank, and duplicate tabs.
5. Opens the bookmark named `卖家中心`, selects the US entry, and verifies the final host is `agentseller-us.temu.com`.
6. Returns compact JSON with `ready`, `needs_user_login`, or a precise failure state.

If the result is `needs_user_login`, ask the user to complete Touch ID, password autofill, CAPTCHA, or 2FA in the open shop window, then rerun the same command. Never request, read, print, or persist credentials, cookies, or tokens.

The user has authorized the known Seller Central account-ID/store-name sharing dialog for these named US shops only. The launcher may accept it only when the displayed text matches the known authorization copy. Stop if the agreement text or requested data scope changes.

## Boundaries

- Do not silently restart an already-running non-WebDriver ZhanFu instance. Report `zhanfu_restart_required` so the user can explicitly authorize the restart.
- Do not claim kernel correction succeeded from configuration intent. Require `KernalNumber: 140` in the live API response.
- The public ZhanFu WebDriver API does not expose an update-existing-shop action. Report `kernel_update_required` instead of inventing an API call.
- Do not open, close, or operate shops outside `assets/stores.json`.
- Enter only the TEMU US site. Stop if the final host or visible site indicator is not US.
- Once TEMU US is ready, retain only the Seller Central page(s) required for the active task in the authorized store browser. Do not close a page whose purpose is unclear, and do not touch the user's personal-browser tabs.
- Startup navigation and read-only verification are allowed. Customer replies, refunds, appeals, product changes, ad changes, and publication require their separate approval rules.
- Keep the Mac awake and unlocked for GUI-dependent steps. Do not claim the workflow can run while the Mac is asleep or offline.
