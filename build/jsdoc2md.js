'use strict'
import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'
import path from 'path'

// jsdoc parses the doc comments into doclets; the markdown is rendered by the plain functions below

const listJs = (dir) => fs.readdirSync (dir).filter (f => path.extname (f) === '.js').map (f => path.join (dir, f))
const outputFolder = './wiki/'

const escapeHtml = (s) => s.replace (/</g, '&lt;').replace (/>/g, '&gt;')

// [text]{@link url} and {@link url} → markdown links
const inlineLinks = (s = '') => s
    .replace (/\[([^\]]*)\]\{@link\s+([^}\s]+)\s*\}/g, '[$1]($2)')
    .replace (/\{@link\s+([^}\s|]+)(?:\s*\|\s*|\s+)([^}]+)\}/g, '[$2]($1)')
    .replace (/\{@link\s+([^}\s|]+)\s*\}/g, '[$1]($1)')

// a type naming the class documented on the same page links to it
const typeList = (type, delimiter, cls) => ((type && type.names) || [])
    .map (n => n.replace (/Array\./g, 'Array'))
    .map (n => n === cls ? `[<code>${n}</code>](#${n})` : `<code>${escapeHtml (n)}</code>`)
    .join (delimiter)

const methodSig = (doclet) => (doclet.params || [])
    .filter (p => p.name && !p.name.includes ('.'))
    .map (p => p.optional ? p.name + '?' : p.name)
    .join (', ')

const anchor = (doclet) => `\n<a name="${doclet.name}" id="${doclet.name.toLowerCase ()}"></a>\n\n`

function renderBody (doclet, kind, cls) {
    let out = ''
    if (doclet.deprecated) {
        out += '`DEPRECATED`\n\n'
    }
    if (doclet.description) {
        out += inlineLinks (doclet.description) + '\n\n'
    }
    if (kind) {
        out += `**Kind**: ${kind}  \n`
    }
    if (doclet.augments) {
        out += `**Extends**: ${doclet.augments.map (a => `<code>${a}</code>`).join (', ')}  \n`
    }
    const returns = doclet.returns || []
    if (returns.length && returns[0].description) {
        out += '**Returns**: ' + returns.map (r => r.type
            ? typeList (r.type, ' \\| ', cls) + (r.description ? ' - ' + inlineLinks (r.description) : '')
            : inlineLinks (r.description)).join ('') + '\n\n'
    }
    const see = doclet.see || []
    if (see.length === 1) {
        out += `**See**: ${inlineLinks (see[0])}  \n`
    } else if (see.length > 1) {
        out += '**See**\n\n' + see.map (s => `- ${inlineLinks (s)}\n`).join ('') + '\n'
    }
    if (doclet.params && doclet.params.length) {
        // like jsdoc2md, a column is only shown when at least one param fills it
        const columns = [
            [ 'Param', p => p.name, true ],
            [ 'Type', p => typeList (p.type, ', ', cls), doclet.params.some (p => p.type) ],
            [ 'Required', p => p.optional ? 'No' : 'Yes', doclet.params.some (p => p.optional) ],
            [ 'Description', p => inlineLinks (p.description || '').replace (/[\r\n]+/g, ' '), doclet.params.some (p => p.description) ],
        ].filter (c => c[2])
        out += '\n| ' + columns.map (c => c[0]).join (' | ') + ' |\n|' + columns.map (() => ' --- |').join ('') + '\n'
        for (const p of doclet.params) {
            out += '| ' + columns.map (c => c[1] (p)).join (' | ') + ' |\n'
        }
        out += '\n'
    }
    return out
}

// the documented members of a class (constructor, methods and properties), in source order
const ownMembers = (doclets, cls) => doclets.filter (d => d.memberof === cls.longname && !d.ignore)
const isMethod = (d) => d.kind === 'function' && d.scope === 'instance'

// one page per class: header, method index, then every member
function renderClassPage (doclets) {
    const cls = doclets.find (d => d.kind === 'class')
    const own = ownMembers (doclets, cls)
    const methods = own.filter (isMethod)
    const members = own.filter (d => d.kind === 'constructor' || (d.scope === 'instance' && (d.kind === 'function' || d.kind === 'member')))
    let out = anchor (cls) + `## ${cls.name}{docsify-ignore}\n`
    out += renderBody ({ augments: cls.augments }, 'global class', cls.name)
    out += '\n' + methods.map (d => `* [${d.name}](#${d.name.toLowerCase ()})\n`).join ('')
    for (const m of members) {
        const kind = (m.kind === 'constructor') ? undefined : `instance ${m.kind === 'member' ? 'property' : 'method'} of [<code>${cls.name}</code>](#${cls.name})`
        out += anchor (m) + `### ${m.name}{docsify-ignore}\n`
        out += renderBody (m, kind, cls.name)
        out += `\n\`\`\`javascript\n${cls.name}.${m.name} (${methodSig (m)})\n\`\`\`\n\n`
    }
    return out
}

