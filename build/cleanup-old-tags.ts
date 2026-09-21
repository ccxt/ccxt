
import { execSync } from 'child_process';
import log  from 'ololog';
import ccxt from '../ts/ccxt.js';
import { isMainEntry } from './transpile.js';
const { values }   = Object
import assert from 'assert';

const { groupBy } = ccxt;
log.noLocate();

// Deleting a tag that a GitHub release points at does not delete the release: GitHub demotes
// it to an untagged draft. Drafts sort ahead of published releases in the releases API, which
// is what changelog-from-release reads, so an orphaned release both disappears from the public
// releases page and corrupts CHANGELOG.md. The 2023 4.0.3 release is already in that state.
// Fetch the tags that back a release so we never prune one.
export async function fetchReleasedTags (): Promise<Set<string>> {
    const repository = process.env.GITHUB_REPOSITORY || 'ccxt/ccxt';
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const releasedTags = new Set<string> ();
    for (let page = 1; page <= 50; page++) {
        const url = `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`;
        const response = await fetch (url, { headers });
        if (!response.ok) {
            throw new Error (`GitHub releases API returned HTTP ${response.status} for ${url}`);
        }
        const releases = await response.json () as { tag_name?: string }[];
        if (releases.length === 0) {
            return releasedTags;
        }
        for (const release of releases) {
            if (release.tag_name) {
                releasedTags.add (release.tag_name);
            }
        }
    }
    return releasedTags;
}

async function cleanupOldTags () {

    const tags = execSync ('git tag').toString ().split ('\n').filter (s => s).filter (t => {
        // version tags only - plain releases (4.5.70) and go module tags (go/v4.5.70);
        // anything else is not ours to prune and must not crash the release pipeline
        const isVersionTag = /^(go\/)?v?\d+\.\d+\.\d+$/.test (t)
        if (!isVersionTag) {
            log.yellow ('Skipping non-version tag', t)
        }
        return isVersionTag
    }).map (t => {

        // go module tags prune on the same schedule as the release they duplicate
        const [major, minor, patch] = t.replace (/^go\//, '').replace ('v', '').split ('.').map (Number)

        assert (major < 100)
        assert (minor < 100)

        return {
            key: (major * 100) + minor,
            tag: t,
            major,
            minor,
            patch,
        }
    })

    const tagsByMajorMinor = values (groupBy (tags, 'key')).sort ((a, b) => a[0].key - b[0].key)

    // Preserve all tags for first 5 minor versions

    for (let i = 0; i < 5; i++) {

        const tags = tagsByMajorMinor.pop ()

        if (tags) {
            log.green.bright ('Preserving', tags[0].tag, '...', tags[tags.length - 1].tag)
        }
    }

    // For older versions, leave only "round" numbered versions (1/10th)

    let tagsToDelete = []

    for (const tags of tagsByMajorMinor) {

        for (const { tag, patch } of tags) {

            if (patch === 1) {
                log.green ('Preserving', tag)

            } else {
                tagsToDelete.push (tag)
            }
        }
    }

    // Never orphan a GitHub release. If the API is unreachable we skip the whole cleanup rather
    // than risk it: pruning tags is housekeeping, corrupting the changelog is not recoverable
    // by a later run, because CHANGELOG.md is regenerated from the releases every time.
    let releasedTags: Set<string>;
    try {
        releasedTags = await fetchReleasedTags ();
        log.dim ('Found', releasedTags.size, 'tags backing a GitHub release')
    } catch (e) {
        log.bright.red ('Could not list GitHub releases, skipping tag cleanup:', (e as Error).message)
        return;
    }
    const protectedTags = tagsToDelete.filter (tag => releasedTags.has (tag))
    if (protectedTags.length) {
        log.green ('Preserving', protectedTags.length, 'tags that back a GitHub release')
        log.unlimited.green (protectedTags)
    }
    tagsToDelete = tagsToDelete.filter (tag => !releasedTags.has (tag))

    log.bright.red ('Deleting', tagsToDelete.length, 'tags...')
    log.unlimited.bright.red (tagsToDelete)
    log.bright.red ('Deleting', tagsToDelete.length, 'tags...')

    if (!process.argv.includes ('--paper')) {

    /*  If it happens on a CI server, we don't want it to fail the build because of a super
        long execution time (one tag deletion takes ~5 sec...), hence that limit here                 */

        if (process.argv.includes ('--limit')) {
            tagsToDelete = tagsToDelete.slice (-500)
        }

        for (const tag of tagsToDelete) {

            log.dim ('Deleting', tag)
            execSync (`git tag -d ${tag} && git push origin :refs/tags/${tag}`)
        }
    }
}

// ============================================================================
// main entry point

if (isMainEntry(import.meta.url)) {

    // if called directly like `node module`

    cleanupOldTags ().catch ((e: Error) => {
        log.bright.red (e.message)
        process.exitCode = 1;
    })

} else {

    // do nothing if required as a module
}

// ============================================================================

export default {
    cleanupOldTags,
};