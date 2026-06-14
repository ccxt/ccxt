-- | Code Generator for EDL to TypeScript
-- |
-- | This module transforms validated EDL documents into TypeScript AST
-- | that can be emitted as exchange implementation files.
module EDL.Generator where

import Prelude

import Data.Maybe (Maybe(..), fromMaybe, isJust)
import Data.Array as Array
import Data.Map (Map)
import Data.Map as Map
import Data.Tuple (Tuple(..))
import Data.Foldable (foldl)
import Data.String as String

import EDL.Types as EDL
import CCXT.Types

-- | Generate a complete TypeScript file from EDL document
generateExchange :: EDL.EDLDocument -> TSFile
generateExchange doc =
  { imports: generateImports doc
  , exports: generateExports doc
  , classDecl: generateClass doc
  }

-- | Generate import statements
generateImports :: EDL.EDLDocument -> Array TSImport
generateImports doc =
  [ { source: "./base/Exchange.js"
    , defaultImport: Just "Exchange"
    , namedImports: []
    , typeOnly: false
    }
  , { source: "./base/types.js"
    , defaultImport: Nothing
    , namedImports:
        [ "Market"
        , "Ticker"
        , "Order"
        , "Trade"
        , "Balances"
        , "OHLCV"
        , "OrderBook"
        , "Dict"
        , "Str"
        , "Int"
        , "Num"
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

-- | Generate export statements
generateExports :: EDL.EDLDocument -> Array TSExport
generateExports doc = [ExportDefault doc.exchange.id]

-- | Generate the exchange class
generateClass :: EDL.EDLDocument -> TSClass
generateClass doc =
  { name: doc.exchange.id
  , extends: Just "Exchange"
  , implements: []
  , properties: []
  , methods:
      [ generateDescribeMethod doc
      ] <> generateParseMethods doc
        <> generateFetchMethods doc
        <> generateTradingMethods doc
        <> [generateSignMethod doc]
  }

-- | Generate the describe() method
generateDescribeMethod :: EDL.EDLDocument -> TSMethod
generateDescribeMethod doc =
  { name: "describe"
  , async: false
  , params: []
  , returnType: Just TSAny
  , body:
      [ TSReturn $ Just $ TSCall
          (TSMember TSThis "deepExtend")
          [ TSCall (TSMember TSSuper "describe") []
          , generateDescribeObject doc
          ]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate the describe object literal
generateDescribeObject :: EDL.EDLDocument -> TSExpr
generateDescribeObject doc = TSObjectLit
  [ PropValue "id" (TSLit $ LitString doc.exchange.id)
  , PropValue "name" (TSLit $ LitString doc.exchange.name)
  , PropValue "countries" (TSArrayLit $ map (TSLit <<< LitString) doc.exchange.countries)
  , PropValue "version" (TSLit $ LitString doc.exchange.version)
  , PropValue "rateLimit" (TSLit $ LitNumber $ toNumber doc.exchange.rateLimit)
  , PropValue "certified" (TSLit $ LitBoolean doc.exchange.certified)
  , PropValue "pro" (TSLit $ LitBoolean doc.exchange.pro)
  , PropValue "has" (generateHasObject doc.has)
  , PropValue "timeframes" (generateTimeframesObject doc.timeframes)
  , PropValue "urls" (generateUrlsObject doc.urls)
  , PropValue "api" (generateAPIObject doc.api)
  , PropValue "requiredCredentials" (generateCredentialsObject doc.requiredCredentials)
  ] <> generateFeesProperty doc.fees
    <> generateLimitsProperty doc.limits
    <> generatePrecisionProperty doc.precision
    <> generateOptionsProperty doc.options

-- | Generate has object
generateHasObject :: EDL.Capabilities -> TSExpr
generateHasObject caps = TSObjectLit $
  map capabilityProp (Map.toUnfoldable caps :: Array (Tuple String (Maybe Boolean)))
  where
    capabilityProp (Tuple name value) = PropValue name $ case value of
      Just true -> TSLit $ LitBoolean true
      Just false -> TSLit $ LitBoolean false
      Nothing -> TSLit LitNull

-- | Generate timeframes object
generateTimeframesObject :: Maybe EDL.TimeframeMap -> TSExpr
generateTimeframesObject Nothing = TSLit LitUndefined
generateTimeframesObject (Just tf) = TSObjectLit $
  map tfProp (Map.toUnfoldable tf :: Array (Tuple String String))
  where
    tfProp (Tuple key value) = PropValue key (TSLit $ LitString value)

-- | Generate URLs object
generateUrlsObject :: EDL.URLConfig -> TSExpr
generateUrlsObject urls = TSObjectLit
  [ PropValue "logo" (maybe (TSLit LitUndefined) (TSLit <<< LitString) urls.logo)
  , PropValue "api" (generateAPIUrlsObject urls.api)
  , PropValue "test" (maybe (TSLit LitUndefined) generateAPIUrlsObject urls.test)
  , PropValue "www" (TSLit $ LitString urls.www)
  , PropValue "doc" (TSArrayLit $ map (TSLit <<< LitString) urls.doc)
  ] <> maybe [] (\f -> [PropValue "fees" (TSLit $ LitString f)]) urls.fees

generateAPIUrlsObject :: EDL.APIUrls -> TSExpr
generateAPIUrlsObject apiUrls = TSObjectLit $
  map urlProp (Map.toUnfoldable apiUrls :: Array (Tuple String String))
  where
    urlProp (Tuple key value) = PropValue key (TSLit $ LitString value)

-- | Generate API structure object
generateAPIObject :: EDL.APIDefinition -> TSExpr
generateAPIObject api = TSObjectLit
  [ PropValue "public" (generateAPICategoryObject api.public)
  , PropValue "private" (generateAPICategoryObject api.private)
  ]

generateAPICategoryObject :: Map String (Map EDL.HTTPMethod (Array EDL.EndpointDef)) -> TSExpr
generateAPICategoryObject category = TSObjectLit $
  Array.concatMap generateMethodGroup (Map.toUnfoldable category :: Array _)
  where
    generateMethodGroup (Tuple method endpoints) =
      [PropValue (String.toLower method) (generateEndpointsObject endpoints)]

generateEndpointsObject :: Map EDL.HTTPMethod (Array EDL.EndpointDef) -> TSExpr
generateEndpointsObject endpoints = TSObjectLit $
  Array.concatMap generateEndpoint (Array.concat $ Map.values endpoints)
  where
    generateEndpoint ep = [PropValue ep.path (generateEndpointCost ep)]

generateEndpointCost :: EDL.EndpointDef -> TSExpr
generateEndpointCost ep = case ep.costByLimit of
  Nothing -> TSLit $ LitNumber ep.cost
  Just byLimit -> TSObjectLit
    [ PropValue "cost" (TSLit $ LitNumber ep.cost)
    , PropValue "byLimit" (TSArrayLit $ map generateLimitCost byLimit)
    ]
  where
    generateLimitCost (Tuple limit cost) =
      TSArrayLit [TSLit $ LitNumber (toNumber limit), TSLit $ LitNumber cost]

-- | Generate required credentials object
generateCredentialsObject :: EDL.RequiredCredentials -> TSExpr
generateCredentialsObject creds = TSObjectLit
  [ PropValue "apiKey" (TSLit $ LitBoolean creds.apiKey)
  , PropValue "secret" (TSLit $ LitBoolean creds.secret)
  , PropValue "uid" (TSLit $ LitBoolean creds.uid)
  , PropValue "login" (TSLit $ LitBoolean creds.login)
  , PropValue "password" (TSLit $ LitBoolean creds.password)
  , PropValue "twofa" (TSLit $ LitBoolean creds.twofa)
  , PropValue "privateKey" (TSLit $ LitBoolean creds.privateKey)
  , PropValue "walletAddress" (TSLit $ LitBoolean creds.walletAddress)
  , PropValue "token" (TSLit $ LitBoolean creds.token)
  ]

-- | Generate fees property if present
generateFeesProperty :: Maybe EDL.FeeConfig -> Array TSObjectProp
generateFeesProperty Nothing = []
generateFeesProperty (Just fees) =
  [ PropValue "fees" $ TSObjectLit
      [ PropValue "trading" $ TSObjectLit
          [ PropValue "tierBased" (TSLit $ LitBoolean fees.trading.tierBased)
          , PropValue "percentage" (TSLit $ LitBoolean fees.trading.percentage)
          , PropValue "taker" (TSLit $ LitNumber fees.trading.taker)
          , PropValue "maker" (TSLit $ LitNumber fees.trading.maker)
          ]
      ]
  ]

-- | Generate limits property if present
generateLimitsProperty :: Maybe EDL.LimitsConfig -> Array TSObjectProp
generateLimitsProperty Nothing = []
generateLimitsProperty (Just limits) =
  [ PropValue "limits" $ TSObjectLit $
      generateMinMaxProp "amount" limits.amount <>
      generateMinMaxProp "price" limits.price <>
      generateMinMaxProp "cost" limits.cost <>
      generateMinMaxProp "leverage" limits.leverage
  ]
  where
    generateMinMaxProp name Nothing = []
    generateMinMaxProp name (Just mm) =
      [ PropValue name $ TSObjectLit
          [ PropValue "min" (maybe (TSLit LitNull) (TSLit <<< LitNumber) mm.min)
          , PropValue "max" (maybe (TSLit LitNull) (TSLit <<< LitNumber) mm.max)
          ]
      ]

-- | Generate precision property if present
generatePrecisionProperty :: Maybe EDL.PrecisionConfig -> Array TSObjectProp
generatePrecisionProperty Nothing = []
generatePrecisionProperty (Just prec) =
  [ PropValue "precisionMode" (TSIdent "TICK_SIZE")
  , PropValue "precision" $ TSObjectLit $
      maybe [] (\a -> [PropValue "amount" (TSLit $ LitNumber $ toNumber a)]) prec.amount <>
      maybe [] (\p -> [PropValue "price" (TSLit $ LitNumber $ toNumber p)]) prec.price
  ]

-- | Generate options property
generateOptionsProperty :: Map String String -> Array TSObjectProp
generateOptionsProperty opts
  | Map.isEmpty opts = []
  | otherwise = [PropValue "options" $ TSObjectLit $
      map optProp (Map.toUnfoldable opts :: Array (Tuple String String))]
  where
    optProp (Tuple key value) = PropValue key (TSLit $ LitString value)

-- | Generate parser methods
generateParseMethods :: EDL.EDLDocument -> Array TSMethod
generateParseMethods doc =
  Array.mapMaybe generateParserMethod (Map.toUnfoldable doc.parsers :: Array _)

generateParserMethod :: Tuple String EDL.ParserDef -> Maybe TSMethod
generateParserMethod (Tuple name parser) = case name of
  "ticker" -> Just $ generateParseTickerMethod parser
  "order" -> Just $ generateParseOrderMethod parser
  "trade" -> Just $ generateParseTradeMethod parser
  "balance" -> Just $ generateParseBalanceMethod parser
  "market" -> Just $ generateParseMarketMethod parser
  _ -> Nothing

-- | Generate parseTicker method
generateParseTickerMethod :: EDL.ParserDef -> TSMethod
generateParseTickerMethod parser =
  { name: "parseTicker"
  , async: false
  , params:
      [ { name: "ticker", paramType: Just (TSRef "Dict"), defaultValue: Nothing, optional: false, rest: false }
      , { name: "market", paramType: Just (TSNullable (TSRef "Market")), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      ]
  , returnType: Just (TSRef "Ticker")
  , body: generateParseMethodBody parser "ticker"
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate parseOrder method
generateParseOrderMethod :: EDL.ParserDef -> TSMethod
generateParseOrderMethod parser =
  { name: "parseOrder"
  , async: false
  , params:
      [ { name: "order", paramType: Just (TSRef "Dict"), defaultValue: Nothing, optional: false, rest: false }
      , { name: "market", paramType: Just (TSNullable (TSRef "Market")), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      ]
  , returnType: Just (TSRef "Order")
  , body: generateParseMethodBody parser "order"
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate parseTrade method
generateParseTradeMethod :: EDL.ParserDef -> TSMethod
generateParseTradeMethod parser =
  { name: "parseTrade"
  , async: false
  , params:
      [ { name: "trade", paramType: Just (TSRef "Dict"), defaultValue: Nothing, optional: false, rest: false }
      , { name: "market", paramType: Just (TSNullable (TSRef "Market")), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      ]
  , returnType: Just (TSRef "Trade")
  , body: generateParseMethodBody parser "trade"
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate parseBalance method (returns object, not single balance)
generateParseBalanceMethod :: EDL.ParserDef -> TSMethod
generateParseBalanceMethod parser =
  { name: "parseBalance"
  , async: false
  , params:
      [ { name: "response", paramType: Just (TSRef "Dict"), defaultValue: Nothing, optional: false, rest: false }
      ]
  , returnType: Just (TSRef "Balances")
  , body: generateBalanceMethodBody parser
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate parseMarket method
generateParseMarketMethod :: EDL.ParserDef -> TSMethod
generateParseMarketMethod parser =
  { name: "parseMarket"
  , async: false
  , params:
      [ { name: "market", paramType: Just (TSRef "Dict"), defaultValue: Nothing, optional: false, rest: false }
      ]
  , returnType: Just (TSRef "Market")
  , body: generateParseMethodBody parser "market"
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate the body of a parse method
generateParseMethodBody :: EDL.ParserDef -> String -> Array TSStatement
generateParseMethodBody parser paramName =
  let
    -- Extract data from path if specified
    dataAccess = case parser.path of
      Nothing -> TSIdent paramName
      Just path -> generateSafeAccess (TSIdent paramName) path

    -- Generate field extractions
    fieldStmts = Array.concatMap (generateFieldExtraction paramName) parser.mapping

    -- Generate return statement with safeTicker/safeOrder/etc
    safeMethodName = "safe" <> capitalize paramName
    returnExpr = TSCall
      (TSMember TSThis safeMethodName)
      [ TSObjectLit $ map fieldToObjectProp parser.mapping
      , TSIdent "market"
      ]
  in
    fieldStmts <> [TSReturn $ Just returnExpr]

-- | Generate balance method body (different structure)
generateBalanceMethodBody :: EDL.ParserDef -> Array TSStatement
generateBalanceMethodBody parser =
  [ TSConstDecl
      { name: "result"
      , constType: Just (TSRef "Dict")
      , initializer: TSObjectLit [PropValue "info" (TSIdent "response")]
      }
  , TSConstDecl
      { name: "balances"
      , constType: Nothing
      , initializer: generateSafeAccess (TSIdent "response") (fromMaybe "balances" parser.path)
      }
  , TSFor
      { init: Just $ TSLetDecl { name: "i", letType: Nothing, initializer: Just (TSLit $ LitNumber 0.0) }
      , test: Just $ TSBinary OpLt (TSIdent "i") (TSMember (TSIdent "balances") "length")
      , update: Just $ TSUnary OpPostInc (TSIdent "i")
      , body:
          [ TSConstDecl
              { name: "balance"
              , constType: Nothing
              , initializer: TSIndex (TSIdent "balances") (TSIdent "i")
              }
          , TSConstDecl
              { name: "currencyId"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "safeString") [TSIdent "balance", TSLit $ LitString "asset"]
              }
          , TSConstDecl
              { name: "code"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "safeCurrencyCode") [TSIdent "currencyId"]
              }
          , TSConstDecl
              { name: "account"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "account") []
              }
          , TSExprStmt $ TSAssign
              (TSIndex (TSIdent "account") (TSLit $ LitString "free"))
              (TSCall (TSMember TSThis "safeString") [TSIdent "balance", TSLit $ LitString "free"])
          , TSExprStmt $ TSAssign
              (TSIndex (TSIdent "account") (TSLit $ LitString "used"))
              (TSCall (TSMember TSThis "safeString") [TSIdent "balance", TSLit $ LitString "locked"])
          , TSExprStmt $ TSAssign
              (TSIndex (TSIdent "result") (TSIdent "code"))
              (TSIdent "account")
          ]
      }
  , TSReturn $ Just $ TSCall (TSMember TSThis "safeBalance") [TSIdent "result"]
  ]

-- | Generate field extraction statement
generateFieldExtraction :: String -> EDL.FieldMapping -> Array TSStatement
generateFieldExtraction paramName fm = case fm.mapping of
  EDL.PathMapping config ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: applyTransform config.transform $
            generateSafeAccess (TSIdent paramName) config.path
        }
    ]
  EDL.ComputeMapping config ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: parseComputeExpression config.expression
        }
    ]
  EDL.MapMapping config ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: TSCall
            (TSMember TSThis "safeStringLower")
            [ TSIdent paramName
            , TSLit $ LitString config.path
            ]
        }
    ]
  EDL.ContextMapping key ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: TSIdent key
        }
    ]
  EDL.LiteralMapping value ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: if value == "undefined" then TSLit LitUndefined else TSLit (LitString value)
        }
    ]
  EDL.NullMapping ->
    [ TSConstDecl
        { name: fm.targetField
        , constType: Nothing
        , initializer: TSLit LitUndefined
        }
    ]

