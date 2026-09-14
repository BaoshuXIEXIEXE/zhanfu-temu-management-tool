# Official TEMU Open Platform API

TEMU provides an official Partner/Open Platform for sellers, in-house seller systems, and ISVs. Prefer it over browser automation when the approved API scope covers the task.

## Confirmed platform facts

- API calls use HTTPS POST requests to a regional router. The US production router documented by TEMU is `https://openapi-b-us.temu.com/openapi/router`.
- An application needs an `app_key`, signing secret, seller authorization, an access token, and the appropriate permission package/API scope.
- Cross-border US sellers authorize apps through Seller Central's Open Platform client-management area. Never copy tokens into chat, logs, Git, or Skill files.
- Official documentation exposes scopes for orders, order details/amounts/shipping information, products, stock, logistics/shipment, after-sales, access-token information, message updates, and subscription events such as order status, logistics address changes, after-sales status, and cancellation status.
- Availability varies by seller type, region, app type, permission package, allowlist, and current approval. Do not infer that an endpoint is available to a store until the live authorization scope confirms it.

## Architecture

1. Use the API for scheduled monitoring, structured order/product/inventory/fulfillment/after-sales reads, and supported event subscriptions.
2. Use ZhanFu/CDP for Seller Central screens or actions not exposed in the authorized API scope, including message-center categories unless a matching official endpoint is verified.
3. Keep API credentials in the execution host's secret store or environment, never in GitHub or user-facing reports.
4. Treat write endpoints as consequential actions: the Skill's existing approval gates still apply even when an API makes the action technically possible.

## Adoption gate

Before implementation, verify the user's seller type and region, register or select a Partner Platform app, review requested scopes, complete TEMU's required compliance/security process, and obtain explicit user approval before creating credentials or authorizing stores.
