const isNode = (typeof window === 'undefined')

// using module.require to prevent Webpack / React Native from trying to include it
const nodeFetch = isNode && module.require ('node-fetch')

// native Fetch API (in newer browsers)
const windowFetch = (typeof window !== 'undefined' && window.fetch)

// a quick ad-hoc polyfill (for older browsers)
const xhrFetch = (url, options, verbose = false) =>
    new Promise ((resolve, reject) => {

        if (verbose)
            console.log (url, options)

        const xhr = new XMLHttpRequest ()
        const method = options.method || 'GET'

        xhr.open (method, url, true)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                    resolve (xhr.responseText)
                else { // [403, 404, ...].indexOf (xhr.status) >= 0
                    throw new Error (method, url, xhr.status, xhr.responseText)
                }
            }
        }

        if (typeof options.headers != 'undefined')
            for (let header in options.headers)
                xhr.setRequestHeader (header, options.headers[header])

        xhr.send (options.body)
    })

module.exports = nodeFetch || windowFetch || xhrFetch
