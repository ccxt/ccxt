// JSON APIs (and other machine-readable bodies). The response is handed to src/mappers/<mapper>.ts,
// loaded by name, so adding a mapper is just adding a file (no central registration).
// A mapper's default export is `(data: unknown, raw: string, ctx: MapperContext) => RawEntry[]`:
// `data` is the parsed JSON, or undefined when the body is not JSON (a JS bundle, CSV, ...),
// and `raw` is always the response text.
import { normalizeWhitespace } from '../normalize.ts';
import type { RawEntry, SourceConfig } from '../types.ts';
import type { Adapter } from './types.ts';

export interface MapperContext {
    source: SourceConfig;
    url: string;        // the url that was fetched (after {yyyy}/{mm} and discover)
    now: Date;
}

export type Mapper = (data: unknown, raw: string, ctx: MapperContext) => RawEntry[];

export async function loadMapper (name: string): Promise<Mapper> {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test (name)) {
        throw new Error (`invalid mapper name "${name}"`);
    }
    let mod: { default?: unknown };
    try {
        mod = await import (`../mappers/${name}.ts`);
    } catch (e) {
        throw new Error (`mapper "${name}" not found in src/mappers/ (${(e as Error).message})`);
    }
    if (typeof mod.default !== 'function') {
        throw new Error (`mapper "${name}" has no default export function`);
    }
    return mod.default as Mapper;
}

export const json: Adapter = async ({ source, body, url, now }) => {
    if (!source.mapper) {
        throw new Error ('json source needs a "mapper"');
    }
    let data: unknown;
    try {
        data = JSON.parse (body);
    } catch {
        data = undefined;
    }
    const mapper = await loadMapper (source.mapper);
    const entries = mapper (data, body, { source, url, now });
    if (!Array.isArray (entries)) {
        throw new Error (`mapper "${source.mapper}" did not return an array`);
    }
    const snapshot = normalizeWhitespace (entries.map ((e) => `${e.dateText ?? ''} ${e.title}\n${e.body}`).join ('\n\n'));
    return { entries, snapshot };
};
