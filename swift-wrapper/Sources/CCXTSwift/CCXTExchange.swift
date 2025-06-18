import Foundation
import CCXT

public class CCXTExchange {
    private let exchange: CcxtCCXTGoExchange
    
    public init?(exchangeName: String, config: [String: Any]? = nil) {
        let configString: String

        if let config = config,
           let jsonData = try? JSONSerialization.data(withJSONObject: config, options: []),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            configString = jsonString
        } else {
            configString = "{}"
        }
        guard let ex = CcxtNewExchange(exchangeName, configString) else {
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
            var cleaned: [String: Any] = [:]
            for (key, val) in dict {
                if let cleanedVal = cleanAny(val) {
                    cleaned[key] = cleanedVal
                }
            }
            return cleaned
        case let array as [Any]:
            return array.compactMap { cleanAny($0) }
        default:
            return value
        }
    }

    func stringify<T: Encodable>(_ object: T, prettyPrinted: Bool = false) -> String? {
        let encoder = JSONEncoder()
        if prettyPrinted {
            encoder.outputFormatting = .prettyPrinted
        }

        do {
            let data = try encoder.encode(object)
            return String(data: data, encoding: .utf8)
        } catch {
            print("Failed to stringify object: \(error)")
            return nil
        }
    }

    // ------------------------------------------------------------------------

    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################

    // ------------------------------------------------------------------------
    // METHODS BELOW THIS LINE ARE TRANSPILED

}