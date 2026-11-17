// BTC Markets help center (Zendesk), "API" section:
// https://support.btcmarkets.net/api/v2/help_center/en-us/sections/360000329408/articles.json
// { articles: [{ id, title, body (HTML), created_at, updated_at, edited_at, html_url, draft }] }
// The real API docs (docs.btcmarkets.net) have no changelog; this section is where BTC Markets posts
// API announcements (v3 upgrade, WebSocket v2). Each article is one entry keyed by its Zendesk id and
// dated by created_at, so an edited article is a revision of the same entry, not a new one
// (updated_at also moves on label/permission changes).
import { htmlToText } from '../htmltext.ts';
import type { RawEntry } from '../types.ts';

interface ZendeskArticle {
    id?: number | string;
    title?: string;
    body?: string | null;
    created_at?: string;
    html_url?: string;
    draft?: boolean;
}

export default function btcmarkets (data: unknown): RawEntry[] {
    if (data === undefined) {
        throw new Error ('btcmarkets: response is not valid JSON');
    }
    const articles = (data as { articles?: ZendeskArticle[] })?.articles;
    if (!Array.isArray (articles)) {
        throw new Error ('btcmarkets: "articles" is not an array');
    }
    const out: RawEntry[] = [];
    for (const a of articles) {
        const title = (a.title ?? '').trim ();
        if (a.draft || !title || a.id === undefined) {
            continue;
        }
        out.push ({
            title,
            body: a.body ? htmlToText (a.body) : '',
            dateText: a.created_at,
            link: a.html_url,
            guid: String (a.id),
        });
    }
    return out;
}
