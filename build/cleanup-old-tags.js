"use strict"

const { execSync } = require ('child_process')
const log          = require ('ololog').noLocate
const { groupBy }  = require ('ccxt')
const { values }   = Object
const assert       = require ('assert')

const tags = execSync ('git tag').toString ().split ('\n').filter (s => s).map (t => {

    const [major, minor, patch] = t.split ('.').map (Number)

    assert (major < 100)
    assert (minor < 100)

    return {
        key: (major * 100) + minor,
        tag: t,
        major, minor, patch
    }
})

const tagsByMajor = values (groupBy (tags, 'key')).sort ((a, b) => a[0].key - b[0].key)

// Preserve all tags for first 3 minor versions

for (let i = 0; i < 3; i++) {

    const tags = tagsByMajor.pop ()

    log.green.bright ('Preserving', tags[0].tag, '...', tags[tags.length - 1].tag)
}

// For older versions, leave only "round" numbered versions (1/10th) 

let tagsToDelete = []

for (const tags of tagsByMajor) {

    for (const { tag, patch } of tags) {

        if (String (patch).replace (/([^0]+)0+/, '$1').length == 1) {
            log.green ('Preserving', tag)

        } else {
            tagsToDelete.push (tag)
        }
    }
}

log.bright.red ('Deleting', tagsToDelete.length, 'tags...')

// TODO