"use strict";

// ----------------------------------------------------------------------------

const cloudscraper = require ('cloudscraper')
    , ccxt         = require ('../../ccxt.js')

// ----------------------------------------------------------------------------

const scrapeCloudflareHttpHeaderCookie = (url) =>

	(new Promise ((resolve, reject) =>

		(cloudscraper.get (url, function (error, response, body) {

			if (error) {

				reject (error)

			} else {

				resolve (response.request.headers)
			}
		}))
    ))

// ----------------------------------------------------------------------------

;(async () => {

    const exchange = new ccxt.braziliex ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

	exchange.headers = await scrapeCloudflareHttpHeaderCookie (exchange.urls.www)

    // console.log (exchange.headers)

    try {

        const response = await exchange.loadMarkets ()
        console.log (response);
        console.log ('Succeeded.')

    } catch (e) {

        console.log ('--------------------------------------------------------')
        console.log (e.constructor.name, e.message)
        console.log ('--------------------------------------------------------')
        console.log (exchange.last_http_response)
        console.log ('Failed.')
    }

}) ()