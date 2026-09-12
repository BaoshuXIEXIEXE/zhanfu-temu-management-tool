#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.dirname(scriptDir);
const config = JSON.parse(fs.readFileSync(path.join(skillDir, "assets", "stores.json"), "utf8"));
const storeName = process.argv[2];
const startTimeoutMs = 45_000;
const shopTimeoutMs = 75_000;
const cdpTimeoutMs = 60_000;
const zhanfuBinary = "/Applications/站斧.app/Contents/MacOS/站斧";
const awakeBinary = "/Users/mr.tse/.local/bin/codex-run-awake";
const playwrightCandidates = [
  process.env.ZHANFU_PLAYWRIGHT_PATH,
  "/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/playwright",
].filter(Boolean);

function emit(payload, code = 0) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(code);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function zhanfuCall(action, { browserId, args = "" } = {}) {
  const body = { action, module: "WebDriverModule", args };
  if (browserId !== undefined) body.browserId = String(browserId);
  const response = await fetchWithTimeout(`http://127.0.0.1:${config.apiPort}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`ZhanFu HTTP ${response.status}`);
  return await response.json();
}

async function apiReady() {
  try {
    const result = await zhanfuCall("GetBrowserList", {
      args: JSON.stringify({ page: 1, limit: 1 }),
    });
    return result?.ret === 200;
  } catch {
    return false;
  }
}

function startZhanfu() {
  if (!fs.existsSync(zhanfuBinary)) {
    emit({ status: "zhanfu_not_installed", path: zhanfuBinary }, 10);
  }
  const runner = fs.existsSync(awakeBinary) ? awakeBinary : zhanfuBinary;
  const args = fs.existsSync(awakeBinary)
    ? [zhanfuBinary, "--multip", "--run_type=web_driver", "--ipc_type=http", `--httpport=${config.apiPort}`]
    : ["--multip", "--run_type=web_driver", "--ipc_type=http", `--httpport=${config.apiPort}`];
  const logPath = "/private/tmp/zhanfu-temu-webdriver.log";
  const logFd = fs.openSync(logPath, "a");
  const child = spawn(runner, args, {
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });
  child.unref();
  return logPath;
}

async function waitFor(check, timeoutMs, intervalMs = 1_000) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await check();
      if (last) return last;
    } catch (error) {
      last = error;
    }
    await sleep(intervalMs);
  }
  return null;
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const candidate of playwrightCandidates) {
    try {
      return require(candidate);
    } catch {
      // Try the next known local runtime.
    }
  }
  emit({ status: "playwright_not_found", searched: playwrightCandidates }, 11);
}

function isDisposable(url) {
  try {
    const parsed = new URL(url);
    if (config.disposableStartupHosts.includes(parsed.hostname)) return true;
  } catch {
    // Extension URLs are handled by prefix below.
  }
  return config.disposableExtensionPrefixes.some((prefix) => url.startsWith(prefix));
}

async function findSellerBookmark(page) {
  await page.goto("chrome://bookmarks/", { waitUntil: "domcontentloaded", timeout: 15_000 });
  const rows = await page.evaluate((title) => new Promise((resolve) => {
    chrome.bookmarks.search({ title }, resolve);
  }), config.bookmarkTitle);
  const exact = rows.find((row) => row.title === config.bookmarkTitle && row.url);
  return exact?.url || null;
}

async function chooseUsSite(page) {
  const usCard = page.locator(".site-main_content__33Kw-").filter({
    has: page.locator(".site-main_text__P8Cf-", { hasText: /^美国$/ }),
  });
  if (await usCard.count()) {
    await usCard.locator(".site-main_enter__NhcoF").click();
    await page.waitForTimeout(2_000);
  }

  const knownAuthorization = "您授权“卖家中心”与Seller Central共享您的账号ID和店铺名称";
  const authorizationVisible = await page.getByText("同意并授权进入", { exact: true }).count();
  if (authorizationVisible) {
    const bodyText = await page.locator("body").innerText();
    if (!bodyText.includes(knownAuthorization)) {
      emit({ status: "authorization_changed", store: storeName, url: page.url() }, 21);
    }
    const label = page.locator("label[data-testid=beast-core-checkbox]");
    const checkbox = page.locator("input[type=checkbox]");
    if (!(await checkbox.isChecked())) await label.evaluate((element) => element.click());
    if (!(await checkbox.isChecked())) {
      emit({ status: "authorization_checkbox_failed", store: storeName }, 22);
    }
    await page.getByText("同意并授权进入", { exact: true }).evaluate((element) => element.click());
  }
}

async function main() {
  if (!storeName || !config.authorizedStores[storeName]) {
    emit({
      status: "invalid_store",
      allowedStores: Object.keys(config.authorizedStores),
      usage: "zhanfu-temu <店铺名称>",
    }, 2);
  }

  let startedByLauncher = false;
  let logPath = null;
  if (!(await apiReady())) {
    startedByLauncher = true;
    logPath = startZhanfu();
    const ready = await waitFor(apiReady, startTimeoutMs, 1_500);
    if (!ready) {
      emit({
        status: "zhanfu_restart_required",
        store: storeName,
        message: "ZhanFu may already be running without WebDriver mode. Quit it, then rerun.",
        logPath,
      }, 12);
    }
  }

  const mallResponse = await zhanfuCall("GetMallByName", {
    args: JSON.stringify({ mallName: storeName }),
  });
  const mall = mallResponse?.returnObj?.data;
  if (!mallResponse?.returnObj?.success || !mall) {
    emit({ status: "store_not_found", store: storeName, response: mallResponse }, 13);
  }
  const expectedMallId = config.authorizedStores[storeName].mallId;
  if (expectedMallId && Number(mall.mall_id) !== Number(expectedMallId)) {
    emit({
      status: "store_identity_mismatch",
      store: storeName,
      expectedMallId,
      actualMallId: mall.mall_id,
    }, 13);
  }

  let driverResponse = await zhanfuCall("GetBrowserWebDriver", { browserId: mall.mall_id });
  if (!driverResponse?.returnObj?.success) {
    const openResponse = await zhanfuCall("OpenBrowser", {
      browserId: mall.mall_id,
      args: JSON.stringify({
        isDownLoadConfirm: false,
        isOpenMallIndex: true,
        isSwitchDynamicNetwork: false,
      }),
    });
    if (openResponse?.ret !== 200 || openResponse?.returnObj !== true) {
      emit({ status: "store_open_failed", store: storeName, response: openResponse }, 14);
    }
    driverResponse = await waitFor(async () => {
      const response = await zhanfuCall("GetBrowserWebDriver", { browserId: mall.mall_id });
      return response?.returnObj?.success ? response : null;
    }, shopTimeoutMs, 2_000);
  }

  const driver = driverResponse?.returnObj;
  if (!driver?.success) {
    emit({ status: "webdriver_port_missing", store: storeName, response: driverResponse }, 15);
  }
  if (Number(driver.KernalNumber) !== Number(config.requiredKernel)) {
    emit({
      status: "kernel_update_required",
      store: storeName,
      mallId: mall.mall_id,
      actualKernel: driver.KernalNumber,
      requiredKernel: config.requiredKernel,
    }, 16);
  }

  const cdpVersion = await waitFor(async () => {
    try {
      const response = await fetchWithTimeout(`http://127.0.0.1:${driver.WebDriverPort}/json/version`, {}, 3_000);
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }, cdpTimeoutMs, 2_000);
  if (!cdpVersion) {
    emit({
      status: "cdp_port_not_listening",
      store: storeName,
      port: driver.WebDriverPort,
      kernel: driver.KernalNumber,
    }, 17);
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${driver.WebDriverPort}`);
  const context = browser.contexts()[0];
  const closedTabs = [];
  for (const page of context.pages()) {
    if (isDisposable(page.url())) {
      closedTabs.push({ title: await page.title().catch(() => ""), url: page.url() });
      await page.close();
    }
  }

  let temuPage = context.pages().find((page) => {
    try {
      return new URL(page.url()).hostname === config.sellerCentralHost;
    } catch {
      return false;
    }
  });

  if (!temuPage) {
    let gatewayPage = context.pages().find((page) => page.url().startsWith("https://seller.kuajingmaihuo.com"));
    if (!gatewayPage) gatewayPage = await context.newPage();
    if (!gatewayPage.url().startsWith("https://seller.kuajingmaihuo.com")) {
      const bookmarkUrl = await findSellerBookmark(gatewayPage);
      if (!bookmarkUrl) {
        await browser.close();
        emit({ status: "seller_bookmark_missing", store: storeName, bookmark: config.bookmarkTitle }, 18);
      }
      await gatewayPage.goto(bookmarkUrl, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
    }
    await gatewayPage.waitForTimeout(3_000);
    if (new URL(gatewayPage.url()).pathname === "/login") {
      await browser.close();
      emit({
        status: "needs_user_login",
        store: storeName,
        message: "Complete password autofill, Touch ID, CAPTCHA, or 2FA in the open TEMU window, then rerun.",
      }, 20);
    }
    if (gatewayPage.url().includes("/settle/site-main")) {
      await chooseUsSite(gatewayPage);
    }
    temuPage = await waitFor(() => context.pages().find((page) => {
      try {
        return new URL(page.url()).hostname === config.sellerCentralHost;
      } catch {
        return false;
      }
    }), 30_000, 1_000);
  }

  if (!temuPage) {
    await browser.close();
    emit({ status: "us_seller_central_not_opened", store: storeName }, 23);
  }
  await temuPage.waitForTimeout(4_000);
  const bodyText = await temuPage.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
  const finalHost = new URL(temuPage.url()).hostname;
  const usVerified = finalHost === config.sellerCentralHost && bodyText.includes("美国");
  const result = {
    status: usVerified ? "ready" : "us_site_unverified",
    store: storeName,
    mallId: mall.mall_id,
    platform: mall.platform_name,
    kernel: driver.KernalNumber,
    cdpPort: driver.WebDriverPort,
    browser: cdpVersion.Browser,
    finalUrl: temuPage.url(),
    usVerified,
    closedTabs,
    startedByLauncher,
    logPath,
    storeConfigValidated: Boolean(config.authorizedStores[storeName].validated),
  };
  await browser.close();
  emit(result, usVerified ? 0 : 24);
}

main().catch((error) => {
  emit({ status: "unexpected_error", store: storeName, error: String(error?.stack || error) }, 99);
});
