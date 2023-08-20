import fetch from './js/src/static_dependencies/node-fetch/index.js'

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
    const [collectiveData_result, githubData_result] = await Promise.all ([fetch ('https://opencollective.com/ccxt.json'), fetch ('https://api.github.com/repos/ccxt/ccxt')])
    const collectiveData = await collectiveData_result.json()
    const githubData = await githubData_result.json()

    return {
        contributors: collectiveData['contributorsCount'].toLocaleString (),
        backers: collectiveData['backersCount'].toLocaleString (),
        balance: Math.floor (collectiveData['balance'] / 100).toLocaleString (),
        budget: Math.floor (collectiveData['yearlyIncome'] / 100).toLocaleString (),
        stars: githubData['stargazers_count'].toLocaleString (),
        forks: githubData['forks_count'].toLocaleString (),
        size: (githubData['size'] / 1000000).toFixed (2)
    }
}

function pad (string) {
    const padding = 80 - string.length
    const half = Math.floor (padding / 2)
    return ' '.repeat (half + (padding % 2)) + string + ' '.repeat (half)
}

async function main () {

    try {

        const data = await getData()

        colorFunctions['blue'] (ascii.join ('\n'))
        colorFunctions['red'] (pad (`Stars: ${data.stars}`))
        colorFunctions['red'] (pad (`Forks: ${data.forks}`))
        colorFunctions['red'] (pad (`Size: ${data.size}MB`))
        colorFunctions['yellow'] ('\n' + pad ('Thanks for installing ccxt 🙏'))
        colorFunctions['gray'] (pad ('Please consider donating to our open collective'))
        colorFunctions['gray'] (pad ('to help us maintain this package.'))
        colorFunctions['yellow'] (pad ('👉 Donate: https://opencollective.com/ccxt/donate 🎉'))

    } catch (e) {

        // console.log (e.constructor.name, e.message)
    }
}

main()
