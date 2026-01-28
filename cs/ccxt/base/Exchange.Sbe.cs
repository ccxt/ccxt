using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ccxt;

using dict = Dictionary<string, object>;

/// <summary>
/// SBE (Simple Binary Encoding) related methods for decoding binary market data
/// </summary>
public partial class Exchange
{
    /// <summary>
    /// Reads the template ID from an SBE message header
    /// SBE message header format (8 bytes):
    ///   - blockLength (2 bytes, uint16, offset 0)
    ///   - templateId (2 bytes, uint16, offset 2)
    ///   - schemaId (2 bytes, uint16, offset 4)
    ///   - version (2 bytes, uint16, offset 6)
    /// </summary>
    /// <param name="buffer">The binary SBE message (byte array or string)</param>
    /// <returns>Template ID as integer</returns>
    public object readSbeTemplateId(object buffer)
    {
        byte[] bufferBytes;

        // Convert to byte array
        if (buffer is byte[] bytes)
        {
            bufferBytes = bytes;
        }
        else if (buffer is string str)
        {
            bufferBytes = Encoding.UTF8.GetBytes(str);
        }
        else
        {
            return -1;
        }

        if (bufferBytes.Length < 8)
        {
            return -1;
        }

        // Read uint16 at offset 2, little-endian
        int templateId = BitConverter.ToUInt16(bufferBytes, 2);
        return templateId;
    }

    /// <summary>
    /// Convert mantissa and exponent to decimal number
    /// Used by exchanges that encode prices/amounts as mantissa * 10^exponent
    /// </summary>
    /// <param name="mantissa">The mantissa value (int, long, or double)</param>
    /// <param name="exponent">The power of 10 exponent</param>
    /// <returns>The decimal number</returns>
    public object applyExponent(object mantissa, object exponent)
    {
        double mantissaNum;
        double exponentNum;

        // Convert mantissa to double
        if (mantissa is int || mantissa is long || mantissa is short || mantissa is byte)
        {
            mantissaNum = Convert.ToDouble(mantissa);
        }
        else if (mantissa is double || mantissa is float || mantissa is decimal)
        {
            mantissaNum = Convert.ToDouble(mantissa);
        }
        else if (mantissa is string mantissaStr)
        {
            if (!double.TryParse(mantissaStr, out mantissaNum))
            {
                mantissaNum = 0.0;
            }
        }
        else
        {
            mantissaNum = 0.0;
        }

        // Convert exponent to double
        if (exponent is int || exponent is long || exponent is short || exponent is byte)
        {
            exponentNum = Convert.ToDouble(exponent);
        }
        else if (exponent is double || exponent is float || exponent is decimal)
        {
            exponentNum = Convert.ToDouble(exponent);
        }
        else if (exponent is string exponentStr)
        {
            if (!double.TryParse(exponentStr, out exponentNum))
            {
                exponentNum = 0.0;
            }
        }
        else
        {
            exponentNum = 0.0;
        }

        return mantissaNum * Math.Pow(10, exponentNum);
    }

    /// <summary>
    /// Convert mantissa128 byte array to number
    /// mantissa128 is a signed 128-bit integer encoded as a little-endian byte array
    /// Used by Binance SBE for large volume values
    /// </summary>
    /// <param name="bytesData">The byte array</param>
    /// <returns>The numeric value</returns>
    public object mantissa128ToNumber(object bytesData)
    {
        if (bytesData == null)
        {
            return 0;
        }

        byte[] bytes;

        // Convert to byte array
        if (bytesData is byte[] byteArray)
        {
            if (byteArray.Length == 0)
            {
                return 0;
            }
            bytes = byteArray;
        }
        else if (bytesData is string str)
        {
            if (str.Length == 0)
            {
                return 0;
            }
            bytes = Encoding.UTF8.GetBytes(str);
        }
        else if (bytesData is List<object> list)
        {
            if (list.Count == 0)
            {
                return 0;
            }
            bytes = new byte[list.Count];
            for (int i = 0; i < list.Count; i++)
            {
                bytes[i] = Convert.ToByte(list[i]);
            }
        }
        else
        {
            return 0;
        }

        // For mantissa128, we need to handle signed 128-bit integers
        // The value −2^127 is nullValue by default
        // For practical purposes, we'll read up to 8 bytes (64-bit) as most values fit
        ulong result = 0;
        ulong multiplier = 1;

        // Read up to 8 bytes (64-bit safe range)
        int limit = Math.Min(bytes.Length, 8);

        for (int i = 0; i < limit; i++)
        {
            result += (ulong)bytes[i] * multiplier;
            multiplier *= 256;
        }

        return (long)result;
    }

    /// <summary>
    /// Decode SBE message using registered decoder based on template ID
    /// </summary>
    /// <param name="buffer">The binary SBE message (byte array or string)</param>
    /// <param name="decoderRegistry">Map of template ID to decoder class</param>
    /// <returns>Decoded message with templateId and data</returns>
    public object decodeSbeMessage(object buffer, object decoderRegistry)
    {
        byte[] bufferBytes;

