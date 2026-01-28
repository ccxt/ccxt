-- | YAML Parser for EDL Documents
-- |
-- | This module provides parsing functionality to convert EDL YAML files
-- | into the strongly-typed EDL ADTs defined in EDL.Types.
module EDL.Parser where

import Prelude

import Data.Maybe (Maybe(..), fromMaybe)
import Data.Either (Either(..), note)
import Data.Array as Array
import Data.Map (Map)
import Data.Map as Map
import Data.Tuple (Tuple(..))
import Data.Traversable (traverse)
import Data.Foldable (foldl)
import Data.String as String
import Data.Int as Int
import Data.Number as Number
import Control.Monad.Except (runExcept, ExceptT, throwError, catchError)
import Effect (Effect)
import Effect.Aff (Aff)
import Foreign (Foreign, readString, readBoolean, readInt, readNumber, readArray)
import Foreign.Object (Object)
import Foreign.Object as FO

import EDL.Types

-- | Parse result with potential errors
type ParseResult a = Either (Array ParseError) a

-- | Parser context for tracking location
type ParseContext =
  { path :: Array String
  , line :: Maybe Int
  }

emptyContext :: ParseContext
emptyContext = { path: [], line: Nothing }

pushPath :: String -> ParseContext -> ParseContext
pushPath segment ctx = ctx { path = Array.snoc ctx.path segment }

-- | Create a parse error with context
makeError :: ParseContext -> String -> ParseError
makeError ctx msg =
  { message: msg
  , line: ctx.line
  , column: Nothing
  , path: ctx.path
  }

-- | Parse a complete EDL document from YAML object
parseEDLDocument :: Foreign -> ParseResult EDLDocument
parseEDLDocument yaml = do
  obj <- expectObject emptyContext yaml

  -- Parse required sections
  exchange <- parseExchangeSection (pushPath "exchange" emptyContext) =<< getField emptyContext "exchange" obj
  urls <- parseURLSection (pushPath "urls" emptyContext) =<< getField emptyContext "urls" obj
  has <- parseCapabilities (pushPath "has" emptyContext) =<< getField emptyContext "has" obj
  auth <- parseAuthSection (pushPath "auth" emptyContext) =<< getField emptyContext "auth" obj
  api <- parseAPISection (pushPath "api" emptyContext) =<< getField emptyContext "api" obj
  parsers <- parseParsersSection (pushPath "parsers" emptyContext) =<< getOptionalField emptyContext "parsers" obj
  errors <- parseErrorsSection (pushPath "errors" emptyContext) =<< getOptionalField emptyContext "errors" obj

  -- Parse optional sections
  timeframes <- traverse (parseTimeframes (pushPath "timeframes" emptyContext)) =<< getOptionalField emptyContext "timeframes" obj
  fees <- traverse (parseFeesSection (pushPath "fees" emptyContext)) =<< getOptionalField emptyContext "fees" obj
  limits <- traverse (parseLimitsSection (pushPath "limits" emptyContext)) =<< getOptionalField emptyContext "limits" obj
  precision <- traverse (parsePrecisionSection (pushPath "precision" emptyContext)) =<< getOptionalField emptyContext "precision" obj
  options <- parseOptionsSection (pushPath "options" emptyContext) =<< getOptionalField emptyContext "options" obj
  overrides <- parseOverridesSection (pushPath "overrides" emptyContext) =<< getOptionalField emptyContext "overrides" obj
  requiredCreds <- parseRequiredCredentials (pushPath "requiredCredentials" emptyContext) =<< getOptionalField emptyContext "requiredCredentials" obj

  pure
    { exchange
    , urls
    , has
    , timeframes
    , requiredCredentials: fromMaybe defaultRequiredCredentials requiredCreds
    , auth
    , api
    , parsers
    , errors
    , fees
    , limits
    , precision
    , options
    , overrides
    }

-- | Parse exchange metadata section
parseExchangeSection :: ParseContext -> Foreign -> ParseResult ExchangeMetadata
parseExchangeSection ctx yaml = do
  obj <- expectObject ctx yaml
  id <- getString ctx "id" obj
  name <- getString ctx "name" obj
  countries <- getStringArray ctx "countries" obj
  version <- getStringWithDefault ctx "version" "" obj
  rateLimit <- getIntWithDefault ctx "rateLimit" 1000 obj
  certified <- getBoolWithDefault ctx "certified" false obj
  pro <- getBoolWithDefault ctx "pro" false obj
  alias <- getBoolWithDefault ctx "alias" false obj
  dex <- getBoolWithDefault ctx "dex" false obj

  pure { id, name, countries, version, rateLimit, certified, pro, alias, dex }

-- | Parse URL configuration
parseURLSection :: ParseContext -> Foreign -> ParseResult URLConfig
parseURLSection ctx yaml = do
  obj <- expectObject ctx yaml
  logo <- getOptionalString ctx "logo" obj
  api <- parseAPIUrls (pushPath "api" ctx) =<< getField ctx "api" obj
  test <- traverse (parseAPIUrls (pushPath "test" ctx)) =<< getOptionalField ctx "test" obj
  www <- getString ctx "www" obj
  doc <- getStringArray ctx "doc" obj
  fees <- getOptionalString ctx "fees" obj
  referral <- getOptionalString ctx "referral" obj

  pure { logo, api, test, www, doc, fees, referral }

