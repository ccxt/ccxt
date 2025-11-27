# EDL Schema Enhancements - Phase 1-1

## Overview
This document describes the enhancements made to the EDL schema (`edl.schema.json`) in phase 1-1 to support comprehensive metadata for exchange definitions.

## Schema Version: 1.0.0

### 1. Schema Versioning
- **Added**: `schemaVersion` property to track schema evolution
- **Type**: string
- **Default**: "1.0.0"
- **Purpose**: Enable backward compatibility tracking and schema migration

### 2. URLs Enhancements

#### 2.1 Localized Websites (`urls.website`)
- **Added**: Support for locale-specific website URLs
- **Type**: object with locale keys (en, zh, jp, kr, etc.)
- **Example**:
```json
{
  "urls": {
    "website": {
      "en": "https://example.com/en",
      "zh": "https://example.com/zh",
      "jp": "https://example.com/jp"
    }
  }
}
```

#### 2.2 Enhanced URL Documentation
All existing URL fields now have descriptive documentation:
- `logo`: Exchange logo URL
- `api`: API base URL(s) - single URL or object mapping
- `test`: Testnet/sandbox API URLs
- `www`: Main website URL
- `doc`: API documentation URLs
- `fees`: Fee schedule URL
- `referral`: Referral/affiliate program URL

### 3. Capabilities (`has`) Enhancements

#### 3.1 Per-Market Capability Overrides
- **Enhancement**: Support for market-type specific capabilities
- **Types supported**: boolean | null | object
- **Market types**: spot, margin, swap, future, option
- **Example**:
```json
{
  "has": {
    "fetchTicker": true,
    "fetchOHLCV": {
      "spot": true,
      "swap": false,
      "future": null
    }
  }
}
```

### 4. Precision Mode Support

#### 4.1 Precision Mode Field
- **Added**: `precision.mode` to specify exchange's precision handling
- **Type**: enum
- **Values**:
  - `tickSize`: Prices must be multiples of tick size
  - `significantDigits`: Number of significant digits
  - `decimalPlaces`: Number of decimal places
- **Example**:
```json
{
  "precision": {
    "mode": "tickSize",
    "amount": 8,
    "price": 8
  }
}
```

### 5. Exchange Options Enhancements

#### 5.1 Broker ID Support
- **Added**: `options.brokerId` - CCXT broker ID for affiliate tracking
- **Added**: `options.broker` - Alternative broker ID field name

#### 5.2 Account Management
- **Added**: `options.accountId` - Default account ID
- **Added**: `options.accountsById` - Named accounts mapping

#### 5.3 Market Type Configuration
- **Added**: `options.defaultType` - Default market type (spot, margin, swap, future, option)
- **Added**: `options.defaultSubType` - Default market subtype (linear, inverse, quanto)

#### 5.4 Common Exchange Options
- **Added**: `options.sandboxMode` - Enable testnet/sandbox
- **Added**: `options.fetchMarketsMethod` - Override fetchMarkets endpoint
- **Added**: `options.createMarketBuyOrderRequiresPrice` - Price requirement for market buys
- **Added**: `options.adjustForTimeDifference` - Auto-adjust timestamps
- **Added**: `options.recvWindow` - Request validity window (ms)
- **Added**: `options.warnOnFetchOpenOrdersWithoutSymbol` - Warning control

#### 5.5 Extensibility
- **Maintained**: `additionalProperties: true` to allow exchange-specific options

### 6. Existing Fields Preserved

All existing schema fields remain unchanged and backward compatible:
- `timeframes` - OHLCV timeframe mappings
- `requiredCredentials` - Authentication credential requirements
- All other existing metadata fields

## Backward Compatibility

The schema maintains full backward compatibility:
- All new fields are optional
- Existing EDL files validate without modification
- Enhanced fields use `oneOf` to support both old and new formats
- Default values preserve original behavior

## Validation

The schema has been validated with:
- JSON Schema Draft 07 compliance
- AJV validation with strict mode
- Test cases for enhanced features
- Backward compatibility tests

## Usage Examples

### Example 1: Full Featured Exchange
```json
{
  "schemaVersion": "1.0.0",
  "exchange": {
    "id": "modernexchange",
    "name": "Modern Exchange"
  },
  "urls": {
    "api": "https://api.modern.com",
    "www": "https://modern.com",
    "doc": ["https://docs.modern.com"],
    "website": {
      "en": "https://modern.com/en",
      "zh": "https://modern.com/zh"
    }
  },
  "has": {
    "fetchOHLCV": {
      "spot": true,
      "swap": true,
      "future": false
    }
  },
  "precision": {
    "mode": "tickSize"
  },
  "options": {
    "brokerId": "ccxt",
    "defaultType": "spot"
  }
}
```

### Example 2: Minimal Legacy Exchange (backward compatible)
```json
{
  "exchange": {
    "id": "legacy",
    "name": "Legacy Exchange"
  },
  "urls": {
    "api": "https://api.legacy.com",
    "www": "https://legacy.com",
    "doc": ["https://docs.legacy.com"]
  },
  "has": {
    "fetchTicker": true
  },
  "auth": {
    "type": "hmac"
  },
  "api": {}
}
```

## Next Steps

These schema enhancements enable:
1. Richer exchange metadata capture
2. Better market-type specific configuration
3. Improved internationalization support
4. Enhanced broker/affiliate tracking
5. More precise precision mode handling

Future phases will build upon this foundation to support:
- Market structure definitions
- Advanced fee configurations
- Trading operation schemas
- Enhanced error handling patterns
