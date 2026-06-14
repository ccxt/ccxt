-- | CCXT Code Generation Patterns
-- |
-- | This module contains common patterns and templates for generating
-- | CCXT-compatible TypeScript code.
module CCXT.Patterns where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Array as Array
import Data.Map (Map)
import Data.Map as Map

import CCXT.Types

-- | Standard CCXT method signatures for unified API methods
type MethodSignature =
  { name :: String
  , async :: Boolean
  , params :: Array TSParam
  , returnType :: TSType
  }

-- | fetchTicker signature
fetchTickerSig :: MethodSignature
fetchTickerSig =
  { name: "fetchTicker"
  , async: true
  , params:
      [ param "symbol" TSString false Nothing
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Ticker")
  }

-- | fetchTickers signature
fetchTickersSig :: MethodSignature
fetchTickersSig =
  { name: "fetchTickers"
  , async: true
  , params:
      [ param "symbols" (TSNullable (TSArray TSString)) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Tickers")
  }

-- | fetchOrderBook signature
fetchOrderBookSig :: MethodSignature
fetchOrderBookSig =
  { name: "fetchOrderBook"
  , async: true
  , params:
      [ param "symbol" TSString false Nothing
      , param "limit" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "OrderBook")
  }

-- | fetchTrades signature
fetchTradesSig :: MethodSignature
fetchTradesSig =
  { name: "fetchTrades"
  , async: true
  , params:
      [ param "symbol" TSString false Nothing
      , param "since" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "limit" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSArray (TSRef "Trade"))
  }

-- | fetchOHLCV signature
fetchOHLCVSig :: MethodSignature
fetchOHLCVSig =
  { name: "fetchOHLCV"
  , async: true
  , params:
      [ param "symbol" TSString false Nothing
      , param "timeframe" TSString true (Just $ TSLit (LitString "1m"))
      , param "since" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "limit" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSArray (TSRef "OHLCV"))
  }

-- | fetchBalance signature
fetchBalanceSig :: MethodSignature
fetchBalanceSig =
  { name: "fetchBalance"
  , async: true
  , params:
      [ param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Balances")
  }

-- | createOrder signature
createOrderSig :: MethodSignature
createOrderSig =
  { name: "createOrder"
  , async: true
  , params:
      [ param "symbol" TSString false Nothing
      , param "type" (TSRef "OrderType") false Nothing
      , param "side" (TSRef "OrderSide") false Nothing
      , param "amount" TSNumber false Nothing
      , param "price" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Order")
  }

-- | cancelOrder signature
cancelOrderSig :: MethodSignature
cancelOrderSig =
  { name: "cancelOrder"
  , async: true
  , params:
      [ param "id" TSString false Nothing
      , param "symbol" (TSNullable TSString) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Order")
  }

-- | fetchOrder signature
fetchOrderSig :: MethodSignature
fetchOrderSig =
  { name: "fetchOrder"
  , async: true
  , params:
      [ param "id" TSString false Nothing
      , param "symbol" (TSNullable TSString) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSRef "Order")
  }

-- | fetchOpenOrders signature
fetchOpenOrdersSig :: MethodSignature
fetchOpenOrdersSig =
  { name: "fetchOpenOrders"
  , async: true
  , params:
      [ param "symbol" (TSNullable TSString) true (Just $ TSLit LitUndefined)
      , param "since" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "limit" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSArray (TSRef "Order"))
  }

-- | fetchMyTrades signature
fetchMyTradesSig :: MethodSignature
fetchMyTradesSig =
  { name: "fetchMyTrades"
  , async: true
  , params:
      [ param "symbol" (TSNullable TSString) true (Just $ TSLit LitUndefined)
      , param "since" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "limit" (TSNullable TSNumber) true (Just $ TSLit LitUndefined)
      , param "params" (TSObject Nothing) true (Just $ TSObjectLit [])
      ]
  , returnType: TSPromise (TSArray (TSRef "Trade"))
  }

-- | Helper to create a parameter
param :: String -> TSType -> Boolean -> Maybe TSExpr -> TSParam
param name paramType optional defaultValue =
  { name
  , paramType: Just paramType
  , defaultValue
  , optional
  , rest: false
  }

-- | Standard imports for generated exchange files
standardImports :: Array TSImport
standardImports =
  [ { source: "./base/Exchange.js"
    , defaultImport: Just "Exchange"
    , namedImports: []
    , typeOnly: false
    }
  , { source: "./base/types.js"
    , defaultImport: Nothing
    , namedImports:
        [ "Market"
        , "Trade"
        , "Ticker"
        , "Tickers"
        , "OHLCV"
        , "Order"
        , "OrderBook"
        , "Balances"
        , "Currency"
        , "Transaction"
        , "Str"
        , "Int"
        , "Num"
        , "Dict"
        , "OrderType"
        , "OrderSide"
        , "Strings"
        ]
    , typeOnly: true
    }
  , { source: "./base/Precise.js"
    , defaultImport: Nothing
    , namedImports: ["Precise"]
    , typeOnly: false
    }
  ]

-- | Map of CCXT error types to exception classes
errorTypeMap :: Map String String
errorTypeMap = Map.fromFoldable
  [ pair "ExchangeError" "ExchangeError"
  , pair "AuthenticationError" "AuthenticationError"
  , pair "PermissionDenied" "PermissionDenied"
  , pair "InsufficientFunds" "InsufficientFunds"
  , pair "InvalidOrder" "InvalidOrder"
  , pair "OrderNotFound" "OrderNotFound"
  , pair "CancelPending" "CancelPending"
  , pair "NetworkError" "NetworkError"
  , pair "RateLimitExceeded" "RateLimitExceeded"
  , pair "ExchangeNotAvailable" "ExchangeNotAvailable"
  , pair "InvalidNonce" "InvalidNonce"
  , pair "BadRequest" "BadRequest"
  , pair "BadResponse" "BadResponse"
  , pair "NullResponse" "NullResponse"
  , pair "NotSupported" "NotSupported"
  , pair "OnMaintenance" "OnMaintenance"
  , pair "AccountSuspended" "AccountSuspended"
  , pair "InvalidAddress" "InvalidAddress"
  , pair "AddressPending" "AddressPending"
  , pair "ArgumentsRequired" "ArgumentsRequired"
  , pair "BadSymbol" "BadSymbol"
  , pair "MarginModeAlreadySet" "MarginModeAlreadySet"
  ]
  where
    pair a b = { fst: a, snd: b }

-- | Standard order status mapping
orderStatusMap :: Map String String
orderStatusMap = Map.fromFoldable
  [ pair "NEW" "open"
  , pair "PENDING" "open"
  , pair "OPEN" "open"
  , pair "PARTIALLY_FILLED" "open"
  , pair "FILLED" "closed"
  , pair "DONE" "closed"
  , pair "CANCELED" "canceled"
  , pair "CANCELLED" "canceled"
  , pair "REJECTED" "rejected"
  , pair "EXPIRED" "expired"
  ]
  where
    pair a b = { fst: a, snd: b }

-- | Generate the common loadMarkets() call at start of methods
loadMarketsCall :: TSStatement
loadMarketsCall =
  TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []

-- | Generate market lookup
marketLookup :: String -> TSStatement
marketLookup symbolVar =
  TSConstDecl
    { name: "market"
    , constType: Nothing
    , initializer: TSCall (TSMember TSThis "market") [TSIdent symbolVar]
    }

-- | Generate request object
requestObject :: Array TSObjectProp -> TSStatement
requestObject props =
  TSConstDecl
    { name: "request"
    , constType: Just (TSRef "Dict")
    , initializer: TSObjectLit props
    }

-- | Generate API call with extend
apiCallWithExtend :: String -> String -> TSStatement
apiCallWithExtend methodName paramsVar =
  TSConstDecl
    { name: "response"
    , constType: Nothing
    , initializer: TSAwait $ TSCall
        (TSMember TSThis methodName)
        [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent paramsVar]]
    }

-- | Generate simple API call
apiCall :: String -> String -> TSStatement
apiCall methodName arg =
  TSConstDecl
    { name: "response"
    , constType: Nothing
    , initializer: TSAwait $ TSCall (TSMember TSThis methodName) [TSIdent arg]
    }
