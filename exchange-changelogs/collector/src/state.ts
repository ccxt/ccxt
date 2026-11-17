// Per-source state: conditional-GET validators, run counters and health.
import type { SourceConfig, VenueConfig } from './types.ts';

export interface SourceState {
    id: string;
    venue: string;
    etag?: string;
    lastModified?: string;
    contentHash?: string;           // sha256 of the last stored snapshot
    successfulRuns: number;         // 0 => next successful run is the first one (backfill)
    lastIds: string[];              // ids parsed on the last successful run (reused on HTTP 304)
    missingRuns: Record<string, number>;   // id -> consecutive successful runs it was absent
    lastPageChangeAt: string | null;
    resolvedUrl?: string;           // discover: the url fetched on the last successful run
    configHash?: string;            // sourceConfigHash() of the run that stored etag/lastModified: validators are
                                    // only sent while the registry entry (and PARSER_VERSION) is unchanged
    parserVersion?: number;         // PARSER_VERSION of the last parsed run (absent: 1)
    months?: Record<string, string[]>;     // {yyyy}/{mm} sources: "YYYY-MM" -> ids ever seen in that month's file
                                    // (only months still fetched; their ids are the ones removal tracking covers)
    health: {
        ok: boolean;
        lastRunAt: string;
        lastOkAt: string | null;
        lastError: string | null;
        consecutiveFailures: number;
        entryCount: number;         // entries parsed on the last successful run
        latestDate: string | null;
    };
}

export function emptyState (venue: VenueConfig, source: SourceConfig): SourceState {
    return {
        id: source.id,
        venue: venue.id,
        successfulRuns: 0,
        lastIds: [],
        missingRuns: {},
        lastPageChangeAt: null,
        health: {
            ok: false,
            lastRunAt: '',
            lastOkAt: null,
            lastError: null,
            consecutiveFailures: 0,
            entryCount: 0,
            latestDate: null,
        },
    };
}

export function recordFailure (state: SourceState, error: string, now: string): SourceState {
    return {
        ...state,
        health: {
            ...state.health,
            ok: false,
            lastRunAt: now,
            lastError: error,
            consecutiveFailures: state.health.consecutiveFailures + 1,
        },
    };
}
