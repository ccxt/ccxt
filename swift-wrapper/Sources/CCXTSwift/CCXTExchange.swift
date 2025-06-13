import Foundation
import CCXT

public class CCXTExchange {
    private let exchange: CcxtExchange
    
    public init?(exchangeName: String, configJson: String) {
        guard let ex = CcxtNewExchange(exchangeName, configJson) else {
            return nil
        }
        self.exchange = ex
    }

    func cleanAny(_ value: Any) -> Any? {
        switch value {
        case is NSNull:
            return nil
        case let number as NSNumber:
            if CFGetTypeID(number) == CFBooleanGetTypeID() {
                return number.boolValue
            } else {
                return number
            }
        case let dict as [String: Any]:
            var cleaned: [String: Any?] = [:]
            for (key, val) in dict {
                cleaned[key] = cleanAny(val)
            }
            return cleaned
        case let array as [Any]:
            return array.map { cleanAny($0) }
        default:
            return value
        }
    }
    
    public func fetchMarkets() -> Any {
        do {
            let data = try exchange.fetchMarkets()
            let jsonObject = try JSONSerialization.jsonObject(with: data, options: [])
            return cleanAny(jsonObject) ?? [:]
        } catch {
            print("fetchMarkets error: \(error.localizedDescription)")
            return ["error": error.localizedDescription]
        }
    }

    public func fetchTicker(symbol: String) -> String {
        do {
            let data = try exchange.fetchTicker(symbol)
            return String(data: data, encoding: .utf8) ?? "{}"
        } catch {
            return "{\"error\": \"\(error.localizedDescription)\"}"
        }
    }

    // Placeholder for future WebSocket methods
    public func watchTicker(symbol: String, callback: @escaping (String) -> Void) {
        print("WatchTicker for \(symbol) - not implemented yet in Go wrapper.")
    }
}
