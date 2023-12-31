// @ts-nocheck
// ----------------------------------------------------------------------------
// There's been a lot of messing with this code...
// The problem is to satisfy the following requirements:
// - properly detect isNode == true on server side and isNode == false in the browser (on client side)
// - make sure create-react-app, react-starter-kit and other react frameworks work
// - make sure it does not break the browserified version (when linked into a html from a cdn)
// - make sure it does not break the webpacking and babel-transpiled scripts
// - make sure it works in Electron
// - make sure it works with Angular.js
// - make sure it does not break other possible usage scenarios
const isBrowser = typeof window !== 'undefined';
const isElectron = typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.electron !== 'undefined';
const isWebWorker = typeof WorkerGlobalScope !== 'undefined' && (self instanceof WorkerGlobalScope);
const isWindows = typeof process !== 'undefined' && process.platform === "win32";
const isNode = !(isBrowser || isWebWorker);
// ----------------------------------------------------------------------------
export { isBrowser, isElectron, isWebWorker, isNode, isWindows, };