-- | Convert field mapping to object property for return statement
fieldToObjectProp :: EDL.FieldMapping -> TSObjectProp
fieldToObjectProp fm = PropShorthand fm.targetField

-- | Apply transform to expression
applyTransform :: Maybe EDL.Transform -> TSExpr -> TSExpr
applyTransform Nothing expr = expr
applyTransform (Just transform) expr = case transform of
  EDL.ParseNumber ->
    TSCall (TSMember TSThis "safeNumber") [expr]
  EDL.ParseString ->
    TSCall (TSMember TSThis "safeString") [expr]
  EDL.ParseBoolean ->
    TSCall (TSMember TSThis "safeBool") [expr]
  EDL.ParseTimestamp ->
    TSCall (TSMember TSThis "safeInteger") [expr]
  EDL.ParseTimestampMS ->
    TSCall (TSMember TSThis "safeInteger") [expr]
  EDL.ParseCurrencyCode ->
    TSCall (TSMember TSThis "safeCurrencyCode") [expr]
  EDL.ParseSymbol ->
    TSCall (TSMember TSThis "safeSymbol") [expr]
  EDL.ParseMarketId ->
    TSCall (TSMember TSThis "safeString") [expr]
  EDL.ParseOrderStatus ->
    TSCall (TSMember TSThis "parseOrderStatus")
      [TSCall (TSMember TSThis "safeString") [expr]]
  EDL.ParseOrderType ->
    TSCall (TSMember TSThis "safeStringLower") [expr]
  EDL.ParseOrderSide ->
    TSCall (TSMember TSThis "safeStringLower") [expr]
  EDL.OmitZero ->
    TSCall (TSMember TSThis "omitZero") [expr]
  EDL.ToLowercase ->
    TSCall (TSMember expr "toLowerCase") []
  EDL.ToUppercase ->
    TSCall (TSMember expr "toUpperCase") []
  EDL.Multiply n ->
    TSBinary OpMul expr (TSLit $ LitNumber n)
  EDL.Divide n ->
    TSBinary OpDiv expr (TSLit $ LitNumber n)
  EDL.CustomTransform name ->
    TSCall (TSMember TSThis name) [expr]
  EDL.ChainedTransform transforms ->
    foldl (\e t -> applyTransform (Just t) e) expr transforms

