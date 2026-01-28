package ccxt

import (
	"fmt"
	"strings"
)

// ============================================================================
// SBE (Simple Binary Encoding) Helper Methods
// ============================================================================
// This file contains SBE-specific helper methods for the Exchange class.
// These methods provide utilities for WebSocket binary message decoding,
// orderbook formatting, and data normalization for SBE-encoded messages.
// ============================================================================

// SetupSbeBinaryDecoder sets up binary decoder for SBE WebSocket connections
// Check if URL indicates SBE format and decoder not already set
func (this *Exchange) SetupSbeBinaryDecoder(client interface{}, url interface{}, decoderFunction interface{}) {
	urlStr, ok := url.(string)
	if !ok {
		return
	}

	isSbeUrl := strings.Contains(urlStr, "responseFormat=sbe") ||
		strings.Contains(urlStr, "/public-sbe") ||
		strings.Contains(urlStr, "/ws-sbe")

	if isSbeUrl && client != nil {
		// In Go, client properties are accessed through reflection or type assertion
		// The actual implementation depends on the WS client structure
		// For now, we just check if SBE URL and leave decoder setup to specific exchange implementations
		if this.Verbose {
			fmt.Println("SetupSbeBinaryDecoder: Detected SBE URL:", urlStr)
		}
	}
}

// DecodeSbeNestedMessage decodes nested SBE message (used in envelope patterns like Binance WebSocket)
// @param buffer - The binary SBE message
// @returns Decoded message data
func (this *Exchange) DecodeSbeNestedMessage(buffer interface{}) interface{} {
	templateId := this.ReadSbeTemplateId(buffer)
	if this.Verbose {
		var bufLen int
		if bytes, ok := buffer.([]byte); ok {
			bufLen = len(bytes)
		}
		fmt.Println("DecodeSbeNestedMessage: templateId:", templateId, "buffer length:", bufLen)
	}

	registry := this.GetSbeDecoderRegistry()
	if registry == nil {
		if this.Verbose {
			fmt.Println("DecodeSbeNestedMessage: no decoder registry available")
		}
		return nil
	}

	registryMap, ok := registry.(map[string]interface{})
	if !ok {
		return nil
	}

	templateIdStr := fmt.Sprintf("%v", templateId)
	_, exists := registryMap[templateIdStr]
	if !exists {
		if this.Verbose {
			fmt.Println("DecodeSbeNestedMessage: unknown template ID:", templateId)
		}
		return nil
	}

	// Defer error handling
	defer func() {
		if r := recover(); r != nil {
			if this.Verbose {
				fmt.Println("DecodeSbeNestedMessage: error decoding templateId", templateId, ":", r)
			}
		}
	}()

	// Call the decoder - implementation depends on decoder type
	result := this.DecodeSbeMessage(buffer, registry)
	if resultMap, ok := result.(map[string]interface{}); ok {
		return resultMap["data"]
	}
	return result
}

// DecodeSbeWebSocketMessage decodes SBE-encoded WebSocket message
// Override this in exchange class to handle exchange-specific envelope patterns
// @param buffer - The binary SBE message
// @returns Decoded message data
func (this *Exchange) DecodeSbeWebSocketMessage(buffer interface{}) interface{} {
	// Default implementation: direct decode without envelope
	result := this.DecodeSbeMessage(buffer, this.GetSbeDecoderRegistry())
	if resultMap, ok := result.(map[string]interface{}); ok {
		return resultMap["data"]
	}
	return result
}

// GetSbeMessageHandlers gets SBE message handlers registry
// Override this in exchange class to provide message routing
// @returns Map of template ID to handler function
func (this *Exchange) GetSbeMessageHandlers() interface{} {
	return map[string]interface{}{}
}

