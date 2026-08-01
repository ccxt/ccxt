// uses the global fetch built into node 18+ (the node-fetch static dependency was removed in #29084)

function style(s, style) {
    return style + s + '\x1b[0m'
}

const colors = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    white: 37,
    gray: 90,
}

let colorFunctions = {}
for (let color of Object.keys (colors)) {
    colorFunctions[color] = (s) => console.log (style (s, '\x1b[' + colors[color].toString () + 'm'))
}

let ascii = [
    '                                                              ',
    '                                                              ',
    '                     ████████████████████████████████████     ',
    '                     ████████████████████████████████████     ',
    '                     ████            ████            ████     ',
    '                     ████            ████            ████     ',
    '                     ████    ████████████    ████████████     ',
    '                     ████    ████████████    ████████████     ',
    '                     ████            ████            ████     ',
    '                     ████            ████            ████     ',
    '                     ████████████████████████████████████     ',
    '                     ████████████████████████████████████     ',
    '                     ████    ████    ████            ████     ',
    '                     ████    ████    ████            ████     ',
    '                     ████████    ████████████    ████████     ',
    '                     ████████    ████████████    ████████     ',
    '                     ████    ████    ████████    ████████     ',
    '                     ████    ████    ████████    ████████     ',
    '                     ████████████████████████████████████     ',
    '                     ████████████████████████████████████     ',
    '                                                              ',
    '                                                              ',
]

async function getData () {
    const oneWeekAgo = new Date (Date.now () - 7 * 24 * 60 * 60 * 1000).toISOString ()
    const [githubData_result, releaseData_result, contributors_result, commits_result] = await Promise.all ([
        fetch ('https://api.github.com/repos/ccxt/ccxt'),
        fetch ('https://api.github.com/repos/ccxt/ccxt/releases/latest'),
        fetch ('https://api.github.com/repos/ccxt/ccxt/contributors?per_page=1&anon=1'),
        fetch ('https://api.github.com/repos/ccxt/ccxt/commits?since=' + oneWeekAgo + '&per_page=1'),
    ])
    const githubData = await githubData_result.json()
    const releaseData = await releaseData_result.json()
    const contributors = parseTotalCountFromLinkHeader (contributors_result.headers.get ('link'))
    const commitsThisWeek = parseTotalCountFromLinkHeader (commits_result.headers.get ('link'))

    return {
        stars: githubData['stargazers_count'].toLocaleString (),
        forks: githubData['forks_count'].toLocaleString (),
        latestRelease: releaseData['tag_name'],
        latestReleaseDate: releaseData['published_at'],
        contributors: contributors,
        commitsThisWeek: commitsThisWeek,
    }
}

function parseTotalCountFromLinkHeader (linkHeader) {
    if (!linkHeader) {
        return 1
    }
    const match = linkHeader.match (/page=(\d+)>;\s*rel="last"/)
    return match ? parseInt (match[1], 10) : 1
}

function pad (string) {
    const padding = 80 - string.length
    const half = Math.floor (padding / 2)
    return ' '.repeat (half + (padding % 2)) + string + ' '.repeat (half)
}

function formatDate (dateString) {
    const date = new Date (dateString)
    const now = new Date ()
    const diffMs = now - date
    const diffDays = Math.floor (diffMs / (24 * 60 * 60 * 1000))
    if (diffDays === 0) {
        return 'today'
    } else if (diffDays === 1) {
        return 'yesterday'
    } else if (diffDays < 7) {
        return diffDays + ' days ago'
    } else if (diffDays < 30) {
        return Math.floor (diffDays / 7) + ' week' + (diffDays < 14 ? '' : 's') + ' ago'
    } else {
        return date.toLocaleDateString ()
    }
}

async function main () {

    try {

        const data = await getData()

        colorFunctions['blue'] (ascii.join ('\n'))
        colorFunctions['red'] (pad (`Stars: ${data.stars}`))
        colorFunctions['red'] (pad (`Forks: ${data.forks}`))
        colorFunctions['red'] (pad (`Contributors: ${data.contributors}`))
        colorFunctions['red'] (pad (`Commits this week: ${data.commitsThisWeek}`))
        colorFunctions['red'] (pad (`Latest: ${data.latestRelease} (${formatDate (data.latestReleaseDate)})`))
        colorFunctions['yellow'] ('\n' + pad ('Thanks for installing ccxt 🙏'))
        colorFunctions['gray'] (pad ('AI coding? Run: npx skills add ccxt/ccxt'))

    } catch (e) {

        // console.log (e.constructor.name, e.message)
    }
}

main()