-- | Parse API URLs (handles both string and object formats)
parseAPIUrls :: ParseContext -> Foreign -> ParseResult APIUrls
parseAPIUrls ctx yaml = do
  -- Try parsing as object first, then as single string
  case expectObject ctx yaml of
    Right obj -> do
      -- Convert object entries to Map
      let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
      parsedEntries <- traverse parseEntry entries
      pure $ Map.fromFoldable parsedEntries
    Left _ -> do
      -- Try as single string (assume "public" endpoint)
      str <- expectString ctx yaml
      pure $ Map.singleton "public" str
  where
    parseEntry (Tuple key val) = do
      strVal <- expectString (pushPath key ctx) val
      pure (Tuple key strVal)

-- | Parse capabilities ('has' section)
parseCapabilities :: ParseContext -> Foreign -> ParseResult Capabilities
parseCapabilities ctx yaml = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  parsedEntries <- traverse parseCapEntry entries
  pure $ Map.fromFoldable parsedEntries
  where
    parseCapEntry (Tuple key val) = do
      boolVal <- parseNullableBoolean (pushPath key ctx) val
      pure (Tuple key boolVal)

    parseNullableBoolean :: ParseContext -> Foreign -> ParseResult (Maybe Boolean)
    parseNullableBoolean c f =
      case runExcept (readBoolean f) of
        Right b -> Right (Just b)
        Left _ -> Right Nothing  -- null or invalid becomes Nothing

-- | Parse authentication section
parseAuthSection :: ParseContext -> Foreign -> ParseResult AuthMethod
parseAuthSection ctx yaml = do
  obj <- expectObject ctx yaml
  authType <- getString ctx "type" obj
  case String.toLower authType of
    "hmac" -> HMACAuth <$> parseHMACConfig ctx obj
    "jwt" -> JWTAuth <$> parseJWTConfig ctx obj
    "rsa" -> RSAAuth <$> parseRSAConfig ctx obj
    "eddsa" -> EdDSAAuth <$> parseEdDSAConfig ctx obj
    "apikey" -> APIKeyOnlyAuth <$> parseAPIKeyConfig ctx obj
    "custom" -> CustomAuth <$> parseCustomAuthConfig ctx obj
    _ -> Left [makeError ctx $ "Unknown auth type: " <> authType]

parseHMACConfig :: ParseContext -> Object Foreign -> ParseResult HMACConfig
parseHMACConfig ctx obj = do
  algorithm <- parseHashAlgorithm ctx =<< getStringWithDefault ctx "algorithm" "sha256" obj
  encoding <- parseEncoding ctx =<< getStringWithDefault ctx "encoding" "hex" obj
  sigComponents <- parseSignatureComponents ctx =<< getOptionalField ctx "signature" obj
  headers <- parseStringMap (pushPath "headers" ctx) =<< getOptionalField ctx "headers" obj
  bodyParams <- parseStringMap (pushPath "body" ctx) =<< getOptionalField ctx "body" obj
  queryParams <- parseStringMap (pushPath "query" ctx) =<< getOptionalField ctx "query" obj
  timestampUnit <- parseTimestampUnit ctx =<< getStringWithDefault ctx "timestampUnit" "milliseconds" obj
  nonceType <- parseNonceType ctx =<< getStringWithDefault ctx "nonceType" "timestamp" obj
  sigFormat <- getStringWithDefault ctx "signatureFormat" "" obj

  pure
    { algorithm
    , encoding
    , signatureComponents: sigComponents
    , signatureFormat: sigFormat
    , headers: fromMaybe Map.empty headers
    , bodyParams: fromMaybe Map.empty bodyParams
    , queryParams: fromMaybe Map.empty queryParams
    , timestampUnit
    , nonceType
    }

parseJWTConfig :: ParseContext -> Object Foreign -> ParseResult JWTConfig
parseJWTConfig ctx obj = do
  algorithm <- parseJWTAlgorithm ctx =<< getStringWithDefault ctx "algorithm" "ES256" obj
  keyType <- parseKeyType ctx =<< getStringWithDefault ctx "keyType" "privateKey" obj
  claims <- parseStringMap (pushPath "claims" ctx) =<< getOptionalField ctx "claims" obj
  headerFields <- parseStringMap (pushPath "headerFields" ctx) =<< getOptionalField ctx "headerFields" obj

  pure
    { algorithm
    , keyType
    , claims: fromMaybe Map.empty claims
    , headerFields: fromMaybe Map.empty headerFields
    }