// HandleSbeMessage handles SBE binary message with automatic routing
// @param client - WebSocket client
// @param message - Binary SBE message
func (this *Exchange) HandleSbeMessage(client interface{}, message interface{}) {
	defer func() {
		if r := recover(); r != nil {
			if this.Verbose {
				fmt.Println("HandleSbeMessage: Failed to decode SBE message:", r)
			}
		}
	}()

	if this.Verbose {
		var msgLen int
		if bytes, ok := message.([]byte); ok {
			msgLen = len(bytes)
		}
		fmt.Println("HandleSbeMessage: Received binary message, size:", msgLen)
	}

	// Decode the SBE message
	decoderRegistry := this.GetSbeDecoderRegistry()
	result := this.DecodeSbeMessage(message, decoderRegistry)

	resultMap, ok := result.(map[string]interface{})
	if !ok {
		return
	}

	templateId := resultMap["templateId"]
	decoded := resultMap["data"]

	if this.Verbose {
		fmt.Println("HandleSbeMessage: Decoded template ID:", templateId)
	}

	// Route to appropriate handler
	handlers := this.GetSbeMessageHandlers()
	handlersMap, ok := handlers.(map[string]interface{})
	if !ok {
		return
	}

	templateIdStr := fmt.Sprintf("%v", templateId)
	handler, exists := handlersMap[templateIdStr]
	if exists {
		if handlerFunc, ok := handler.(func(interface{}, interface{})); ok {
			handlerFunc(client, decoded)
		}
	} else if this.Verbose {
		fmt.Println("HandleSbeMessage: No handler for template ID:", templateId)
	}
}

// FormatSbeOrderbook formats orderbook from SBE message with exponents
// Convenience helper for common orderbook processing pattern
// @param message - Decoded SBE message
// @param bidsKey - Key for bids array (default: "bids")
// @param asksKey - Key for asks array (default: "asks")
// @param priceKey - Key for price in bid/ask objects (default: "px")
// @param sizeKey - Key for size in bid/ask objects (default: "sz")
// @returns Formatted orderbook with bids and asks arrays
func (this *Exchange) FormatSbeOrderbook(message interface{}, keys ...string) interface{} {
	bidsKey := "bids"
	asksKey := "asks"
	priceKey := "px"
	sizeKey := "sz"

	if len(keys) > 0 {
		bidsKey = keys[0]
	}
	if len(keys) > 1 {
		asksKey = keys[1]
	}
	if len(keys) > 2 {
		priceKey = keys[2]
	}
	if len(keys) > 3 {
		sizeKey = keys[3]
	}

	messageMap, ok := message.(map[string]interface{})
	if !ok {
		return map[string]interface{}{
			"bids": []interface{}{},
			"asks": []interface{}{},
		}
	}

	pxExponent := this.SafeInteger(message, "pxExponent", this.SafeInteger(message, "priceExponent", 0))
	szExponent := this.SafeInteger(message, "szExponent", this.SafeInteger(message, "qtyExponent", 0))

	rawBids := this.SafeValue(messageMap, bidsKey, []interface{}{})
	rawAsks := this.SafeValue(messageMap, asksKey, []interface{}{})

	rawBidsList, _ := rawBids.([]interface{})
	rawAsksList, _ := rawAsks.([]interface{})

	bids := []interface{}{}
	asks := []interface{}{}

	// Process bids
	for _, bidItem := range rawBidsList {
		bid, ok := bidItem.(map[string]interface{})
		if !ok {
			continue
		}
		pxMantissa := this.SafeInteger(bid, priceKey+"Mantissa", this.SafeInteger(bid, priceKey, 0))
		szMantissa := this.SafeInteger(bid, sizeKey+"Mantissa", this.SafeInteger(bid, sizeKey, 0))
		price := this.ApplyExponent(pxMantissa, pxExponent)
		size := this.ApplyExponent(szMantissa, szExponent)
		bids = append(bids, []interface{}{price, size})
	}

	// Process asks
	for _, askItem := range rawAsksList {
		ask, ok := askItem.(map[string]interface{})
		if !ok {
			continue
		}
		pxMantissa := this.SafeInteger(ask, priceKey+"Mantissa", this.SafeInteger(ask, priceKey, 0))
		szMantissa := this.SafeInteger(ask, sizeKey+"Mantissa", this.SafeInteger(ask, sizeKey, 0))
		price := this.ApplyExponent(pxMantissa, pxExponent)
		size := this.ApplyExponent(szMantissa, szExponent)
		asks = append(asks, []interface{}{price, size})
	}

	return map[string]interface{}{
		"bids": bids,
		"asks": asks,
	}
}

