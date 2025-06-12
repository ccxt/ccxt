import Foundation
import CCXT

public class CCXTExchange {
    private let wrapper = Wrapper()
    private var handle: UInt64 = 0

    public init(exchangeName: String, configJson: String) {
        handle = wrapper.initExchange(exchangeName, configJson: configJson)
    }

    public func fetchMarkets() -> String {
        guard handle != 0 else {
            return "{\"error\": \"Invalid handle\"}"
        }
        return wrapper.fetchMarkets(handle)
    }

    public func fetchCurrencies() -> String {
        guard handle != 0 else {
            return "{\"error\": \"Invalid handle\"}"
        }
        return wrapper.fetchCurrencies(handle)
    }

    public func fetchTicker(symbol: String) -> String {
        guard handle != 0 else {
            return "{\"error\": \"Invalid handle\"}"
        }
        return wrapper.fetchTicker(handle, symbol: symbol)
    }

    // Placeholder for future WebSocket methods
    public func watchTicker(symbol: String, callback: @escaping (String) -> Void) {
        print("WatchTicker for \(symbol) - not implemented yet in Go wrapper.")
    }
}
