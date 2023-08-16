"use strict";

// ----------------------------------------------------------------------------

import ccxt from "../../../dist/cjs/ccxt.js";
const Bitmart = ccxt["bitmart"];

// ----------------------------------------------------------------------------

// mocking responses from the exchange needed for private methods execution
const mockCall = (url) => ({});

const URL_MUST_CONTAINING_PROXY = [
	"https://fakeProxy.com/https://api-cloud.bitmart.com/spot/v1/wallet",
];

class ProxyError extends Error {
	constructor(message) {
		super(message);
	}
}

class BitMartCustom extends Bitmart {
	async fetch(url, method = "GET", headers = undefined, body = undefined) {
		console.log(url);
		const newUrl = this.implodeParams(
			url,
			this.omit(this.extend({}, this.urls), this.version)
		);
		const urlWithoutParams = newUrl.split("?")[0];
		if (newUrl.includes("https://fakeProxy.com/")) {
			if (!URL_MUST_CONTAINING_PROXY.includes(urlWithoutParams)) {
				throw new ProxyError(
					`URL "${urlWithoutParams}" shouldn't contain https://fakeProxy.com/`
				);
			}
		} else {
			if (
				URL_MUST_CONTAINING_PROXY.some((key) => key.includes(urlWithoutParams))
			) {
				throw new ProxyError(
					`URL "${urlWithoutParams}" should contain https://fakeProxy.com/`
				);
			}
		}

		return mockCall(url);
	}
}

(async () => {
	// Initialize the custom Bitmart exchange class
	const exchange = new BitMartCustom({
		apiKey: "12345678",
		secret: "12345678",
		forcedProxy: "https://fakeProxy.com/",
		uid: "12345678",
	});

	// Privates endpoint that will be called :
	// https://fakeProxy.com/https://api-cloud.bitmart.com/spot/v1/wallet

	// Public endpoints that will be called :
	// https://api-cloud.bitmart.com/spot/v1/currencies
	// https://api-cloud.bitmart.com/spot/v1/symbols/details
	// https://api-cloud.bitmart.com/contract/public/details

	await exchange.fetchBalance();
})();
