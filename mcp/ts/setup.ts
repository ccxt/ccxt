// The account pages (setup_account / manage_accounts) live in ./setup/ — this file keeps the
// import path every caller already uses:
//   setup/session.ts    THE SECURITY CORE: session lifecycle, token / cookie / nonce, Host /
//                       Origin / fetch-metadata checks, request limits, response headers + CSP
//   setup/launch.ts     … and how the form URL reaches the browser (launch file, opener)
//   setup/pages.ts      the two page templates and their per-response substitutions
//   setup/accounts.ts   what a verified request does: credentials metadata, connection test,
//                       save / replace / remove, permissions, hot-apply to the running server
//   setup/server.ts     SetupServer: the core wired to the account actions
// session.ts and launch.ts import nothing from accounts.ts.
export { SESSION_TTL_MS, MAX_BODY_BYTES, SetupOpenError } from './setup/session.js';
export type { SetupPrefill, SetupOpenState, SetupPage, SetupOpened } from './setup/session.js';
export { browserCommand, defaultLaunchRoots, launchPage, openInBrowser } from './setup/launch.js';
export type { TierListing } from './setup/accounts.js';
export { SetupServer } from './setup/server.js';
export type { SetupDeps } from './setup/server.js';
