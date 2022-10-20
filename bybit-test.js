const ccxt = require ('./ccxt')
const { HttpsProxyAgent } = require("https-proxy-agent");
const agent = new HttpsProxyAgent("http://85.17.25.80:3128");
const fetch = require("./js/static_dependencies/node-fetch");

const bybit = new ccxt.pro.bybit({
  apiKey: "KerSYt11cLBR1ZWWj1",
  secret: "nPS5kWXp39rI19LoyX7FWj7feYHVoyv4Pgms",
  agent: agent,
  verbose: true,
  fetchImplementation: fetch,
});

async function main() {
    while (true) {
        let orders = await bybit.watchOrders ('ETH/USD:ETH');
        console.log (orders)
        orders = await bybit.watchOrders('ETH/USD:ETH', undefined, undefined, params={"stop":true})
        console.log (orders)

    }
}

main()
