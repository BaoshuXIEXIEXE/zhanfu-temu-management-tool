# TEMU US message rules

Shared operational baseline for the stores already under management: 2026-09-09. Every current or future authorized store uses these same classification and cleanup rules. For a newly registered store, record its monitoring activation date in the store registry or run record; messages from that date forward are time-sensitive. Earlier messages may use the standing historical-cleanup rules, but an active ticket discovered during verification must still be reported even if its notification is marked read.

“Clear” always means mark read, not delete.

## Categories

- 店铺通知: summarize ordinary promotions, product features, courses, traffic suggestions, and “未推广商品盘点”, then mark read. Keep new pre-sale/after-sale tickets, service-quality warnings, fund/account restrictions, penalties, and active deadlines unread. Under the standing authorization, notifications before 2026-09-09 may be marked read even when not individually verified; this affects only the notification, not the underlying ticket.
- 商品合规: keep delisting, restriction, intellectual-property, quality, certification, fine, remediation, appeal deadline, or account-risk notices unread. Verify affected SPU/SKU and live sales status. Ordinary educational notices may be summarized and marked read.
- 订单履约: aggregate and mark read all “新流入订单通知” summaries. Keep new shipment, address, cancellation, logistics, or appeal risks unread. Old address-change notices over 45 days may be marked read. Mark expired delay-delivery or false-shipment appeal notices read only after the live appeal page confirms no 待申诉/待完善资料 record; one zero-result verification may cover the same filtered backlog, but record the filter and time.
- 售后通知: keep new refund, return, chargeback, customer complaint, failed-delivery, abnormal-tracking, and reshipment requests unread. Historical notices older than about 45 days, explicit final outcomes, automatic acceptance, cancelled orders with no remaining action, or items with no action entry may be marked read under the approved cleanup rule. Do not stop after the first page; clearing one layer may expose older pages.
- 库存管理: keep stockout, frozen inventory, abnormal return, or fulfillment-impacting notices unread. Summarize routine reports or recovered historical conditions, then mark read.
- 其他: summarize and mark read ordinary ad suggestions, traffic competition, courses, and duplicate marketing messages. Preserve anything involving money, product availability, account permissions, or a deadline until verified.

## Deadline handling

- Under 12 hours: alert immediately.
- 12–48 hours: same-day action list.
- More than 48 hours and actionable: watchlist with deadline.
- Expired: verify the destination page. If no action is available, record the outcome and mark read.

If a new or ambiguous message type does not fit these rules, keep it unread, inspect the destination page, and ask the user only when the business decision remains material.

## Standing cleanup authorization

- “清除” means mark read only; never delete records or resolve the underlying case.
- For stores under management on 2026-09-09, historical store notifications before that date may be marked read without individual verification. For a later-added store, use its recorded monitoring activation date as the equivalent boundary.
- After-sales older than about 45 days, explicit final outcomes, auto-accepted outcomes, and expired items with no action entry may be marked read.
- Expired fulfillment appeals may be marked read after the live appeal page shows no pending/actionable record for the relevant filters.
- Never use this authorization to submit replies, refunds, appeals, product changes, ad changes, or financial actions.
