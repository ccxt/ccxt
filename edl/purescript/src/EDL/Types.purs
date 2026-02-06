-- | Core Algebraic Data Types for Exchange Definition Language (EDL)
-- |
-- | This module defines the type-safe representations of EDL YAML specifications.
-- | All exchange definitions are parsed into these types before code generation.
module EDL.Types where

import Prelude

import Data.Maybe (Maybe)
import Data.Map (Map)
import Data.Array (Array)
import Data.Tuple (Tuple)

-- | Exchange metadata section
type ExchangeMetadata =
  { id :: String
  , name :: String
  , countries :: Array String
  , version :: String
  , rateLimit :: Int
  , certified :: Boolean
  , pro :: Boolean
  , alias :: Boolean
  , dex :: Boolean
  }

-- | URL configuration for the exchange
type URLConfig =
  { logo :: Maybe String
  , api :: APIUrls
  , test :: Maybe APIUrls
  , www :: String
  , doc :: Array String
  , fees :: Maybe String
  , referral :: Maybe String
  }

-- | API URL structure (public, private, etc.)
type APIUrls = Map String String

-- | Exchange capabilities ('has' object)
type Capabilities = Map String (Maybe Boolean)

-- | Authentication method specification
data AuthMethod
  = HMACAuth HMACConfig
  | JWTAuth JWTConfig
  | RSAAuth RSAConfig
  | EdDSAAuth EdDSAConfig
  | APIKeyOnlyAuth APIKeyConfig
  | CustomAuth CustomAuthConfig

derive instance eqAuthMethod :: Eq AuthMethod

-- | HMAC-based authentication configuration
type HMACConfig =
  { algorithm :: HashAlgorithm
  , encoding :: SignatureEncoding
  , signatureComponents :: Array SignatureComponent
  , signatureFormat :: String
  , headers :: Map String String
  , bodyParams :: Map String String
  , queryParams :: Map String String
  , timestampUnit :: TimestampUnit
  , nonceType :: NonceType
  }

-- | JWT authentication configuration
type JWTConfig =
  { algorithm :: JWTAlgorithm
  , keyType :: KeyType
  , claims :: Map String String
  , headerFields :: Map String String
  }

-- | RSA authentication configuration
type RSAConfig =
  { algorithm :: HashAlgorithm
  , encoding :: SignatureEncoding
  , signatureComponents :: Array SignatureComponent
  , keyFormat :: KeyFormat
  }

-- | EdDSA authentication configuration
type EdDSAConfig =
  { curve :: EdCurve
  , encoding :: SignatureEncoding
  , signatureComponents :: Array SignatureComponent
  }

-- | Simple API key header authentication
type APIKeyConfig =
  { headerName :: String
  , headerValue :: String
  }

-- | Custom authentication for complex cases
type CustomAuthConfig =
  { description :: String
  , overrideFile :: String
  }

-- | Hash algorithm for signatures
data HashAlgorithm
  = SHA256
  | SHA384
  | SHA512
  | MD5
  | SHA1

derive instance eqHashAlgorithm :: Eq HashAlgorithm

instance showHashAlgorithm :: Show HashAlgorithm where
  show SHA256 = "sha256"
  show SHA384 = "sha384"
  show SHA512 = "sha512"
  show MD5 = "md5"
  show SHA1 = "sha1"

-- | JWT algorithm variants
data JWTAlgorithm
  = ES256
  | ES384
  | ES512
  | RS256
  | RS384
  | RS512
  | HS256
  | HS384
  | HS512

derive instance eqJWTAlgorithm :: Eq JWTAlgorithm

-- | Signature encoding format
data SignatureEncoding
  = Base64
  | Base64URL
  | Hex
  | Binary

derive instance eqSignatureEncoding :: Eq SignatureEncoding

instance showSignatureEncoding :: Show SignatureEncoding where
  show Base64 = "base64"
  show Base64URL = "base64url"
  show Hex = "hex"
  show Binary = "binary"

-- | Components that can be included in signature
data SignatureComponent
  = PathComponent
  | MethodComponent
  | TimestampComponent
  | NonceComponent
  | BodyComponent
  | BodyUrlencodedComponent
  | BodyJsonComponent
  | BodyHashComponent
  | QueryStringComponent
  | HostComponent
  | CustomComponent String

derive instance eqSignatureComponent :: Eq SignatureComponent

-- | Timestamp unit for signatures
data TimestampUnit
  = Seconds
  | Milliseconds
  | Microseconds
  | Nanoseconds

derive instance eqTimestampUnit :: Eq TimestampUnit

-- | Nonce generation type
data NonceType
  = TimestampNonce
  | IncrementingNonce
  | UUIDNonce
  | CustomNonce String

derive instance eqNonceType :: Eq NonceType

-- | Key format for RSA/EdDSA keys
data KeyFormat
  = PEM
  | DER
  | JWK