        // Convert to byte array
        if (buffer is byte[] bytes)
        {
            bufferBytes = bytes;
        }
        else if (buffer is string str)
        {
            bufferBytes = Encoding.UTF8.GetBytes(str);
        }
        else
        {
            throw new ExchangeError(this.id + " decodeSbeMessage() invalid buffer type");
        }

        // Read template ID from header
        var templateId = readSbeTemplateId(bufferBytes);

        // Look up decoder class in registry
        if (!(decoderRegistry is dict registry))
        {
            throw new ExchangeError(this.id + " decodeSbeMessage() invalid decoder registry");
        }

        string templateIdStr = templateId.ToString();
        if (!registry.ContainsKey(templateIdStr))
        {
            throw new ExchangeError(this.id + " decodeSbeMessage() unknown template ID: " + templateIdStr);
        }

        var decoderClass = registry[templateIdStr];

        // Instantiate and decode
        // Skip 8-byte SBE message header (blockLength, templateId, schemaId, version)
        // Note: In C#, the decoder implementation would need to be called here
        // This is a placeholder that assumes the decoder has a Decode method
        dynamic decoder = Activator.CreateInstance(decoderClass.GetType());
        var decoded = decoder.decode(bufferBytes, 8);

        return new dict
        {
            ["templateId"] = templateId,
            ["data"] = decoded
        };
    }

    /// <summary>
    /// Automatically apply exponents to mantissa fields in decoded SBE data
    /// Finds fields ending in 'Mantissa' and applies corresponding 'Exponent' field
    /// </summary>
    /// <param name="data">Decoded SBE message data</param>
    /// <param name="exponentMap">Optional map of mantissa field names to exponent field names</param>
    /// <returns>Data with mantissas converted to decimal numbers</returns>
    public object applySbeExponents(object data, object exponentMap = null)
    {
        if (data == null || !(data is dict dataMap))
        {
            return data;
        }

        var result = new dict();
        var expMap = exponentMap as dict;

        // Get all exponent fields first
        var exponents = new dict();
        foreach (var kvp in dataMap)
        {
            if (kvp.Key.EndsWith("Exponent"))
            {
                exponents[kvp.Key] = kvp.Value;
            }
        }

        // Process all fields
        foreach (var kvp in dataMap)
        {
            string key = kvp.Key;
            object value = kvp.Value;

            // Handle arrays recursively
            if (value is List<object> list)
            {
                var mappedArray = new List<object>();
                foreach (var item in list)
                {
                    mappedArray.Add(applySbeExponents(item, exponentMap));
                }
                result[key] = mappedArray;
            }
            else if (key.EndsWith("Mantissa"))
            {
                // Find corresponding exponent
                string baseFieldName = key.Replace("Mantissa", "");
                string exponentKey = baseFieldName + "Exponent";

                // Check if custom exponent mapping provided
                if (expMap != null && expMap.ContainsKey(key))
                {
                    exponentKey = Convert.ToString(expMap[key]);
                }

                object exponent = exponents.ContainsKey(exponentKey) ? exponents[exponentKey] : 0;

                // Convert mantissa to decimal number
                result[baseFieldName] = applyExponent(value, exponent);
            }
            else if (!key.EndsWith("Exponent"))
            {
                // Copy non-exponent fields
                result[key] = value;
            }
        }

        return result;
    }

    /// <summary>
    /// Decode SBE-encoded WebSocket message
    /// Override this in exchange class to handle exchange-specific envelope patterns
    /// </summary>
    /// <param name="buffer">The binary SBE message</param>
    /// <returns>Decoded message data</returns>
    public virtual object decodeSbeWebSocketMessage(object buffer)
    {
        // Default implementation: direct decode without envelope
        object decoderRegistry = this.call("getSbeDecoderRegistry");
        object result = this.decodeSbeMessage(buffer, decoderRegistry);
        return ((dict)result)["data"];
    }

    /// <summary>
    /// Get SBE message handlers registry
    /// Override this in exchange class to provide message routing
    /// </summary>
    /// <returns>Map of template ID to handler function</returns>
    public virtual object getSbeMessageHandlers()
    {
        return new dict();
    }

    /// <summary>
    /// Normalize SBE order format to standard order format
    /// </summary>
    /// <param name="order">SBE order data</param>
    /// <returns>Normalized order data compatible with parseOrder</returns>
    public virtual object normalizeSbeOrder(object order)
    {
        // Check if this is SBE format (has exponent fields)
        dict orderDict = order as dict;
        if (orderDict == null)
        {
            return order;
        }

        bool hasExponents = orderDict.ContainsKey("priceExponent") || orderDict.ContainsKey("qtyExponent");
        if (!hasExponents)
        {
            return order; // Already normalized or not SBE format
        }

        // Apply exponents and convert to standard format
        return this.applySbeExponents(order, null);
    }
}