-- | Generate safe property access
generateSafeAccess :: TSExpr -> String -> TSExpr
generateSafeAccess obj path =
  let parts = String.split (String.Pattern ".") path
  in foldl (\e p -> TSCall (TSMember TSThis "safeValue") [e, TSLit $ LitString p]) obj parts

-- | Parse compute expression into TSExpr
parseComputeExpression :: String -> TSExpr
parseComputeExpression expr =
  -- Simplified - in real implementation would parse the expression properly
  TSIdent expr

-- | Generate fetch methods
generateFetchMethods :: EDL.EDLDocument -> Array TSMethod
generateFetchMethods doc =
  Array.catMaybes
    [ if hasCapability doc.has "fetchTicker"
      then Just $ generateFetchTickerMethod doc
      else Nothing
    , if hasCapability doc.has "fetchTickers"
      then Just $ generateFetchTickersMethod doc
      else Nothing
    , if hasCapability doc.has "fetchOrderBook"
      then Just $ generateFetchOrderBookMethod doc
      else Nothing
    , if hasCapability doc.has "fetchTrades"
      then Just $ generateFetchTradesMethod doc
      else Nothing
    , if hasCapability doc.has "fetchOHLCV"
      then Just $ generateFetchOHLCVMethod doc
      else Nothing
    , if hasCapability doc.has "fetchBalance"
      then Just $ generateFetchBalanceMethod doc
      else Nothing
    ]

