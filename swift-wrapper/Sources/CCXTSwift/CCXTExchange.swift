import Foundation
import CCXT

extension CCXTExchange.CCXTError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .exchange(let msg):
            return msg                          // show the exchange text
        case .decoding(let err):
            return "JSON decoding failed: \(err.localizedDescription)"
        }
    }
}

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

    private func cleanAny(_ value: Any) -> Any? {
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

    private func stringify<T: Encodable>(_ object: T, prettyPrinted: Bool = false) -> String? {
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
    
    public enum CCXTError: Error {
        case exchange(String)   // message coming back from the Go layer / exchange
        case decoding(Error)    // genuine JSON-decoding problem
    }
    
    private func decode(_ data: Data) throws -> Any {
        // First, try to parse as JSON, the normal successful path
        do {
            return try JSONSerialization.jsonObject(with: data, options: [])
        } catch {
            // Not valid JSON -> might be a ccxt panic string. Check that format.
            // Expected format (single-line, simplified):
            //   "panic: ... [ccxtError]::[<ErrorClass>]::[<exchange> {\"code\":...,\"msg\":...}]\nStack:\n"
            if let s = String(data: data, encoding: .utf8) {
                // Try to extract the segment after the last "[ccxtError]::["
                // Split by "::"- panic string delimeter
                let segments = s.components(separatedBy: "::")
                if segments.count >= 3,
                   segments[0].contains("[ccxtError]") {
                    // Example segments:
                    //  [0] ...[ccxtError]
                    //  [1] "[ExchangeError]"
                    //  [2] "[bitget {\"code\":...}..."
                    // Extract error type (remove brackets)
                    let rawType = segments[1].trimmingCharacters(in: CharacterSet(charactersIn: "[]"))

                    // message embedded in a JSON object -> {"msg": ...}
                    if let jsonStart = s.firstIndex(of: "{"),
                       let jsonEnd = s[jsonStart...].firstIndex(of: "}") {

                        let jsonRange = jsonStart...jsonEnd
                        var jsonSubstring = String(s[jsonRange])
                        jsonSubstring = jsonSubstring.replacingOccurrences(of: "\\\"", with: "\"")

                        if let jsonData = jsonSubstring.data(using: .utf8),
                           let jsonObj = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {

                            let message = (jsonObj["msg"] as? String) ??
                                           (jsonObj["message"] as? String) ?? jsonSubstring

                            if let errorClass = NSClassFromString("CCXTSwift.\(rawType)") as? BaseError.Type {
                                throw errorClass.init(message)
                            }
                            throw CCXTError.exchange(message)
                        }
                    }

                    // plain message wrapped in brackets, take last segment
                    let tail = segments.last ?? ""
                    var plainMsg = tail.replacingOccurrences(
                                      of: "]\\nStack:\\n\"",  // literal ]\nStack:\n"
                                      with: "")

                    plainMsg = plainMsg.trimmingCharacters(
                                   in: CharacterSet(charactersIn: "[]\"\n "))

                    if let errorClass = NSClassFromString("CCXTSwift.\(rawType)") as? BaseError.Type {
                        throw errorClass.init(plainMsg)
                    }
                    throw CCXTError.exchange(plainMsg)
                }
                // Could read as UTF-8 but not recognised panic format
                throw CCXTError.exchange(s.trimmingCharacters(in: .whitespacesAndNewlines))
            }
            // Still unknown binary payload
            throw CCXTError.decoding(error)
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