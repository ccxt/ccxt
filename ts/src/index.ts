import * as ccxt from "./pkg";

const config: ccxt.ExchangeConfig = {
  apiKey: "",
  secret: "",
  timeout: 0,
  enableRateLimit: true,
  test: true
};
const ex = ccxt.bitmex(config);
(async function() {
  try {
    const instruments = await ex.PublicGetInstrumentActive({});
    console.log(instruments[0]);
  } catch (e) {
    console.error(e);
  }
})();
