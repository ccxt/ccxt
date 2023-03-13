declare const isBrowser: boolean;
declare const isElectron: boolean;
declare const isWebWorker: boolean;
declare const isWindows: boolean;
declare const isNode: boolean;
declare const defaultFetch: typeof fetch | {
    (u: any, options: any): any;
    http: any;
    https: any;
};
export { isBrowser, isElectron, isWebWorker, isNode, isWindows, defaultFetch, };
