// ----------------------------------------------------------------------------
// Base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, ...).
// Extends the standard Exchange with event/outcome support.
// ----------------------------------------------------------------------------

import Exchange from './Exchange.js';
import { ArgumentsRequired, BadSymbol, ExchangeError, NotSupported } from './errors.js';
import { isEmpty } from './functions.js';
import type { Dictionary, Str } from './types.js';

export default class PredictionExchange extends Exchange {

    outcomes: Dictionary<any> = undefined;
    outcomes_by_id: Dictionary<any> = undefined;

    events: Dictionary<any> = undefined;
    events_by_slug: Dictionary<any> = undefined;
    reloadingEvents: boolean = undefined;
    eventsLoading: Promise<Dictionary<any>> = undefined;

    async loadMarketsAndEvents (reload = false, params = {}) {
        const res = await Promise.all ([ this.loadMarkets (reload, params), this.loadEvents (reload, params) ]);
        return {
            'markets': res[0],
            'events': res[1],
        };
    }

    async checkEventsAndMarkets (outcome: Str = undefined) {
        if (!this.events || isEmpty (this.events)) {
            throw new ArgumentsRequired ('Events are required to be loaded, please fetch them first, eg await ex.fetchEvents([\'Trump\'])');
        }
        if (outcome !== undefined) {
            if (!(outcome in this.outcomes) && !(outcome in this.outcomes_by_id)) {
                throw new ArgumentsRequired ('The specified outcome is not valid/available, please fetch events and outcomes first, eg await ex.fetchEvents([\'Trump\'])');
            }
        }
    }

    async fetchEvents (params = {}): Promise<any[]> {
        throw new NotSupported (this.id + ' fetchEvents() is not supported yet');
    }

    setEvents (events: any[]): Dictionary<any> {
        this.events = {};
        this.events_by_slug = {};
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const id = this.safeString (event, 'id');
            const slug = this.safeString (event, 'slug');
            if (id !== undefined) {
                this.events[id] = event;
            }
            if (slug !== undefined) {
                this.events_by_slug[slug] = event;
            }
        }
        return this.events;
    }

    async loadEventsHelper (reload = false, params = {}) {
        if (!reload && this.events) {
            return this.events;
        }
        const events = await this.fetchEvents (params);
        return this.setEvents (events);
    }

    async loadEvents (reload = false, params = {}): Promise<Dictionary<any>> {
        if ((reload && !this.reloadingEvents) || !this.eventsLoading) {
            this.reloadingEvents = true;
            this.eventsLoading = this.loadEventsHelper (reload, params).then ((resolved) => {
                this.reloadingEvents = false;
                return resolved;
            }, (error) => {
                this.reloadingEvents = false;
                throw error;
            });
        }
        return this.eventsLoading;
    }

    outcome (outcomeSymbol: string): any {
        if (this.outcomes === undefined) {
            throw new ExchangeError (this.id + ' outcomes not loaded');
        }
        if (outcomeSymbol in this.outcomes) {
            return this.outcomes[outcomeSymbol];
        }
        if (outcomeSymbol in this.outcomes_by_id) {
            return this.outcomes_by_id[outcomeSymbol];
        }
        throw new BadSymbol (this.id + ' does not have outcome symbol ' + outcomeSymbol);
    }

    safeOutcome (outcomeIdOrSymbol: Str, outcomeObj: any = undefined): any {
        if (outcomeIdOrSymbol !== undefined) {
            if (this.outcomes !== undefined && outcomeIdOrSymbol in this.outcomes) {
                return this.outcomes[outcomeIdOrSymbol];
            }
            if (this.outcomes_by_id !== undefined && outcomeIdOrSymbol in this.outcomes_by_id) {
                return this.outcomes_by_id[outcomeIdOrSymbol];
            }
        }
        if (outcomeObj !== undefined) {
            return outcomeObj;
        }
        return { 'id': outcomeIdOrSymbol, 'symbol': outcomeIdOrSymbol, 'marketSymbol': undefined, 'label': undefined, 'info': {} };
    }

    safeOutcomeSymbol (outcomeIdOrSymbol: Str, outcomeObj: any = undefined): Str {
        outcomeObj = this.safeOutcome (outcomeIdOrSymbol, outcomeObj);
        return outcomeObj['symbol'];
    }

    shortenSlug (slug: string): string {
        const replacements = {
            'federal-reserve': 'fed',
            'interest-rates': 'rates',
            'interest-rate': 'rate',
            'basis-points': 'bps',
            'basis-point': 'bp',
            'executive-order': 'eo',
            'united-states': 'us',
            'united-kingdom': 'uk',
            'european-union': 'eu',
            'artificial-intelligence': 'ai',
            'republican-party': 'gop',
            'democratic-party': 'dems',
            'stock-market': 'market',
            'price-target': 'pt',
            'market-cap': 'mcap',
            'increase': 'hike',
            'decrease': 'cut',
            'higher': 'up',
            'lower': 'down',
            'greater': 'gt',
            'less': 'lt',
            'million': 'M',
            'billion': 'B',
            'trillion': 'T',
            'percent': 'pct',
        };
        const stopWords = [
            'will', 'the', 'a', 'an', 'after', 'before', 'in', 'at', 'by',
            'of', 'there', 'be', 'to', 'or', 'and', 'for', 'on', 'its',
            'that', 'this', 'from', 'with', 'as', 'is', 'are', 'was', 'were', '?', 'how', 'many', 'who', 'what', 'when', 'where', 'which', 'much',
        ];
        let s = (slug || '').toLowerCase ().trim ().replace (' ', '-').replace (/[^a-z0-9]+/g, '-')
            .replace (/^-+|-+$/g, '');
        for (let i = 0, replacementKeys = Object.keys (replacements); i < replacementKeys.length; i++) {
            s = s.split (replacementKeys[i]).join (replacements[replacementKeys[i]]);
        }
        const rawParts = s.split ('-');
        const parts: string[] = [];
        for (let i = 0; i < rawParts.length; i++) {
            const w = rawParts[i];
            if (w.length > 0 && stopWords.indexOf (w) === -1) {
                parts.push (w);
            }
        }
        return parts.join ('_').toUpperCase ();
    }

    slugToMarketSymbol (eventSlug: string, marketSlug: string): string {
        return this.shortenSlug (marketSlug);
    }

    slugToOutcomeSymbol (eventSlug: string, marketSlug: string, outcome: string): string {
        return this.shortenSlug (marketSlug) + ':' + outcome.toUpperCase ();
    }

    slugToMarketId (eventSlug: string, marketSlug: string, outcome: string): string {
        return this.slugToOutcomeSymbol (eventSlug, marketSlug, outcome);
    }
}

export { PredictionExchange as Exchange };