// base spec: one section per unified method, ending with an inline list of the exchanges implementing it
function renderBaseMethod ([spec, ...exchanges]) {
    const links = exchanges.map (id => `[${id}](/exchanges/${id}.md#${spec.name.toLowerCase ()})`)
    return anchor (spec) + `## ${spec.name}\n` + renderBody (spec, 'instance ') + `**Supported exchanges:**\n${links.join ('\n')}\n`
}

const loadDocs = async (files) => (await Promise.all (files.map (async (file) => {
    const data = await jsdoc2md.getTemplateData ({ files: file })
    data.exchangeId = path.basename (file, '.js')
    return data
// alias exchanges (binanceus, bequant, …) document no methods of their own: skip them
}))).filter (x => x.length > 0)

console.log ('📰 loading js docs...')
const exchanges = await loadDocs (listJs ('js/src'))
// each exchange must open with its class doclet (/** @class <id> @augments <Parent> */), else jsdoc
// promotes the first method in its place and the exchange page renders empty
for (const data of exchanges) {
    if (!data[0] || data[0].name !== data.exchangeId) {
        throw new Error (`🚨 ${data.exchangeId}.js exposes no class-level doclet (first doclet is '${data[0] && data[0].name}', kind '${data[0] && data[0].kind}'). Add a "/** @class ${data.exchangeId} @augments <Parent> */" comment above the class declaration in ts/src/${data.exchangeId}.ts.`)
    }
}
// merge pro methods into their REST class; a pro class may redeclare a REST method, keep the first
for (const proData of await loadDocs (listJs ('js/src/pro'))) {
    const rest = exchanges.find (data => data[0].id === proData[0].memberof)
    if (rest) {
        const ids = new Set (rest.map (d => d.id))
        rest.push (...proData.filter (d => !ids.has (d.id) && ids.add (d.id)))
    }
}
const predictionExchanges = await loadDocs (listJs ('js/src/prediction'))

console.log ('📰 writing exchange docs')
// wipe stale pages so renamed/removed exchanges don't linger in wiki/exchanges/
const exchangesDir = outputFolder + 'exchanges/'
fs.mkdirSync (exchangesDir + 'prediction/', { recursive: true })
for (const f of fs.readdirSync (exchangesDir).filter (f => f.endsWith ('.md'))) {
    fs.unlinkSync (exchangesDir + f)
}
const writePages = (list, folder) => list.map ((data) => {
    fs.writeFileSync (`${outputFolder}${folder}${data.exchangeId}.md`, renderClassPage (data))
    return `\t- [${data.exchangeId}](${folder}${data.exchangeId}.md)`
})
const exchangeLinks = writePages (exchanges, 'exchanges/')
const predictionLinks = writePages (predictionExchanges, 'exchanges/prediction/')

console.log ('📰 writing base spec')
const byMethod = new Map ()
for (const data of exchanges) {
    for (const d of ownMembers (data, data[0]).filter (isMethod)) {
        if (!byMethod.has (d.name)) {
            byMethod.set (d.name, [{ name: d.name, description: d.description, params: d.params, returns: d.returns }])
        }
        byMethod.get (d.name).push (data.exchangeId)
    }
}
const methods = [...byMethod.values ()].sort ((a, b) => a[0].name < b[0].name ? -1 : 1)
fs.writeFileSync (outputFolder + 'baseSpec.md', methods.map (renderBaseMethod).join ('\n---\n'))

// OrderRouter is not an exchange, so it gets its own page and stays out of the by-method index
console.log ('📰 writing OrderRouter docs')
const routerData = await jsdoc2md.getTemplateData ({ files: 'js/src/base/OrderRouter.js' })
if (!routerData.some (d => d.kind === 'class')) {
    throw new Error ('🚨 js/src/base/OrderRouter.js produced no class doclet. It needs a "/** @class OrderRouter */" comment above the class declaration in ts/src/base/OrderRouter.ts.')
}
fs.writeFileSync (outputFolder + 'OrderRouter.md', renderClassPage (routerData))

const sidebar =
`
- [Install](Install.md)
- [Examples](Examples.md)
- [Manual](Manual.md)
- [CCXT Pro](ccxt.pro.manual.md)
- [Contributing](CONTRIBUTING.md)
- [Supported Exchanges](Exchange-Markets.md)
- [Exchanges By Country](Exchange-Markets-By-Country.md)
- [API Spec By Method](baseSpec.md)
- [Order Router](OrderRouter.md)
- [FAQ](FAQ.md)
- [Changelog](CHANGELOG.md)
- [Awesome](Awesome.md)
- API Spec by Exchange
${exchangeLinks.join ('\n')}
- API Spec by Prediction Exchange
${predictionLinks.join ('\n')}
`
fs.writeFileSync ('./wiki/_sidebar.md', sidebar)

console.log ('📰 finished rendering docs! 🙌 😶‍🌫')
