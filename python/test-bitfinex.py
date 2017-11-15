import ccxt
import time

bitfinex = ccxt.bitfinex({
    "apiKey": "VM9UCkrumj7VRMeRwRdTDxNudfaVLcknvbSVCsbSNTH",
    "secret": "ZqEtFicQAem6p1hmfayhJynulPG2ic7vhNRG9tJwuk0",
    "verbose": True,
})

print(bitfinex.fetch_balance())
time.sleep(5)
print(bitfinex.symbols)
print(bitfinex.create_order('BTC/USD', 'limit', 'buy', '0.01', '5500'))
