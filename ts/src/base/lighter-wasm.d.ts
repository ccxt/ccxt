// Ambient declarations for the lighter WASM globals that loadLighterLibrary() installs
// onto globalThis; without them the bare `globalThis.SignCreateOrder (...)` calls in
// Exchange.ts are TS7017 under noImplicitAny. Declared here rather than cast per call
// site because eslint new-cap only whitelists the `^globalThis\\.` call shape. `var` is
// required: only `var` in a global block becomes a property of `typeof globalThis`.
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
