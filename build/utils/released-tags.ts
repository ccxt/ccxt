// Deleting a tag that a GitHub release points at does not delete the release: GitHub demotes
// it to an untagged draft. Drafts sort ahead of published releases in the releases API, which
// is what changelog-from-release reads, so an orphaned release both disappears from the public
// releases page and corrupts CHANGELOG.md. The 2023 4.0.3 release is already in that state.
// cleanup-old-tags uses this to know which tags it must never prune.
//
// Lives apart from cleanup-old-tags.ts so it can be unit tested: that module pulls in ololog
// and the whole ccxt entry point, and these tests run in js.yml before `npm ci`.

interface ReleaseSummary {
    tag_name?: string;
}

interface HttpResponse {
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
}

export type FetchImplementation = (url: string, options: { headers: Record<string, string> }) => Promise<HttpResponse>;

export interface FetchReleasedTagsOptions {
    env?: Record<string, string | undefined>;
    fetchImpl?: FetchImplementation;
}

const perPage = 100;
// ~260 releases today, so 50 pages is far more headroom than the repo needs.
const maxPages = 50;

export async function fetchReleasedTags (options: FetchReleasedTagsOptions = {}): Promise<Set<string>> {
    const env = options.env ?? process.env;
    const fetchImpl: FetchImplementation = options.fetchImpl ?? (async (url, requestOptions) => fetch(url, requestOptions));
    const repository = env['GITHUB_REPOSITORY'] || 'ccxt/ccxt';
    const token = env['GH_TOKEN'] || env['GITHUB_TOKEN'];
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const releasedTags = new Set<string> ();
    for (let page = 1; page <= maxPages; page++) {
        const url = `https://api.github.com/repos/${repository}/releases?per_page=${perPage}&page=${page}`;
        const response = await fetchImpl(url, { headers });
        if (!response.ok) {
            throw new Error(`GitHub releases API returned HTTP ${response.status} for ${url}`);
        }
        const releases = await response.json() as ReleaseSummary[];
        for (const release of releases) {
            if (release.tag_name) {
                releasedTags.add(release.tag_name);
            }
        }
        if (releases.length < perPage) {
            return releasedTags;
        }
    }
    // Page maxPages came back full, so there are releases we have not seen. Returning the set
    // anyway would let the caller prune the tags backing them - the exact orphaning this guard
    // exists to prevent. Fail closed, like any other API failure here.
    throw new Error(`GitHub releases API returned more than ${maxPages * perPage} releases for ${repository}, refusing to prune tags from an incomplete release list`);
}
