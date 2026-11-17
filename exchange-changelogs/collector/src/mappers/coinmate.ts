// Coinmate API description on Apiary: https://jsapi.apiary.io/apis/coinmate/blueprint
// JSON { name, lastUpdated, description, resourceGroups, ..., user, urls }. The `blueprint` field is
// empty; the rendered API description is in `description` (HTML), which ends with a hand-written
//   <h1>Changelog</h1><ul><li><p>YYYY-MM-DD</p><ul><li>change ...</li></ul></li> ...</ul>
// list, newest first. Each top-level <li> is one entry: title = its date paragraph, body = the
// nested list. (`user` and `urls` change on every request; they are never read.)
import * as cheerio from 'cheerio';
import { nodesToText, type DomNode } from '../htmltext.ts';
import type { RawEntry } from '../types.ts';

export default function coinmate (data: unknown): RawEntry[] {
    const description = (data as { description?: unknown } | undefined)?.description;
    if (typeof description !== 'string') {
        throw new Error ('coinmate: response has no "description" string');
    }
    const $ = cheerio.load (description, null, false);
    const heading = $('h1').filter ((_i, el) => $(el).text ().trim ().toLowerCase () === 'changelog').first ();
    if (heading.length === 0) {
        throw new Error ('coinmate: "Changelog" heading not found in the API description');
    }
    const list = heading.nextAll ('ul').first ();
    if (list.length === 0) {
        throw new Error ('coinmate: no list after the "Changelog" heading');
    }
    const out: RawEntry[] = [];
    list.children ('li').each ((_i, li) => {
        const item = $(li);
        const first = item.children ('p').first ();
        const title = (first.length ? first.text () : item.contents ().first ().text ()).replace (/\s+/g, ' ').trim ();
        if (!title) {
            return;
        }
        const rest = item.contents ().toArray ().filter ((n) => n !== first.get (0));
        const body = nodesToText (rest as unknown as DomNode[]);
        out.push ({ title, body, dateText: title });
    });
    return out;
}
