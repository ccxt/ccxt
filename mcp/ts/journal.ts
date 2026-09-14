import fs from 'fs';
import path from 'path';
import { cacheDirectory } from './config.js';
import { log } from './logging.js';
import { redact } from './redact.js';

const WARN_SIZE_BYTES = 50 * 1024 * 1024; // a month of records can't reach this except via a pathological loop — the warning IS the loop detector
const DAY_MS = 24 * 60 * 60 * 1000;

export type JournalEvent = 'intent' | 'result' | 'rejected' | 'declined' | 'error';

export interface JournalRecord {
    ts: string;
    event: JournalEvent;
    intentId: string;
    account: string;
    exchange: string;
    environment: string;
    tool: string;
    method: string;
    params?: any;
    clientOrderId?: string;
    computed?: Record<string, any>;
    outcome?: Record<string, any>;
    error?: Record<string, any>;
}

// Append-only JSONL audit trail for every mutating call. Intent records are flushed with
// fsync BEFORE dispatch so a crash mid-order leaves evidence; the daily notional
// accumulator is derived from these records so caps survive restarts.
export class Journal {
    private dir: string;
    private sizeWarned = false;

    constructor (dir?: string) {
        this.dir = dir ?? path.join (cacheDirectory (), 'journal');
        fs.mkdirSync (this.dir, { 'recursive': true });
    }

    currentFile (): string {
        const now = new Date ();
        const month = now.toISOString ().slice (0, 7); // YYYY-MM
        return path.join (this.dir, month + '.jsonl');
    }

    location (): string {
        return this.dir;
    }

    append (record: JournalRecord, fsyncBeforeReturn = false): void {
        const file = this.currentFile ();
        const line = redact (JSON.stringify (record)) + '\n';
        const fd = fs.openSync (file, 'a', 0o600);
        try {
            fs.writeSync (fd, line);
            if (fsyncBeforeReturn) {
                fs.fsyncSync (fd);
            }
        } finally {
            fs.closeSync (fd);
        }
        this.warnIfLarge (file);
    }

    private warnIfLarge (file: string): void {
        if (this.sizeWarned) {
            return;
        }
        try {
            const stats = fs.statSync (file);
            if (stats.size > WARN_SIZE_BYTES) {
                this.sizeWarned = true;
                log ('warning', 'journal file ' + file + ' exceeds 50 MB — this volume of mutating calls usually means a runaway loop; the journal is never auto-deleted, prune it manually if intended');
            }
        } catch (e) {
            // stat failure is not worth surfacing
        }
    }

    // rolling 24h sum of dispatched order/transfer values for one account (USD reference)
    dispatchedValueLast24h (account: string): number {
        const cutoff = Date.now () - DAY_MS;
        let total = 0;
        for (const file of this.recentFiles ()) {
            let content: string;
            try {
                content = fs.readFileSync (file).toString ();
            } catch (e) {
                continue;
            }
            for (const line of content.split ('\n')) {
                if (line === '') {
                    continue;
                }
                let record: JournalRecord;
                try {
                    record = JSON.parse (line);
                } catch (e) {
                    continue;
                }
                if (record.event !== 'intent' || record.account !== account) {
                    continue;
                }
                if (new Date (record.ts).getTime () < cutoff) {
                    continue;
                }
                const value = record.computed?.['orderValue'];
                if (typeof value === 'number' && Number.isFinite (value)) {
                    total += value;
                }
            }
        }
        return total;
    }

    // intents from a previous run that never got a result — surfaced by get_safety_status
    unresolvedIntents (): JournalRecord[] {
        const resolved = new Set<string> ();
        const intents = new Map<string, JournalRecord> ();
        for (const file of this.recentFiles ()) {
            let content: string;
            try {
                content = fs.readFileSync (file).toString ();
            } catch (e) {
                continue;
            }
            for (const line of content.split ('\n')) {
                if (line === '') {
                    continue;
                }
                let record: JournalRecord;
                try {
                    record = JSON.parse (line);
                } catch (e) {
                    continue;
                }
                if (record.event === 'intent') {
                    intents.set (record.intentId, record);
                } else {
                    resolved.add (record.intentId);
                }
            }
        }
        return [ ...intents.values () ].filter ((record) => !resolved.has (record.intentId));
    }

    private recentFiles (): string[] {
        // current + previous month cover any rolling 24h window
        const now = new Date ();
        const previous = new Date (now.getTime ());
        previous.setUTCDate (0); // last day of the previous month
        const files = [
            path.join (this.dir, previous.toISOString ().slice (0, 7) + '.jsonl'),
            this.currentFile (),
        ];
        return files.filter ((file) => fs.existsSync (file));
    }
}