parseRSAConfig :: ParseContext -> Object Foreign -> ParseResult RSAConfig
parseRSAConfig ctx obj = do
  algorithm <- parseHashAlgorithm ctx =<< getStringWithDefault ctx "algorithm" "sha256" obj
  encoding <- parseEncoding ctx =<< getStringWithDefault ctx "encoding" "base64" obj
  keyFormat <- parseKeyFormat ctx =<< getStringWithDefault ctx "keyFormat" "pem" obj
  sigComponents <- parseSignatureComponents ctx =<< getOptionalField ctx "signature" obj

  pure
    { algorithm
    , encoding
    , signatureComponents: sigComponents
    , keyFormat
    }

parseEdDSAConfig :: ParseContext -> Object Foreign -> ParseResult EdDSAConfig
parseEdDSAConfig ctx obj = do
  curve <- parseEdCurve ctx =<< getStringWithDefault ctx "curve" "ed25519" obj
  encoding <- parseEncoding ctx =<< getStringWithDefault ctx "encoding" "base64" obj
  sigComponents <- parseSignatureComponents ctx =<< getOptionalField ctx "signature" obj

  pure
    { curve
    , encoding
    , signatureComponents: sigComponents
    }

parseAPIKeyConfig :: ParseContext -> Object Foreign -> ParseResult APIKeyConfig
parseAPIKeyConfig ctx obj = do
  headerName <- getStringWithDefault ctx "headerName" "X-API-KEY" obj
  headerValue <- getStringWithDefault ctx "headerValue" "{apiKey}" obj
  pure { headerName, headerValue }

parseCustomAuthConfig :: ParseContext -> Object Foreign -> ParseResult CustomAuthConfig
parseCustomAuthConfig ctx obj = do
  description <- getStringWithDefault ctx "description" "Custom authentication" obj
  overrideFile <- getString ctx "overrideFile" obj
  pure { description, overrideFile }

-- | Parse hash algorithm
parseHashAlgorithm :: ParseContext -> String -> ParseResult HashAlgorithm
parseHashAlgorithm ctx str = case String.toLower str of
  "sha256" -> Right SHA256
  "sha384" -> Right SHA384
  "sha512" -> Right SHA512
  "md5" -> Right MD5
  "sha1" -> Right SHA1
  _ -> Left [makeError ctx $ "Unknown hash algorithm: " <> str]

-- | Parse JWT algorithm
parseJWTAlgorithm :: ParseContext -> String -> ParseResult JWTAlgorithm
parseJWTAlgorithm ctx str = case String.toUpper str of
  "ES256" -> Right ES256
  "ES384" -> Right ES384
  "ES512" -> Right ES512
  "RS256" -> Right RS256
  "RS384" -> Right RS384
  "RS512" -> Right RS512
  "HS256" -> Right HS256
  "HS384" -> Right HS384
  "HS512" -> Right HS512
  _ -> Left [makeError ctx $ "Unknown JWT algorithm: " <> str]

-- | Parse signature encoding
parseEncoding :: ParseContext -> String -> ParseResult SignatureEncoding
parseEncoding ctx str = case String.toLower str of
  "base64" -> Right Base64
  "base64url" -> Right Base64URL
  "hex" -> Right Hex
  "binary" -> Right Binary
  _ -> Left [makeError ctx $ "Unknown encoding: " <> str]

-- | Parse timestamp unit
parseTimestampUnit :: ParseContext -> String -> ParseResult TimestampUnit
parseTimestampUnit ctx str = case String.toLower str of
  "seconds" -> Right Seconds
  "milliseconds" -> Right Milliseconds
  "microseconds" -> Right Microseconds
  "nanoseconds" -> Right Nanoseconds
  _ -> Left [makeError ctx $ "Unknown timestamp unit: " <> str]

-- | Parse nonce type
parseNonceType :: ParseContext -> String -> ParseResult NonceType
parseNonceType ctx str = case String.toLower str of
  "timestamp" -> Right TimestampNonce
  "incrementing" -> Right IncrementingNonce
  "uuid" -> Right UUIDNonce
  _ -> Right (CustomNonce str)

-- | Parse key format
parseKeyFormat :: ParseContext -> String -> ParseResult KeyFormat
parseKeyFormat ctx str = case String.toLower str of
  "pem" -> Right PEM
  "der" -> Right DER
  "jwk" -> Right JWK
  _ -> Left [makeError ctx $ "Unknown key format: " <> str]

-- | Parse Ed curve
parseEdCurve :: ParseContext -> String -> ParseResult EdCurve
parseEdCurve ctx str = case String.toLower str of
  "ed25519" -> Right Ed25519
  "ed448" -> Right Ed448
  _ -> Left [makeError ctx $ "Unknown Ed curve: " <> str]

-- | Parse key type
parseKeyType :: ParseContext -> String -> ParseResult KeyType
parseKeyType ctx str = case String.toLower str of
  "secret" -> Right SecretKey
  "secretkey" -> Right SecretKey
  "private" -> Right PrivateKey
  "privatekey" -> Right PrivateKey
  "cloud" -> Right CloudAPIKey
  "cloudapikey" -> Right CloudAPIKey
  _ -> Left [makeError ctx $ "Unknown key type: " <> str]

