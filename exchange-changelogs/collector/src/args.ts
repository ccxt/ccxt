import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { DEFAULT_DATA_DIR, DEFAULT_REGISTRY_DIR } from './store.ts';

export interface CliArgs {
    data: string;
    registry: string;
    venues: string[];
    sources: string[];
}

const list = (v: string | string[] | undefined): string[] =>
    (Array.isArray (v) ? v : (v ? [ v ] : [])).flatMap ((x) => x.split (',')).map ((x) => x.trim ()).filter (Boolean);

// Shared by collect, build-feed and run: --data <dir> --registry <dir> --venue a,b --source x,y
export function parseCliArgs (argv: string[]): CliArgs {
    const { values } = parseArgs ({
        args: argv,
        options: {
            data: { type: 'string' },
            registry: { type: 'string' },
            venue: { type: 'string', multiple: true },
            source: { type: 'string', multiple: true },
        },
        allowPositionals: false,
        strict: true,
    });
    return {
        data: values.data ? resolve (values.data) : DEFAULT_DATA_DIR,
        registry: values.registry ? resolve (values.registry) : DEFAULT_REGISTRY_DIR,
        venues: list (values.venue),
        sources: list (values.source),
    };
}