-- | Generate fetchTicker method
generateFetchTickerMethod :: EDL.EDLDocument -> TSMethod
generateFetchTickerMethod doc =
  { name: "fetchTicker"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Ticker"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "market"
          , constType: Nothing
          , initializer: TSCall (TSMember TSThis "market") [TSIdent "symbol"]
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [PropValue "symbol" (TSMember (TSIdent "market") "id")]
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "publicGetTicker24hr")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseTicker")
          [TSIdent "response", TSIdent "market"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate fetchTickers method
generateFetchTickersMethod :: EDL.EDLDocument -> TSMethod
generateFetchTickersMethod doc =
  { name: "fetchTickers"
  , async: true
  , params:
      [ { name: "symbols", paramType: Just (TSNullable (TSArray TSString)), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Tickers"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall (TSMember TSThis "publicGetTicker24hr") [TSIdent "params"]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseTickers")
          [TSIdent "response", TSIdent "symbols"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate fetchOrderBook method
generateFetchOrderBookMethod :: EDL.EDLDocument -> TSMethod
generateFetchOrderBookMethod doc =
  { name: "fetchOrderBook"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "limit", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "OrderBook"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "market"
          , constType: Nothing
          , initializer: TSCall (TSMember TSThis "market") [TSIdent "symbol"]
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [PropValue "symbol" (TSMember (TSIdent "market") "id")]
          }
      , TSIf
          { condition: TSBinary OpStrictNeq (TSIdent "limit") (TSLit LitUndefined)
          , thenBranch:
              [TSExprStmt $ TSAssign
                (TSIndex (TSIdent "request") (TSLit $ LitString "limit"))
                (TSIdent "limit")
              ]
          , elseBranch: Nothing
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "publicGetDepth")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseOrderBook")
          [ TSIdent "response"
          , TSMember (TSIdent "market") "symbol"
          ]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate fetchTrades method
generateFetchTradesMethod :: EDL.EDLDocument -> TSMethod
generateFetchTradesMethod doc =
  { name: "fetchTrades"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "since", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "limit", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSArray (TSRef "Trade")))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "market"
          , constType: Nothing
          , initializer: TSCall (TSMember TSThis "market") [TSIdent "symbol"]
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [PropValue "symbol" (TSMember (TSIdent "market") "id")]
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "publicGetTrades")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseTrades")
          [TSIdent "response", TSIdent "market", TSIdent "since", TSIdent "limit"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate fetchOHLCV method
generateFetchOHLCVMethod :: EDL.EDLDocument -> TSMethod
generateFetchOHLCVMethod doc =
  { name: "fetchOHLCV"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "timeframe", paramType: Just TSString, defaultValue: Just (TSLit $ LitString "1m"), optional: true, rest: false }
      , { name: "since", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "limit", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSArray (TSRef "OHLCV")))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "market"
          , constType: Nothing
          , initializer: TSCall (TSMember TSThis "market") [TSIdent "symbol"]
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [ PropValue "symbol" (TSMember (TSIdent "market") "id")
              , PropValue "interval" (TSIndex (TSMember TSThis "timeframes") (TSIdent "timeframe"))
              ]
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "publicGetKlines")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseOHLCVs")
          [TSIdent "response", TSIdent "market", TSIdent "timeframe", TSIdent "since", TSIdent "limit"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate fetchBalance method
generateFetchBalanceMethod :: EDL.EDLDocument -> TSMethod
generateFetchBalanceMethod doc =
  { name: "fetchBalance"
  , async: true
  , params:
      [ { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Balances"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall (TSMember TSThis "privateGetAccount") [TSIdent "params"]
          }
      , TSReturn $ Just $ TSCall (TSMember TSThis "parseBalance") [TSIdent "response"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate trading methods
generateTradingMethods :: EDL.EDLDocument -> Array TSMethod
generateTradingMethods doc =
  Array.catMaybes
    [ if hasCapability doc.has "createOrder"
      then Just $ generateCreateOrderMethod doc
      else Nothing
    , if hasCapability doc.has "cancelOrder"
      then Just $ generateCancelOrderMethod doc
      else Nothing
    ]

-- | Generate createOrder method
generateCreateOrderMethod :: EDL.EDLDocument -> TSMethod
generateCreateOrderMethod doc =
  { name: "createOrder"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "type", paramType: Just (TSRef "OrderType"), defaultValue: Nothing, optional: false, rest: false }
      , { name: "side", paramType: Just (TSRef "OrderSide"), defaultValue: Nothing, optional: false, rest: false }
      , { name: "amount", paramType: Just TSNumber, defaultValue: Nothing, optional: false, rest: false }
      , { name: "price", paramType: Just (TSNullable TSNumber), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Order"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSConstDecl
          { name: "market"
          , constType: Nothing
          , initializer: TSCall (TSMember TSThis "market") [TSIdent "symbol"]
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [ PropValue "symbol" (TSMember (TSIdent "market") "id")
              , PropValue "side" (TSCall (TSMember (TSIdent "side") "toUpperCase") [])
              , PropValue "type" (TSCall (TSMember (TSIdent "type") "toUpperCase") [])
              , PropValue "quantity" (TSCall (TSMember TSThis "amountToPrecision") [TSIdent "symbol", TSIdent "amount"])
              ]
          }
      , TSIf
          { condition: TSBinary OpStrictNeq (TSIdent "price") (TSLit LitUndefined)
          , thenBranch:
              [TSExprStmt $ TSAssign
                (TSIndex (TSIdent "request") (TSLit $ LitString "price"))
                (TSCall (TSMember TSThis "priceToPrecision") [TSIdent "symbol", TSIdent "price"])
              ]
          , elseBranch: Nothing
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "privatePostOrder")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseOrder")
          [TSIdent "response", TSIdent "market"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate cancelOrder method
generateCancelOrderMethod :: EDL.EDLDocument -> TSMethod
generateCancelOrderMethod doc =
  { name: "cancelOrder"
  , async: true
  , params:
      [ { name: "id", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "symbol", paramType: Just (TSNullable TSString), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Order"))
  , body:
      [ TSExprStmt $ TSAwait $ TSCall (TSMember TSThis "loadMarkets") []
      , TSLetDecl
          { name: "market"
          , letType: Nothing
          , initializer: Just (TSLit LitUndefined)
          }
      , TSIf
          { condition: TSBinary OpStrictNeq (TSIdent "symbol") (TSLit LitUndefined)
          , thenBranch:
              [TSExprStmt $ TSAssign (TSIdent "market")
                (TSCall (TSMember TSThis "market") [TSIdent "symbol"])
              ]
          , elseBranch: Nothing
          }
      , TSConstDecl
          { name: "request"
          , constType: Just (TSRef "Dict")
          , initializer: TSObjectLit
              [ PropValue "orderId" (TSIdent "id")
              ]
          }
      , TSIf
          { condition: TSBinary OpStrictNeq (TSIdent "market") (TSLit LitUndefined)
          , thenBranch:
              [TSExprStmt $ TSAssign
                (TSIndex (TSIdent "request") (TSLit $ LitString "symbol"))
                (TSMember (TSIdent "market") "id")
              ]
          , elseBranch: Nothing
          }
      , TSConstDecl
          { name: "response"
          , constType: Nothing
          , initializer: TSAwait $ TSCall
              (TSMember TSThis "privateDeleteOrder")
              [TSCall (TSMember TSThis "extend") [TSIdent "request", TSIdent "params"]]
          }
      , TSReturn $ Just $ TSCall
          (TSMember TSThis "parseOrder")
          [TSIdent "response", TSIdent "market"]
      ]
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate sign method
generateSignMethod :: EDL.EDLDocument -> TSMethod
generateSignMethod doc =
  { name: "sign"
  , async: false
  , params:
      [ { name: "path", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "api", paramType: Just TSString, defaultValue: Just (TSLit $ LitString "public"), optional: true, rest: false }
      , { name: "method", paramType: Just TSString, defaultValue: Just (TSLit $ LitString "GET"), optional: true, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      , { name: "headers", paramType: Just (TSNullable (TSObject Nothing)), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      , { name: "body", paramType: Just (TSNullable TSString), defaultValue: Just (TSLit LitUndefined), optional: true, rest: false }
      ]
  , returnType: Just (TSObject $ Just
      [ { name: "url", memberType: TSString, optional: false, readonly: false }
      , { name: "method", memberType: TSString, optional: false, readonly: false }
      , { name: "body", memberType: TSNullable TSString, optional: true, readonly: false }
      , { name: "headers", memberType: TSNullable (TSObject Nothing), optional: true, readonly: false }
      ])
  , body: generateSignMethodBody doc.auth doc
  , visibility: Nothing
  , static: false
  , override: false
  }

-- | Generate sign method body based on auth type
generateSignMethodBody :: EDL.AuthMethod -> EDL.EDLDocument -> Array TSStatement
generateSignMethodBody (EDL.HMACAuth config) doc =
  [ TSLetDecl
      { name: "url"
      , letType: Nothing
      , initializer: Just $ TSBinary OpAdd
          (TSIndex (TSIndex (TSMember TSThis "urls") (TSLit $ LitString "api")) (TSIdent "api"))
          (TSBinary OpAdd (TSLit $ LitString "/") (TSIdent "path"))
      }
  , TSIf
      { condition: TSBinary OpStrictEq (TSIdent "api") (TSLit $ LitString "private")
      , thenBranch:
          [ TSExprStmt $ TSCall (TSMember TSThis "checkRequiredCredentials") []
          , TSConstDecl
              { name: "timestamp"
              , constType: Nothing
              , initializer: TSCall (TSMember (TSCall (TSMember TSThis "nonce") []) "toString") []
              }
          , TSConstDecl
              { name: "extendedParams"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "extend")
                  [ TSObjectLit [PropValue "timestamp" (TSIdent "timestamp")]
                  , TSIdent "params"
                  ]
              }
          , TSConstDecl
              { name: "query"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "urlencode") [TSIdent "extendedParams"]
              }
          , TSConstDecl
              { name: "signature"
              , constType: Nothing
              , initializer: TSCall (TSMember TSThis "hmac")
                  [ TSCall (TSMember TSThis "encode") [TSIdent "query"]
                  , TSCall (TSMember TSThis "encode") [TSMember TSThis "secret"]
                  , TSIdent $ show config.algorithm
                  ]
              }
          , TSExprStmt $ TSAssign (TSIdent "headers") $ TSObjectLit
              [ PropValue "X-MBX-APIKEY" (TSMember TSThis "apiKey")
              ]
          , TSIf
              { condition: TSBinary OpOr
                  (TSBinary OpStrictEq (TSIdent "method") (TSLit $ LitString "GET"))
                  (TSBinary OpStrictEq (TSIdent "method") (TSLit $ LitString "DELETE"))
              , thenBranch:
                  [TSExprStmt $ TSCompoundAssign OpAddAssign (TSIdent "url")
                    (TSBinary OpAdd (TSLit $ LitString "?")
                      (TSBinary OpAdd (TSIdent "query")
                        (TSBinary OpAdd (TSLit $ LitString "&signature=") (TSIdent "signature"))
                      )
                    )
                  ]
              , elseBranch: Just
                  [ TSExprStmt $ TSAssign (TSIdent "body")
                      (TSBinary OpAdd (TSIdent "query")
                        (TSBinary OpAdd (TSLit $ LitString "&signature=") (TSIdent "signature"))
                      )
                  , TSExprStmt $ TSAssign
                      (TSIndex (TSIdent "headers") (TSLit $ LitString "Content-Type"))
                      (TSLit $ LitString "application/x-www-form-urlencoded")
                  ]
              }
          ]
      , elseBranch: Just
          [ TSIf
              { condition: TSCall (TSMember (TSIdent "Object") "keys") [TSIdent "params"]
              , thenBranch:
                  [TSExprStmt $ TSCompoundAssign OpAddAssign (TSIdent "url")
                    (TSBinary OpAdd (TSLit $ LitString "?")
                      (TSCall (TSMember TSThis "urlencode") [TSIdent "params"])
                    )
                  ]
              , elseBranch: Nothing
              }
          ]
      }
  , TSReturn $ Just $ TSObjectLit
      [ PropShorthand "url"
      , PropShorthand "method"
      , PropShorthand "body"
      , PropShorthand "headers"
      ]
  ]
generateSignMethodBody _ _ =
  -- Default implementation for other auth types
  [ TSReturn $ Just $ TSObjectLit
      [ PropValue "url" (TSBinary OpAdd (TSLit $ LitString "") (TSIdent "path"))
      , PropShorthand "method"
      , PropShorthand "body"
      , PropShorthand "headers"
      ]
  ]

-- | Helper functions
hasCapability :: EDL.Capabilities -> String -> Boolean
hasCapability caps name = case Map.lookup name caps of
  Just (Just true) -> true
  _ -> false

toNumber :: Int -> Number
toNumber i = i # \n -> unsafeCoerce n

capitalize :: String -> String
capitalize s = case String.uncons s of
  Nothing -> ""
  Just { head, tail } -> String.toUpper (String.singleton head) <> tail

maybe :: forall a b. b -> (a -> b) -> Maybe a -> b
maybe def f Nothing = def
maybe def f (Just a) = f a

-- FFI
foreign import unsafeCoerce :: forall a b. a -> b