-- | Parse signature components from signature object
parseSignatureComponents :: ParseContext -> Maybe Foreign -> ParseResult (Array SignatureComponent)
parseSignatureComponents _ Nothing = Right []
parseSignatureComponents ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  componentStrs <- getStringArray ctx "components" obj
  traverse (parseSignatureComponent ctx) componentStrs

parseSignatureComponent :: ParseContext -> String -> ParseResult SignatureComponent
parseSignatureComponent ctx str = case String.toLower str of
  "path" -> Right PathComponent
  "method" -> Right MethodComponent
  "timestamp" -> Right TimestampComponent
  "nonce" -> Right NonceComponent
  "body" -> Right BodyComponent
  "body_urlencoded" -> Right BodyUrlencodedComponent
  "body_json" -> Right BodyJsonComponent
  "body_hash" -> Right BodyHashComponent
  "query" -> Right QueryStringComponent
  "querystring" -> Right QueryStringComponent
  "host" -> Right HostComponent
  _ -> Right (CustomComponent str)

-- | Parse API definition section
parseAPISection :: ParseContext -> Foreign -> ParseResult APIDefinition
parseAPISection ctx yaml = do
  obj <- expectObject ctx yaml
  public <- parseAPICategory (pushPath "public" ctx) =<< getOptionalField ctx "public" obj
  private <- parseAPICategory (pushPath "private" ctx) =<< getOptionalField ctx "private" obj

  pure
    { public: fromMaybe Map.empty public
    , private: fromMaybe Map.empty private
    }

parseAPICategory :: ParseContext -> Maybe Foreign -> ParseResult (Map String (Map HTTPMethod (Array EndpointDef)))
parseAPICategory _ Nothing = Right Map.empty
parseAPICategory ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  parsedEntries <- traverse (parseMethodGroup ctx) entries
  pure $ Map.fromFoldable parsedEntries

parseMethodGroup :: ParseContext -> Tuple String Foreign -> ParseResult (Tuple String (Map HTTPMethod (Array EndpointDef)))
parseMethodGroup ctx (Tuple methodStr val) = do
  method <- parseHTTPMethod ctx methodStr
  endpoints <- parseEndpoints (pushPath methodStr ctx) val
  pure (Tuple methodStr (Map.singleton method endpoints))

parseHTTPMethod :: ParseContext -> String -> ParseResult HTTPMethod
parseHTTPMethod ctx str = case String.toUpper str of
  "GET" -> Right GET
  "POST" -> Right POST
  "PUT" -> Right PUT
  "DELETE" -> Right DELETE
  "PATCH" -> Right PATCH
  "HEAD" -> Right HEAD
  _ -> Left [makeError ctx $ "Unknown HTTP method: " <> str]

parseEndpoints :: ParseContext -> Foreign -> ParseResult (Array EndpointDef)
parseEndpoints ctx yaml = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  traverse (parseEndpoint ctx) entries

parseEndpoint :: ParseContext -> Tuple String Foreign -> ParseResult EndpointDef
parseEndpoint ctx (Tuple path val) = do
  obj <- expectObject (pushPath path ctx) val
  cost <- getNumberWithDefault (pushPath path ctx) "cost" 1.0 obj
  params <- parseParams (pushPath (path <> ".params") ctx) =<< getOptionalField ctx "params" obj
  costByLimit <- traverse (parseCostByLimit ctx) =<< getOptionalField ctx "byLimit" obj
  noSymbolCost <- getOptionalNumber ctx "noSymbol" obj

  pure { path, cost, params, costByLimit, noSymbolCost }

parseParams :: ParseContext -> Maybe Foreign -> ParseResult (Array ParamDef)
parseParams _ Nothing = Right []
parseParams ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  traverse (parseParamDef ctx) entries

parseParamDef :: ParseContext -> Tuple String Foreign -> ParseResult ParamDef
parseParamDef ctx (Tuple name val) = do
  obj <- expectObject (pushPath name ctx) val
  paramTypeStr <- getStringWithDefault ctx "type" "string" obj
  paramType <- parseParamType ctx paramTypeStr
  required <- getBoolWithDefault ctx "required" false obj
  defaultValue <- getOptionalString ctx "default" obj
  requiredIf <- getOptionalString ctx "required_if" obj
  description <- getOptionalString ctx "description" obj

  pure { name, paramType, required, defaultValue, requiredIf, description }

parseParamType :: ParseContext -> String -> ParseResult ParamType
parseParamType ctx str = case String.toLower str of
  "string" -> Right StringParam
  "int" -> Right IntParam
  "integer" -> Right IntParam
  "float" -> Right FloatParam
  "number" -> Right FloatParam
  "bool" -> Right BoolParam
  "boolean" -> Right BoolParam
  "timestamp" -> Right TimestampParam
  "timestamp_ms" -> Right TimestampMSParam
  "timestamp_ns" -> Right TimestampNSParam
  "object" -> Right ObjectParam
  _ -> Right StringParam  -- Default to string

