// HTX "update_record" API: https://www.htx.com/oplt/api/open_api/update_record?pageNum=1&pageSize=10000
// { code, message, data: { list: [{ interface_id, interface_path, biz_type, update_type, update_summary, update_time }] } }
import type { RawEntry } from '../types.ts';

interface HtxRecord {
    interface_id?: string;
    interface_path?: string;
    biz_type?: string;
    update_type?: string;
    update_summary?: string;
    update_time?: string;
}

// biz_type comes in Chinese for some products even with Accept-Language: en-us
const BIZ_EN: Record<string, string> = { '通用': 'General' };

export default function htx (data: unknown): RawEntry[] {
    if (data === undefined) {
        throw new Error ('htx: response is not valid JSON');
    }
    const list = ((data as { data?: { list?: HtxRecord[] } })?.data?.list) ?? [];
    if (!Array.isArray (list)) {
        throw new Error ('htx: data.list is not an array');
    }
    // The English list repeats some records verbatim (sometimes under a different interface_id),
    // and interface_id differs between the en/zh lists: drop repeats of path + date + type + summary.
    // The guid leaves the summary out, so a summary edit is a revision of the same entry; records that
    // share path + date + type are told apart by their summary in entries.ts (assignKeys).
    const seen = new Set<string> ();
    const out: RawEntry[] = [];
    for (const r of list) {
        const path = (r.interface_path ?? '').trim ();
        const kind = (r.update_type ?? 'Update').trim ();
        const rawBiz = (r.biz_type ?? '').trim ();
        const biz = BIZ_EN[rawBiz] ?? rawBiz;
        const summary = (r.update_summary ?? '').trim ();
        const guid = `${path}|${r.update_time ?? ''}|${kind}`;
        if (seen.has (guid + '|' + summary)) {
            continue;
        }
        seen.add (guid + '|' + summary);
        out.push ({
            title: `${kind}: ${path}` + (biz && /^[\x20-\x7e]+$/.test (biz) ? ` (${biz})` : ''),
            body: summary,
            dateText: r.update_time,
            guid,
        });
    }
    return out;
}
