
import { execSync } from 'child_process';
import log  from 'ololog';
import ccxt from '../js/ccxt.js';
import { isMainEntry } from './transpile.js';
const { values }   = Object
import assert from 'assert';
import * as url from 'node:url';

const { groupBy } = ccxt;
log.noLocate();
function cleanupOldTags () {

    const tags = execSync ('git tag').toString ().split ('\n').filter (s => s).map (t => {

        const [major, minor, patch] = t.replace ('v', '').split ('.').map (Number)

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

    cleanupOldTags ()

} else {

    // do nothing if required as a module
}

// ============================================================================

export default {
    cleanupOldTags,
};