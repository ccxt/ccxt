// Ambient declarations for the lighter WASM globals.
//
// loadLighterLibrary() imports Go's `wasm_exec.js` and instantiates lighter.wasm,
// which installs these symbols onto globalThis at runtime. Under noImplicitAny the
// bare `globalThis.SignCreateOrder (...)` calls in Exchange.ts would otherwise be
// TS7017 ("type 'typeof globalThis' has no index signature").
//
// They are declared here rather than cast at each call site because the eslint
// config whitelists exactly the `globalThis.` call shape
// (new-cap capIsNewExceptionPattern: '^Future$|^globalThis\\.'), so wrapping them
// in a parenthesised cast would trip new-cap on all 15 call sites.
//
// `var` is required: only `var` declarations in a global block become properties
// of `typeof globalThis`. This is a declaration-only file, so no code is emitted.
/* eslint-disable no-var, no-unused-vars, vars-on-top */
declare global {
    var Go: any;
    var CreateClient: (...args: any[]) => any;
    var CreateAuthToken: (...args: any[]) => any;
    var GenerateAPIKey: (...args: any[]) => any;
    var SignCreateOrder: (...args: any[]) => any;
    var SignCreateGroupedOrders: (...args: any[]) => any;
    var SignCancelOrder: (...args: any[]) => any;
    var SignCancelAllOrders: (...args: any[]) => any;
    var SignModifyOrder: (...args: any[]) => any;
    var SignWithdraw: (...args: any[]) => any;
    var SignCreateSubAccount: (...args: any[]) => any;
    var SignTransfer: (...args: any[]) => any;
    var SignUpdateLeverage: (...args: any[]) => any;
    var SignUpdateMargin: (...args: any[]) => any;
    var SignApproveIntegrator: (...args: any[]) => any;
    var SignChangePubKey: (...args: any[]) => any;
}
/* eslint-enable no-var, no-unused-vars, vars-on-top */

export {};
