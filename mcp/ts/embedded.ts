import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The one seam between the two shapes this server ships in.
//
// Installed from npm it is a directory of modules: the view files sit in ./ui, the method
// documentation in ./data and the version in ../package.json, and readAsset () below reads
// them from disk exactly as the individual modules used to.
//
// The single-file bundle (scripts/build-bundle.mjs -> js/bundle/ccxt-mcp.mjs) is what the
// plugin's bootstrap downloads for hosts whose users have no npm; it must run with nothing
// next to it. The bundler therefore swaps THIS module for a generated one with the same
// three exports, whose EMBEDDED map holds every asset as a string. Nothing else in the
// server knows which of the two it is running as.
const EMBEDDED: Record<string, string> | undefined = undefined;

const here = path.dirname (fileURLToPath (import.meta.url));

// name is a "/"-separated path relative to this module: 'ui/chart.html', 'data/method-docs.json'.
// Throws when the asset does not exist, like the fs.readFileSync it replaces.
export function readAsset (name: string): string {
    const embedded = EMBEDDED?.[name];
    if (embedded !== undefined) {
        return embedded;
    }
    return fs.readFileSync (path.join (here, ...name.split ('/')), 'utf8');
}

export function hasAsset (name: string): boolean {
    if (EMBEDDED !== undefined) {
        return EMBEDDED[name] !== undefined;
    }
    return fs.existsSync (path.join (here, ...name.split ('/')));
}

export function packageVersion (): string {
    const embedded = EMBEDDED?.['version'];
    if (embedded !== undefined) {
        return embedded;
    }
    return JSON.parse (fs.readFileSync (path.join (here, '..', 'package.json'), 'utf8')).version;
}