// SafeBigInt safely accesses a BigInt value and converts to number
// Many SBE decoders return BigInt for large numbers - this helper safely converts them
// @param object - The object containing the value
// @param key - The key to access
// @param defaultValue - Default value if key not found
// @returns The value as number (converted from BigInt if needed)
func (this *Exchange) SafeBigInt(object interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	value := this.SafeValue(object, key)
	if value == nil {
		if len(defaultValue) > 0 {
			return defaultValue[0]
		}
		return nil
	}

	// In Go, handle int64, uint64 which are similar to BigInt
	switch v := value.(type) {
	case int64:
		return float64(v)
	case uint64:
		return float64(v)
	case int:
		return float64(v)
	case float64:
		return v
	default:
		return value
	}
}

// ConvertBigIntFields converts all BigInt fields in an object to numbers
// Useful for SBE messages that use BigInt for IDs and timestamps
// @param object - The object to process
// @param fields - Specific fields to convert (optional)
// @returns New object with BigInt fields converted to numbers
func (this *Exchange) ConvertBigIntFields(object interface{}, fields ...interface{}) interface{} {
	if object == nil {
		return object
	}

	objectMap, ok := object.(map[string]interface{})
	if !ok {
		return object
	}

	result := make(map[string]interface{})

	var keys []string
	if len(fields) > 0 {
		if fieldsList, ok := fields[0].([]string); ok {
			keys = fieldsList
		} else {
			keys = make([]string, 0, len(objectMap))
			for k := range objectMap {
				keys = append(keys, k)
			}
		}
	} else {
		keys = make([]string, 0, len(objectMap))
		for k := range objectMap {
			keys = append(keys, k)
		}
	}

	for _, key := range keys {
		value := objectMap[key]

		switch v := value.(type) {
		case int64:
			result[key] = float64(v)
		case uint64:
			result[key] = float64(v)
		case []interface{}:
			converted := make([]interface{}, len(v))
			for j, item := range v {
				converted[j] = this.ConvertBigIntFields(item, fields...)
			}
			result[key] = converted
		default:
			result[key] = value
		}
	}

	return result
}

// NormalizeSbeOrder normalizes SBE order data (common pattern for Binance WebSocket)
// Converts exponent fields to actual values
// @param order - SBE order data
// @returns Normalized order data compatible with parseOrder
func (this *Exchange) NormalizeSbeOrder(order interface{}) interface{} {
	orderMap, ok := order.(map[string]interface{})
	if !ok {
		return order
	}

	// Check if this is SBE format (has exponent fields)
	_, hasPriceExp := orderMap["priceExponent"]
	_, hasQtyExp := orderMap["qtyExponent"]
	hasExponents := hasPriceExp || hasQtyExp

	if !hasExponents {
		return order // Already normalized or not SBE format
	}

	// Apply exponents and convert to standard format
	priceExponent := this.SafeInteger(order, "priceExponent", 0)
	qtyExponent := this.SafeInteger(order, "qtyExponent", 0)

	normalized := make(map[string]interface{})

	for key, value := range orderMap {
		// Skip exponent fields themselves
		if strings.HasSuffix(key, "Exponent") {
			continue
		}

		// Handle price-related mantissa fields
		if key == "price" || key == "stopPrice" || key == "icebergQty" {
			normalized[key] = this.NumberToString(this.ApplyExponent(value, priceExponent))
		} else if key == "origQty" || key == "executedQty" || key == "cummulativeQuoteQty" {
			// Handle quantity-related fields
			normalized[key] = this.NumberToString(this.ApplyExponent(value, qtyExponent))
		} else {
			// Convert int64/uint64 to string for IDs
			switch v := value.(type) {
			case int64:
				normalized[key] = fmt.Sprintf("%d", v)
			case uint64:
				normalized[key] = fmt.Sprintf("%d", v)
			default:
				// Copy other fields as-is
				normalized[key] = value
			}
		}
	}

	return normalized
}