parseCostByLimit :: ParseContext -> Foreign -> ParseResult (Array (Tuple Int Number))
parseCostByLimit ctx yaml = do
  arr <- expectArray ctx yaml
  traverse parsePair arr
  where
    parsePair :: Foreign -> ParseResult (Tuple Int Number)
    parsePair f = do
      pairArr <- expectArray ctx f
      case Array.length pairArr of
        2 -> do
          limit <- expectInt ctx (fromMaybe (unsafeCoerceToForeign 0) (Array.index pairArr 0))
          cost <- expectNumber ctx (fromMaybe (unsafeCoerceToForeign 1.0) (Array.index pairArr 1))
          pure (Tuple limit cost)
        _ -> Left [makeError ctx "Cost by limit must be [limit, cost] pairs"]

-- | Parse parsers section
parseParsersSection :: ParseContext -> Maybe Foreign -> ParseResult (Map String ParserDef)
parseParsersSection _ Nothing = Right Map.empty
parseParsersSection ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  parsedEntries <- traverse (parseParserEntry ctx) entries
  pure $ Map.fromFoldable parsedEntries

parseParserEntry :: ParseContext -> Tuple String Foreign -> ParseResult (Tuple String ParserDef)
parseParserEntry ctx (Tuple name val) = do
  parserDef <- parseParserDef (pushPath name ctx) name val
  pure (Tuple name parserDef)

parseParserDef :: ParseContext -> String -> Foreign -> ParseResult ParserDef
parseParserDef ctx name yaml = do
  obj <- expectObject ctx yaml
  source <- getString ctx "source" obj
  path <- getOptionalString ctx "path" obj
  iterator <- traverse (parseIterator ctx) =<< getOptionalField ctx "iterator" obj
  mapping <- parseFieldMappings (pushPath "mapping" ctx) =<< getOptionalField ctx "mapping" obj

  pure { name, source, path, iterator, mapping }

parseIterator :: ParseContext -> Foreign -> ParseResult Iterator
parseIterator ctx yaml = do
  str <- expectString ctx yaml
  case String.toLower str of
    "array" -> Right ArrayIterator
    "entries" -> Right EntriesIterator
    "values" -> Right ValuesIterator
    _ -> Left [makeError ctx $ "Unknown iterator type: " <> str]

parseFieldMappings :: ParseContext -> Maybe Foreign -> ParseResult (Array FieldMapping)
parseFieldMappings _ Nothing = Right []
parseFieldMappings ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  traverse (parseFieldMapping ctx) entries

parseFieldMapping :: ParseContext -> Tuple String Foreign -> ParseResult FieldMapping
parseFieldMapping ctx (Tuple targetField val) = do
  mapping <- parseMappingType (pushPath targetField ctx) val
  pure { targetField, mapping }

parseMappingType :: ParseContext -> Foreign -> ParseResult MappingType
parseMappingType ctx yaml = do
  -- Try parsing as object first
  case expectObject ctx yaml of
    Right obj -> do
      -- Check for different mapping types
      case unit of
        _ | hasField "path" obj -> PathMapping <$> parsePathMapping ctx obj
        _ | hasField "compute" obj -> ComputeMapping <$> parseComputeMapping ctx obj
        _ | hasField "map" obj -> MapMapping <$> parseMapMapping ctx obj
        _ | hasField "from_context" obj -> do
            contextKey <- getString ctx "from_context" obj
            pure (ContextMapping contextKey)
        _ | hasField "literal" obj -> do
            literal <- getString ctx "literal" obj
            pure (LiteralMapping literal)
        _ -> pure NullMapping
    Left _ -> do
      -- Try as simple string path
      str <- expectString ctx yaml
      pure $ PathMapping { path: str, transform: Nothing, fallbackPaths: [] }