derive instance eqKeyFormat :: Eq KeyFormat

-- | Curve type for EdDSA
data EdCurve
  = Ed25519
  | Ed448

derive instance eqEdCurve :: Eq EdCurve

-- | Key type for JWT
data KeyType
  = SecretKey
  | PrivateKey
  | CloudAPIKey

derive instance eqKeyType :: Eq KeyType

-- | HTTP method
data HTTPMethod
  = GET
  | POST
  | PUT
  | DELETE
  | PATCH
  | HEAD

derive instance eqHTTPMethod :: Eq HTTPMethod

instance showHTTPMethod :: Show HTTPMethod where
  show GET = "GET"
  show POST = "POST"
  show PUT = "PUT"
  show DELETE = "DELETE"
  show PATCH = "PATCH"
  show HEAD = "HEAD"

-- | API definition structure
type APIDefinition =
  { public :: Map String (Map HTTPMethod (Array EndpointDef))
  , private :: Map String (Map HTTPMethod (Array EndpointDef))
  }

-- | Single endpoint definition
type EndpointDef =
  { path :: String
  , cost :: Number
  , params :: Array ParamDef
  , costByLimit :: Maybe (Array (Tuple Int Number))
  , noSymbolCost :: Maybe Number
  }

-- | Parameter definition for endpoints
type ParamDef =
  { name :: String
  , paramType :: ParamType
  , required :: Boolean
  , defaultValue :: Maybe String
  , requiredIf :: Maybe String
  , description :: Maybe String
  }

-- | Parameter types
data ParamType
  = StringParam
  | IntParam
  | FloatParam
  | BoolParam
  | TimestampParam
  | TimestampMSParam
  | TimestampNSParam
  | ArrayParam ParamType
  | ObjectParam
  | EnumParam (Array String)

derive instance eqParamType :: Eq ParamType

-- | Parser definition for response mapping
type ParserDef =
  { name :: String
  , source :: String
  , path :: Maybe String
  , iterator :: Maybe Iterator
  , mapping :: Array FieldMapping
  }

-- | Iterator types for parsing arrays/objects
data Iterator
  = ArrayIterator
  | EntriesIterator
  | ValuesIterator
  | PaginatedIterator PaginationConfig

derive instance eqIterator :: Eq Iterator

-- | Pagination configuration
type PaginationConfig =
  { cursorPath :: String
  , hasMorePath :: Maybe String
  , limitParam :: String
  , cursorParam :: String
  }

-- | Field mapping for parser
type FieldMapping =
  { targetField :: String
  , mapping :: MappingType
  }

-- | Types of field mappings
data MappingType
  = PathMapping PathMappingConfig
  | ComputeMapping ComputeMappingConfig
  | MapMapping MapMappingConfig
  | ContextMapping String
  | LiteralMapping String
  | NullMapping

derive instance eqMappingType :: Eq MappingType

-- | Path-based field mapping
type PathMappingConfig =
  { path :: String
  , transform :: Maybe Transform
  , fallbackPaths :: Array String
  }

-- | Computed field mapping
type ComputeMappingConfig =
  { expression :: String
  , dependencies :: Array String
  }

-- | Map-based value lookup
type MapMappingConfig =
  { path :: String
  , valueMap :: Map String String
  , defaultValue :: Maybe String
  }

-- | Transform operations for field values
data Transform
  = ParseNumber
  | ParseString
  | ParseBoolean
  | ParseTimestamp
  | ParseTimestampMS
  | ParseCurrencyCode
  | ParseSymbol
  | ParseMarketId
  | ParseOrderStatus
  | ParseOrderType
  | ParseOrderSide
  | OmitZero
  | ToLowercase
  | ToUppercase
  | Multiply Number
  | Divide Number
  | CustomTransform String
  | ChainedTransform (Array Transform)

derive instance eqTransform :: Eq Transform

-- | Error pattern for exception mapping
type ErrorPattern =
  { match :: ErrorMatch
  , errorType :: CCXTError
  , retry :: Maybe RetryStrategy
  , message :: Maybe String
  }

-- | Error matching criteria
data ErrorMatch
  = ExactMatch String
  | BroadMatch String
  | CodeMatch Int
  | RegexMatch String

derive instance eqErrorMatch :: Eq ErrorMatch

-- | CCXT error types
data CCXTError
  = ExchangeError
  | AuthenticationError
  | PermissionDenied
  | InsufficientFunds
  | InvalidOrder
  | OrderNotFound
  | CancelPending
  | NetworkError
  | RateLimitExceeded
  | ExchangeNotAvailable
  | InvalidNonce
  | BadRequest
  | BadResponse
  | NullResponse
  | NotSupported
  | OnMaintenance
  | AccountSuspended
  | InvalidAddress
  | AddressPending
  | ArgumentsRequired
  | BadSymbol
  | MarginModeAlreadySet

