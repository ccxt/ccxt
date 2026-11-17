// GitHub commit history of a docs repository (or one file/directory in it):
//   GET https://api.github.com/repos/{repo}/commits?sha={ref}&path={path}&per_page=30
// sent with `Authorization: Bearer $GITHUB_TOKEN` when that env var is set (GitHub Actions), see
// collect.ts. Each commit is one entry: title = first line of the message, body = the rest
// (trailers like Signed-off-by dropped), date = committer date, link = the commit page,
// guid = sha. Noise commits (typo fixes, merges, README/formatting) are dropped unless the
// source sets its own `titleFilter`.
import type { SourceConfig } from '../types.ts';
import type { Adapter, ParsedEntry } from './types.ts';

export const GH_API_HOST = 'api.github.com';
export const PER_PAGE = 30;

export const NOISE = /\b(?:typos?|readme|format(?:ting|ted)?|reformat\w*)\b|^merge (?:pull request|branch|remote-tracking branch)\b/i;

const TRAILER = /^(?:signed-off-by|co-authored-by|change-id|reviewed-by|acked-by|cc):/i;

export const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

function cleanPath (path: string | undefined): string {
    return (path ?? '').replace (/^\/+|\/+$/g, '');
}

// The API url a gh-commits source fetches (registry files leave `url` out; see registry.ts).
export function commitsApiUrl (source: Pick<SourceConfig, 'repo' | 'ref' | 'path'>): string {
    const q = new URLSearchParams ();
    if (source.ref) {
        q.set ('sha', source.ref);
    }
    const path = cleanPath (source.path);
    if (path) {
        q.set ('path', path);
    }
    q.set ('per_page', String (PER_PAGE));
    return `https://${GH_API_HOST}/repos/${source.repo}/commits?${q.toString ()}`;
}

// Human-facing history page: https://github.com/{repo}/commits/{ref}/{path}
export function commitsPageUrl (source: Pick<SourceConfig, 'repo' | 'ref' | 'path'>): string {
    const path = cleanPath (source.path);
    const ref = source.ref ?? (path ? 'HEAD' : '');
    return `https://github.com/${source.repo}/commits` + (ref ? `/${encodeURIComponent (ref)}` : '') + (path ? `/${path.split ('/').map (encodeURIComponent).join ('/')}` : '');
}

// Extra request headers; the token only ever goes to api.github.com.
export function githubHeaders (url: string, env: NodeJS.ProcessEnv = process.env): Record<string, string> {
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    const token = env['GITHUB_TOKEN']?.trim ();
    if (token && new URL (url).hostname === GH_API_HOST) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray (v);

export const ghCommits: Adapter = ({ source, body }) => {
    let data: unknown;
    try {
        data = JSON.parse (body);
    } catch {
        throw new Error ('GitHub API: response is not JSON');
    }
    if (!Array.isArray (data)) {
        const message = isObj (data) && typeof data['message'] === 'string' ? data['message'].slice (0, 120) : 'not an array';
        throw new Error (`GitHub API: ${message}`);
    }
    const entries: ParsedEntry[] = [];
    for (const c of data) {
        if (!isObj (c) || typeof c['sha'] !== 'string' || !/^[0-9a-f]{7,64}$/i.test (c['sha'])) {
            continue;
        }
        const commit = isObj (c['commit']) ? c['commit'] : {};
        const message = typeof commit['message'] === 'string' ? commit['message'].replace (/\r\n?/g, '\n') : '';
        const [ first, ...rest ] = message.split ('\n');
        const title = (first ?? '').trim ();
        if (!title || (!source.titleFilter && NOISE.test (title))) {
            continue;
        }
        const who = isObj (commit['committer']) ? commit['committer'] : (isObj (commit['author']) ? commit['author'] : {});
        const date = typeof who['date'] === 'string' ? who['date'] : undefined;
        entries.push ({
            title,
            body: rest.filter ((l) => !TRAILER.test (l.trim ())).join ('\n').trim (),
            dateText: date,
            link: `https://github.com/${source.repo}/commit/${c['sha']}`,
            guid: c['sha'].toLowerCase (),
        });
    }
    const snapshot = entries.map ((e) => `${e.dateText ?? ''} ${e.guid} ${e.title}`).join ('\n');
    return { entries, snapshot };
};
