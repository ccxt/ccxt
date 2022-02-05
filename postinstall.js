const fetch = require ('./js/static_dependencies/fetch-ponyfill/fetch-node') ().fetch

function style(s, style) {
    return style + s + '\033[0m'
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
    colorFunctions[color] = (s) => console.log (style (s, '\033[' + colors[color].toString () + 'm'))
}

let ascii = [
    '                                                         ',
    '                         :Siiiiiiiiiiir    rSiiiiiiiiiiS:',
    '                         r&9hh&&&&&&&A5    SG99h&&&&&&GHr',
    '                         ;hX32;::::::;,    i9X9S:;:::::;,',
    '                         ;hX9S             ihXhr         ',
    '                         ;hX32::::::,:,    i9X9i::::::,:.',
    '                         rG999GGGGGGGAS    iG99hGGGGGGGAr',
    '                         ;2S55SSSSSSS2r    r2555SSSSSSS2;',
    '                         ;2S5s    ;2S2r    r2SS555555SS2;',
    '                         rAh&2    sAhAS    SAGGh9999GGGAr',
    '                         .:,::rrrs::::,    ,:,,;9X3X:,,:.',
    '                              &A&H,            ,hX33     ',
    '                         ,;:;;;;;r;;:;,        ,hX3X.    ',
    '                         rHGAX    sAGA5        :&9h9.    ',
    '                         :Ssir    ;isir        ,Siii     ',
    '                                                         ',
]

let footer = [
    '                                                                 ',
    '              ---------------------------------------------------',
    '                                                                 ',
    '                     You can contribute in crypto directly:      ',
    '                                                                 ',
    '                 ETH 0x26a3CB49578F07000575405a57888681249c35Fd  ',
    '                 BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva          ',
    '                 BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze          ',
    '                 LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP          ',
    '                                                                 ',
    '              ---------------------------------------------------',
    '                                                                 ',
    '                                   Thank you!                    ',
    '                                                                 ',
]

async function getData () {
    const collectiveData = await (await fetch ('https://opencollective.com/ccxt.json')).json ()
    const githubData = await (await fetch ('https://api.github.com/repos/ccxt/ccxt')).json ()

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
        colorFunctions['red'] (pad (`Contributors: ${data.contributors}`))
        colorFunctions['red'] (pad (`Size: ${data.size}MB`))
        colorFunctions['yellow'] ('\n' + pad ('Thanks for installing ccxt 🙏'))
        colorFunctions['gray'] (pad ('Please consider donating to our open collective'))
        colorFunctions['gray'] (pad ('to help us maintain this package.'))
        colorFunctions['yellow'] (pad ('👉 Donate: https://opencollective.com/ccxt/donate 🎉'))
        colorFunctions['white'] (pad (`Thanks to our ${data.backers} backers we are operating on an annual budget of $${data.budget}`))
        colorFunctions['yellow'] (footer.join ('\n'))

    } catch (e) {

        // console.log (e.constructor.name, e.message)
    }
}

main()
