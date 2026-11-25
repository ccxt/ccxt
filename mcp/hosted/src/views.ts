import { buildViewCatalog, readUiAsset, type ViewCatalog } from '../../ts/ui.js';

// The MCP Apps views are authored in mcp/ts/ui. Under tsx (dev, tests) they are read from
// there; the production bundle has no such directory, so scripts/build.mjs inlines every
// asset into the single output file through this define. Either way the catalog is rendered
// and hashed once per process, and the versioned URIs are identical to the local server's
// for the same files.
declare const __CCXT_UI_ASSETS__: Record<string, string> | undefined;

export function embeddedAssets (): Record<string, string> | undefined {
    return (typeof __CCXT_UI_ASSETS__ === 'undefined') ? undefined : __CCXT_UI_ASSETS__;
}

export function loadViewCatalog (): ViewCatalog {
    const assets = embeddedAssets ();
    if (assets === undefined) {
        return buildViewCatalog (readUiAsset);
    }
    return buildViewCatalog ((file) => {
        const text = assets[file];
        if (typeof text !== 'string') {
            throw new Error ('view asset ' + file + ' is missing from the bundle');
        }
        return text;
    });
}