derive instance eqCCXTError :: Eq CCXTError

instance showCCXTError :: Show CCXTError where
  show ExchangeError = "ExchangeError"
  show AuthenticationError = "AuthenticationError"
  show PermissionDenied = "PermissionDenied"
  show InsufficientFunds = "InsufficientFunds"
  show InvalidOrder = "InvalidOrder"
  show OrderNotFound = "OrderNotFound"
  show CancelPending = "CancelPending"
  show NetworkError = "NetworkError"
  show RateLimitExceeded = "RateLimitExceeded"
  show ExchangeNotAvailable = "ExchangeNotAvailable"
  show InvalidNonce = "InvalidNonce"
  show BadRequest = "BadRequest"
  show BadResponse = "BadResponse"
  show NullResponse = "NullResponse"
  show NotSupported = "NotSupported"
  show OnMaintenance = "OnMaintenance"
  show AccountSuspended = "AccountSuspended"
  show InvalidAddress = "InvalidAddress"
  show AddressPending = "AddressPending"
  show ArgumentsRequired = "ArgumentsRequired"
  show BadSymbol = "BadSymbol"
  show MarginModeAlreadySet = "MarginModeAlreadySet"

-- | Retry strategy for recoverable errors
data RetryStrategy
  = NoRetry
  | LinearRetry LinearRetryConfig
  | ExponentialRetry ExponentialRetryConfig

derive instance eqRetryStrategy :: Eq RetryStrategy

type LinearRetryConfig =
  { maxRetries :: Int
  , delayMs :: Int
  }

type ExponentialRetryConfig =
  { maxRetries :: Int
  , initialDelayMs :: Int
  , maxDelayMs :: Int
  , factor :: Number
  }

-- | Timeframe mapping
type TimeframeMap = Map String String

-- | Fee configuration
type FeeConfig =
  { trading :: TradingFees
  , funding :: Maybe FundingFees
  }

type TradingFees =
  { tierBased :: Boolean
  , percentage :: Boolean
  , taker :: Number
  , maker :: Number
  , tiers :: Maybe TierConfig
  }

type TierConfig =
  { taker :: Array (Tuple Number Number)
  , maker :: Array (Tuple Number Number)
  }

type FundingFees =
  { withdraw :: Map String Number
  , deposit :: Map String Number
  }

-- | Limits configuration
type LimitsConfig =
  { amount :: Maybe MinMax
  , price :: Maybe MinMax
  , cost :: Maybe MinMax
  , leverage :: Maybe MinMax
  }

type MinMax =
  { min :: Maybe Number
  , max :: Maybe Number
  }

-- | Precision configuration
type PrecisionConfig =
  { amount :: Maybe Int
  , price :: Maybe Int
  , base :: Maybe Int
  , quote :: Maybe Int
  }

-- | Override definition for complex methods
type OverrideDef =
  { method :: String
  , description :: String
  , file :: String
  }

-- | Required credentials specification
type RequiredCredentials =
  { apiKey :: Boolean
  , secret :: Boolean
  , uid :: Boolean
  , login :: Boolean
  , password :: Boolean
  , twofa :: Boolean
  , privateKey :: Boolean
  , walletAddress :: Boolean
  , token :: Boolean
  }

-- | Default required credentials (apiKey + secret)
defaultRequiredCredentials :: RequiredCredentials
defaultRequiredCredentials =
  { apiKey: true
  , secret: true
  , uid: false
  , login: false
  , password: false
  , twofa: false
  , privateKey: false
  , walletAddress: false
  , token: false
  }

-- | Complete EDL document
type EDLDocument =
  { exchange :: ExchangeMetadata
  , urls :: URLConfig
  , has :: Capabilities
  , timeframes :: Maybe TimeframeMap
  , requiredCredentials :: RequiredCredentials
  , auth :: AuthMethod
  , api :: APIDefinition
  , parsers :: Map String ParserDef
  , errors :: Array ErrorPattern
  , fees :: Maybe FeeConfig
  , limits :: Maybe LimitsConfig
  , precision :: Maybe PrecisionConfig
  , options :: Map String String
  , overrides :: Array OverrideDef
  }

-- | Parser error with location information
type ParseError =
  { message :: String
  , line :: Maybe Int
  , column :: Maybe Int
  , path :: Array String
  }

-- | Validation error from semantic analysis
type ValidationError =
  { message :: String
  , severity :: Severity
  , location :: Maybe String
  , suggestion :: Maybe String
  }

data Severity
  = Error
  | Warning
  | Info

derive instance eqSeverity :: Eq Severity

-- | Result type for parsing and validation
type EDLResult a =
  { result :: Maybe a
  , errors :: Array ParseError
  , warnings :: Array ValidationError
  }
