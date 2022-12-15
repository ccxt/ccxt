"use strict"

const { readFileSync } = require ('fs')
    , { overwriteFile } = require ('./fs')

const manual = './wiki/Manual.md'
let file = readFileSync (manual).toString ()
const topLevelLinks = []

function deleteLinks () {
    const deleteLinksRegex = /- \[.+/mg
    file = file.replace (deleteLinksRegex, '').replace (/\n{3,}/g, '\n')
}

function replaceTopLevelLinks () {
    const links = /^# (?!Python)([A-Z][^`\n]+[A-Za-z])$/mg
    let match
    while (match = links.exec (file)) {
        topLevelLinks.push (match[1])
    }
    topLevelLinks.shift () // ignore Overview
    const insertBefore = '# Exchanges'
    const [ before, after ] = file.split (insertBefore)
    const newLinks = toLinks (topLevelLinks, true)
    file = before + '\n' + newLinks + '\n\n' + insertBefore + after
}

function replaceSubLinks () {
    const subLevelLinksRegex = /^## (.+)/mg
    for (let i = 0; i < topLevelLinks.length - 1; i++) {
        const start = '# ' + topLevelLinks[i]
        const blockRegex = new RegExp ('# ' + topLevelLinks[i] + '([\\s\\S]+?)# ' + topLevelLinks[i+1])
        const block = file.match (blockRegex)[1]
        const links = []
        let link
        while (link = subLevelLinksRegex.exec (block)) {
            links.push (link[1])
        }
        if (links.length) {
            const formatted = toLinks (links)
            const [ before, after ] = file.split (new RegExp ('^' + start + '$', 'm'))
            file = before + start + '\n\n' + formatted + '\n' + after
        }
    }
}

function toLinks (headers, bold= false) {
    const removeChars = /[/]/g
    bold = bold ? '**' : ''
    return headers.map ((link) => {
        return '- [' + bold + link + bold + '](#' + link.replace (removeChars, '')
            .replace (/ /g, '-').toLowerCase () + ')'
    }).join ('\n')
}

deleteLinks ()
replaceTopLevelLinks ()
replaceSubLinks ()
overwriteFile (manual, file)
