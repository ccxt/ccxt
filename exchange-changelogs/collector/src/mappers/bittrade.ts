// BitTrade help-center (Zendesk) article search:
//   https://support.bittrade.co.jp/api/v2/help_center/articles/search.json?query=API&locale=ja&per_page=100
// { results: [{ id, title, body (HTML), html_url, created_at, updated_at, ... }], count, next_page }
// BitTrade publishes no API changelog; API notices (rate limits, spec changes, API launch) are help-center
// announcements. The search matches "API" anywhere in the article, so most results are maintenance and
// campaign notices: the registry source keeps API-related titles with `titleFilter`.
// created_at dates the entry (updated_at is bulk-rewritten when the help center is re-saved).
import { htmlToText } from '../htmltext.ts';
import type { RawEntry } from '../types.ts';

interface ZendeskArticle {
    id?: number;
    title?: string;
    body?: string | null;
    html_url?: string;
    created_at?: string;
    draft?: boolean;
}

export default function bittrade (data: unknown): RawEntry[] {
    if (data === undefined) {
        throw new Error ('bittrade: response is not valid JSON');
    }
    const results = (data as { results?: unknown })?.results;
    if (!Array.isArray (results)) {
        throw new Error ('bittrade: expected a Zendesk search response with a results array');
    }
    const out: RawEntry[] = [];
    for (const a of results as ZendeskArticle[]) {
        const title = (a.title ?? '').trim ();
        if (!title || a.draft) {
            continue;
        }
        out.push ({
            title,
            body: a.body ? htmlToText (a.body) : '',
            dateText: a.created_at,
            link: a.html_url,
            guid: a.id !== undefined ? String (a.id) : undefined,
        });
    }
    // newest first, like every other changelog
    out.sort ((x, y) => (y.dateText ?? '').localeCompare (x.dateText ?? ''));
    return out;
}