parsePathMapping :: ParseContext -> Object Foreign -> ParseResult PathMappingConfig
parsePathMapping ctx obj = do
  path <- getString ctx "path" obj
  transform <- traverse (parseTransform ctx) =<< getOptionalField ctx "transform" obj
  fallbackPaths <- fromMaybe [] <$> traverse (getStringArray ctx "fallback") (getOptionalField' "fallback" obj)
  pure { path, transform, fallbackPaths }

parseComputeMapping :: ParseContext -> Object Foreign -> ParseResult ComputeMappingConfig
parseComputeMapping ctx obj = do
  expression <- getString ctx "compute" obj
  dependencies <- fromMaybe [] <$> traverse (getStringArray ctx "dependencies") (getOptionalField' "dependencies" obj)
  pure { expression, dependencies }

parseMapMapping :: ParseContext -> Object Foreign -> ParseResult MapMappingConfig
parseMapMapping ctx obj = do
  path <- getString ctx "path" obj
  valueMap <- parseStringMap (pushPath "map" ctx) =<< getField ctx "map" obj
  defaultValue <- getOptionalString ctx "default" obj
  pure { path, valueMap, defaultValue }

parseTransform :: ParseContext -> Foreign -> ParseResult Transform
parseTransform ctx yaml = do
  str <- expectString ctx yaml
  case String.toLower str of
    "parse_number" -> Right ParseNumber
    "parsenumber" -> Right ParseNumber
    "parse_string" -> Right ParseString
    "parsestring" -> Right ParseString
    "parse_boolean" -> Right ParseBoolean
    "parseboolean" -> Right ParseBoolean
    "parse_timestamp" -> Right ParseTimestamp
    "parsetimestamp" -> Right ParseTimestamp
    "parse_timestamp_ms" -> Right ParseTimestampMS
    "parsetimestampms" -> Right ParseTimestampMS
    "parse_currency_code" -> Right ParseCurrencyCode
    "parsecurrencycode" -> Right ParseCurrencyCode
    "parse_symbol" -> Right ParseSymbol
    "parsesymbol" -> Right ParseSymbol
    "parse_market_id" -> Right ParseMarketId
    "parsemarketid" -> Right ParseMarketId
    "parse_order_status" -> Right ParseOrderStatus
    "parseorderstatus" -> Right ParseOrderStatus
    "parse_order_type" -> Right ParseOrderType
    "parseordertype" -> Right ParseOrderType
    "parse_order_side" -> Right ParseOrderSide
    "parseorderside" -> Right ParseOrderSide
    "omit_zero" -> Right OmitZero
    "omitzero" -> Right OmitZero
    "lowercase" -> Right ToLowercase
    "uppercase" -> Right ToUppercase
    _ -> Right (CustomTransform str)

-- | Parse errors section
parseErrorsSection :: ParseContext -> Maybe Foreign -> ParseResult (Array ErrorPattern)
parseErrorsSection _ Nothing = Right []
parseErrorsSection ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  patterns <- getOptionalField ctx "patterns" obj
  case patterns of
    Just p -> do
      arr <- expectArray ctx p
      traverse (parseErrorPattern ctx) arr
    Nothing -> Right []

parseErrorPattern :: ParseContext -> Foreign -> ParseResult ErrorPattern
parseErrorPattern ctx yaml = do
  obj <- expectObject ctx yaml
  matchStr <- getString ctx "match" obj
  errorTypeStr <- getString ctx "type" obj
  errorType <- parseCCXTError ctx errorTypeStr
  retry <- traverse (parseRetryStrategy ctx) =<< getOptionalField ctx "retry" obj
  message <- getOptionalString ctx "message" obj

  -- Determine match type
  let matchType = ExactMatch matchStr  -- TODO: detect broad vs exact vs regex

  pure { match: matchType, errorType, retry, message }

parseCCXTError :: ParseContext -> String -> ParseResult CCXTError
parseCCXTError ctx str = case str of
  "ExchangeError" -> Right ExchangeError
  "AuthenticationError" -> Right AuthenticationError
  "PermissionDenied" -> Right PermissionDenied
  "InsufficientFunds" -> Right InsufficientFunds
  "InvalidOrder" -> Right InvalidOrder
  "OrderNotFound" -> Right OrderNotFound
  "CancelPending" -> Right CancelPending
  "NetworkError" -> Right NetworkError
  "RateLimitExceeded" -> Right RateLimitExceeded
  "ExchangeNotAvailable" -> Right ExchangeNotAvailable
  "InvalidNonce" -> Right InvalidNonce
  "BadRequest" -> Right BadRequest
  "BadResponse" -> Right BadResponse
  "NullResponse" -> Right NullResponse
  "NotSupported" -> Right NotSupported
  "OnMaintenance" -> Right OnMaintenance
  "AccountSuspended" -> Right AccountSuspended
  "InvalidAddress" -> Right InvalidAddress
  "AddressPending" -> Right AddressPending
  "ArgumentsRequired" -> Right ArgumentsRequired
  "BadSymbol" -> Right BadSymbol
  "MarginModeAlreadySet" -> Right MarginModeAlreadySet
  _ -> Left [makeError ctx $ "Unknown CCXT error type: " <> str]

parseRetryStrategy :: ParseContext -> Foreign -> ParseResult RetryStrategy
parseRetryStrategy ctx yaml = do
  str <- expectString ctx yaml
  case String.toLower str of
    "none" -> Right NoRetry
    "linear" -> Right (LinearRetry { maxRetries: 3, delayMs: 1000 })
    "exponential" -> Right (ExponentialRetry { maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 30000, factor: 2.0 })
    _ -> Left [makeError ctx $ "Unknown retry strategy: " <> str]

-- | Parse timeframes
parseTimeframes :: ParseContext -> Foreign -> ParseResult TimeframeMap
parseTimeframes ctx yaml = parseStringMap ctx yaml

-- | Parse fees section
parseFeesSection :: ParseContext -> Foreign -> ParseResult FeeConfig
parseFeesSection ctx yaml = do
  obj <- expectObject ctx yaml
  trading <- parseTradingFees (pushPath "trading" ctx) =<< getField ctx "trading" obj
  funding <- traverse (parseFundingFees (pushPath "funding" ctx)) =<< getOptionalField ctx "funding" obj
  pure { trading, funding }

parseTradingFees :: ParseContext -> Foreign -> ParseResult TradingFees
parseTradingFees ctx yaml = do
  obj <- expectObject ctx yaml
  tierBased <- getBoolWithDefault ctx "tierBased" false obj
  percentage <- getBoolWithDefault ctx "percentage" true obj
  taker <- getNumberWithDefault ctx "taker" 0.001 obj
  maker <- getNumberWithDefault ctx "maker" 0.001 obj
  tiers <- traverse (parseTierConfig ctx) =<< getOptionalField ctx "tiers" obj
  pure { tierBased, percentage, taker, maker, tiers }

parseTierConfig :: ParseContext -> Foreign -> ParseResult TierConfig
parseTierConfig ctx yaml = do
  obj <- expectObject ctx yaml
  -- TODO: Parse tiers properly
  pure { taker: [], maker: [] }

parseFundingFees :: ParseContext -> Foreign -> ParseResult FundingFees
parseFundingFees ctx yaml = do
  obj <- expectObject ctx yaml
  withdraw <- parseNumberMap (pushPath "withdraw" ctx) =<< getOptionalField ctx "withdraw" obj
  deposit <- parseNumberMap (pushPath "deposit" ctx) =<< getOptionalField ctx "deposit" obj
  pure { withdraw: fromMaybe Map.empty withdraw, deposit: fromMaybe Map.empty deposit }

-- | Parse limits section
parseLimitsSection :: ParseContext -> Foreign -> ParseResult LimitsConfig
parseLimitsSection ctx yaml = do
  obj <- expectObject ctx yaml
  amount <- traverse (parseMinMax ctx) =<< getOptionalField ctx "amount" obj
  price <- traverse (parseMinMax ctx) =<< getOptionalField ctx "price" obj
  cost <- traverse (parseMinMax ctx) =<< getOptionalField ctx "cost" obj
  leverage <- traverse (parseMinMax ctx) =<< getOptionalField ctx "leverage" obj
  pure { amount, price, cost, leverage }

parseMinMax :: ParseContext -> Foreign -> ParseResult MinMax
parseMinMax ctx yaml = do
  obj <- expectObject ctx yaml
  min <- getOptionalNumber ctx "min" obj
  max <- getOptionalNumber ctx "max" obj
  pure { min, max }

-- | Parse precision section
parsePrecisionSection :: ParseContext -> Foreign -> ParseResult PrecisionConfig
parsePrecisionSection ctx yaml = do
  obj <- expectObject ctx yaml
  amount <- getOptionalInt ctx "amount" obj
  price <- getOptionalInt ctx "price" obj
  base <- getOptionalInt ctx "base" obj
  quote <- getOptionalInt ctx "quote" obj
  pure { amount, price, base, quote }

-- | Parse options section
parseOptionsSection :: ParseContext -> Maybe Foreign -> ParseResult (Map String String)
parseOptionsSection _ Nothing = Right Map.empty
parseOptionsSection ctx (Just yaml) = parseStringMap ctx yaml

-- | Parse overrides section
parseOverridesSection :: ParseContext -> Maybe Foreign -> ParseResult (Array OverrideDef)
parseOverridesSection _ Nothing = Right []
parseOverridesSection ctx (Just yaml) = do
  arr <- expectArray ctx yaml
  traverse (parseOverrideDef ctx) arr

parseOverrideDef :: ParseContext -> Foreign -> ParseResult OverrideDef
parseOverrideDef ctx yaml = do
  obj <- expectObject ctx yaml
  method <- getString ctx "method" obj
  description <- getStringWithDefault ctx "description" "" obj
  file <- getString ctx "file" obj
  pure { method, description, file }

-- | Parse required credentials
parseRequiredCredentials :: ParseContext -> Maybe Foreign -> ParseResult (Maybe RequiredCredentials)
parseRequiredCredentials _ Nothing = Right Nothing
parseRequiredCredentials ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  apiKey <- getBoolWithDefault ctx "apiKey" true obj
  secret <- getBoolWithDefault ctx "secret" true obj
  uid <- getBoolWithDefault ctx "uid" false obj
  login <- getBoolWithDefault ctx "login" false obj
  password <- getBoolWithDefault ctx "password" false obj
  twofa <- getBoolWithDefault ctx "twofa" false obj
  privateKey <- getBoolWithDefault ctx "privateKey" false obj
  walletAddress <- getBoolWithDefault ctx "walletAddress" false obj
  token <- getBoolWithDefault ctx "token" false obj
  pure $ Just { apiKey, secret, uid, login, password, twofa, privateKey, walletAddress, token }

-- Helper functions
parseStringMap :: ParseContext -> Foreign -> ParseResult (Map String String)
parseStringMap ctx yaml = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  parsedEntries <- traverse parseStringEntry entries
  pure $ Map.fromFoldable parsedEntries
  where
    parseStringEntry (Tuple key val) = do
      strVal <- expectString (pushPath key ctx) val
      pure (Tuple key strVal)

parseNumberMap :: ParseContext -> Maybe Foreign -> ParseResult (Maybe (Map String Number))
parseNumberMap _ Nothing = Right Nothing
parseNumberMap ctx (Just yaml) = do
  obj <- expectObject ctx yaml
  let entries = FO.toUnfoldable obj :: Array (Tuple String Foreign)
  parsedEntries <- traverse parseNumberEntry entries
  pure $ Just $ Map.fromFoldable parsedEntries
  where
    parseNumberEntry (Tuple key val) = do
      numVal <- expectNumber (pushPath key ctx) val
      pure (Tuple key numVal)

-- Low-level helpers for Foreign parsing
expectObject :: ParseContext -> Foreign -> ParseResult (Object Foreign)
expectObject ctx f =
  case runExcept (readForeignObject f) of
    Right obj -> Right obj
    Left _ -> Left [makeError ctx "Expected an object"]

expectString :: ParseContext -> Foreign -> ParseResult String
expectString ctx f =
  case runExcept (readString f) of
    Right s -> Right s
    Left _ -> Left [makeError ctx "Expected a string"]

expectInt :: ParseContext -> Foreign -> ParseResult Int
expectInt ctx f =
  case runExcept (readInt f) of
    Right i -> Right i
    Left _ -> Left [makeError ctx "Expected an integer"]

expectNumber :: ParseContext -> Foreign -> ParseResult Number
expectNumber ctx f =
  case runExcept (readNumber f) of
    Right n -> Right n
    Left _ -> Left [makeError ctx "Expected a number"]

expectArray :: ParseContext -> Foreign -> ParseResult (Array Foreign)
expectArray ctx f =
  case runExcept (readArray f) of
    Right arr -> Right arr
    Left _ -> Left [makeError ctx "Expected an array"]

getField :: ParseContext -> String -> Object Foreign -> ParseResult Foreign
getField ctx key obj =
  note [makeError ctx $ "Missing required field: " <> key] (FO.lookup key obj)

getOptionalField :: ParseContext -> String -> Object Foreign -> ParseResult (Maybe Foreign)
getOptionalField _ key obj = Right (FO.lookup key obj)

getOptionalField' :: String -> Object Foreign -> Maybe Foreign
getOptionalField' = FO.lookup

hasField :: String -> Object Foreign -> Boolean
hasField key obj = case FO.lookup key obj of
  Just _ -> true
  Nothing -> false

getString :: ParseContext -> String -> Object Foreign -> ParseResult String
getString ctx key obj = do
  f <- getField ctx key obj
  expectString (pushPath key ctx) f

getOptionalString :: ParseContext -> String -> Object Foreign -> ParseResult (Maybe String)
getOptionalString ctx key obj =
  traverse (expectString (pushPath key ctx)) (FO.lookup key obj)

getStringWithDefault :: ParseContext -> String -> String -> Object Foreign -> ParseResult String
getStringWithDefault ctx key def obj = do
  maybeStr <- getOptionalString ctx key obj
  pure $ fromMaybe def maybeStr

getStringArray :: ParseContext -> String -> Object Foreign -> ParseResult (Array String)
getStringArray ctx key obj = do
  maybeField <- getOptionalField ctx key obj
  case maybeField of
    Nothing -> Right []
    Just f -> do
      arr <- expectArray (pushPath key ctx) f
      traverse (expectString (pushPath key ctx)) arr

getBoolWithDefault :: ParseContext -> String -> Boolean -> Object Foreign -> ParseResult Boolean
getBoolWithDefault ctx key def obj =
  case FO.lookup key obj of
    Nothing -> Right def
    Just f -> case runExcept (readBoolean f) of
      Right b -> Right b
      Left _ -> Right def

getIntWithDefault :: ParseContext -> String -> Int -> Object Foreign -> ParseResult Int
getIntWithDefault ctx key def obj =
  case FO.lookup key obj of
    Nothing -> Right def
    Just f -> case runExcept (readInt f) of
      Right i -> Right i
      Left _ -> Right def

getOptionalInt :: ParseContext -> String -> Object Foreign -> ParseResult (Maybe Int)
getOptionalInt ctx key obj =
  case FO.lookup key obj of
    Nothing -> Right Nothing
    Just f -> case runExcept (readInt f) of
      Right i -> Right (Just i)
      Left _ -> Right Nothing

getNumberWithDefault :: ParseContext -> String -> Number -> Object Foreign -> ParseResult Number
getNumberWithDefault ctx key def obj =
  case FO.lookup key obj of
    Nothing -> Right def
    Just f -> case runExcept (readNumber f) of
      Right n -> Right n
      Left _ -> Right def

getOptionalNumber :: ParseContext -> String -> Object Foreign -> ParseResult (Maybe Number)
getOptionalNumber ctx key obj =
  case FO.lookup key obj of
    Nothing -> Right Nothing
    Just f -> case runExcept (readNumber f) of
      Right n -> Right (Just n)
      Left _ -> Right Nothing

-- FFI for reading Foreign Object
foreign import readForeignObject :: Foreign -> ExceptT (Array String) Effect (Object Foreign)
foreign import unsafeCoerceToForeign :: forall a. a -> Foreign
