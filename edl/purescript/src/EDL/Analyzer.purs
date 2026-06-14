-- | Semantic Analyzer for EDL Documents
-- |
-- | This module validates EDL documents for semantic correctness,
-- | cross-references, and consistency. It produces warnings and errors
-- | that help developers fix their EDL specifications.
module EDL.Analyzer where

import Prelude

import Data.Maybe (Maybe(..), isNothing, fromMaybe)
import Data.Either (Either(..))
import Data.Array as Array
import Data.Map (Map)
import Data.Map as Map
import Data.Tuple (Tuple(..))
import Data.Foldable (foldl, any, all)
import Data.Traversable (traverse)
import Data.String as String
import Data.String.Regex (regex, test)
import Data.String.Regex.Flags (noFlags)

import EDL.Types

-- | Validation result
type ValidationResult =
  { errors :: Array ValidationError
  , warnings :: Array ValidationError
  , info :: Array ValidationError
  }

emptyResult :: ValidationResult
emptyResult = { errors: [], warnings: [], info: [] }

-- | Combine validation results
combineResults :: ValidationResult -> ValidationResult -> ValidationResult
combineResults r1 r2 =
  { errors: r1.errors <> r2.errors
  , warnings: r1.warnings <> r2.warnings
  , info: r1.info <> r2.info
  }

addError :: ValidationError -> ValidationResult -> ValidationResult
addError err result = result { errors = Array.snoc result.errors err }

addWarning :: ValidationError -> ValidationResult -> ValidationResult
addWarning warn result = result { warnings = Array.snoc result.warnings warn }

addInfo :: ValidationError -> ValidationResult -> ValidationResult
addInfo info result = result { info = Array.snoc result.info info }

-- | Validate an EDL document
analyzeDocument :: EDLDocument -> ValidationResult
analyzeDocument doc =
  foldl combineResults emptyResult
    [ validateExchangeMetadata doc.exchange
    , validateURLConfig doc.urls
    , validateCapabilities doc.has
    , validateAuth doc.auth
    , validateAPI doc.api
    , validateParsers doc.parsers doc.api
    , validateErrors doc.errors
    , validateOverrides doc.overrides
    , crossValidate doc
    ]

-- | Validate exchange metadata
validateExchangeMetadata :: ExchangeMetadata -> ValidationResult
validateExchangeMetadata meta = foldl combineResults emptyResult
  [ validateExchangeId meta.id
  , validateExchangeName meta.name
  , validateRateLimit meta.rateLimit
  , validateCountries meta.countries
  ]

validateExchangeId :: String -> ValidationResult
validateExchangeId id
  | String.length id == 0 = addError (makeError "Exchange ID cannot be empty" "exchange.id") emptyResult
  | not (isValidIdentifier id) = addError (makeError "Exchange ID must be a valid identifier (lowercase alphanumeric)" "exchange.id") emptyResult
  | otherwise = emptyResult

validateExchangeName :: String -> ValidationResult
validateExchangeName name
  | String.length name == 0 = addError (makeError "Exchange name cannot be empty" "exchange.name") emptyResult
  | otherwise = emptyResult

validateRateLimit :: Int -> ValidationResult
validateRateLimit rate
  | rate < 0 = addError (makeError "Rate limit cannot be negative" "exchange.rateLimit") emptyResult
  | rate == 0 = addWarning (makeWarning "Rate limit of 0 may cause issues" "exchange.rateLimit") emptyResult
  | rate > 60000 = addWarning (makeWarning "Rate limit seems very high (>60s)" "exchange.rateLimit") emptyResult
  | otherwise = emptyResult

validateCountries :: Array String -> ValidationResult
validateCountries countries
  | Array.length countries == 0 = addInfo (makeInfo "No countries specified" "exchange.countries") emptyResult
  | otherwise = foldl combineResults emptyResult (map validateCountryCode countries)

validateCountryCode :: String -> ValidationResult
validateCountryCode code
  | String.length code /= 2 = addWarning (makeWarning ("Country code should be 2 letters: " <> code) "exchange.countries") emptyResult
  | otherwise = emptyResult

-- | Validate URL configuration
validateURLConfig :: URLConfig -> ValidationResult
validateURLConfig urls = foldl combineResults emptyResult
  [ validateAPIUrls urls.api
  , validateOptionalAPIUrls urls.test
  , validateWWWUrl urls.www
  , validateDocUrls urls.doc
  ]

validateAPIUrls :: APIUrls -> ValidationResult
validateAPIUrls urls
  | Map.isEmpty urls = addError (makeError "API URLs cannot be empty" "urls.api") emptyResult
  | not (Map.member "public" urls) = addWarning (makeWarning "No 'public' API URL defined" "urls.api") emptyResult
  | otherwise = foldl combineResults emptyResult (map validateUrl (Map.values urls))

validateOptionalAPIUrls :: Maybe APIUrls -> ValidationResult
validateOptionalAPIUrls Nothing = emptyResult
validateOptionalAPIUrls (Just urls) = foldl combineResults emptyResult (map validateUrl (Map.values urls))

validateWWWUrl :: String -> ValidationResult
validateWWWUrl url
  | String.length url == 0 = addWarning (makeWarning "WWW URL is empty" "urls.www") emptyResult
  | not (isValidUrl url) = addWarning (makeWarning "WWW URL appears invalid" "urls.www") emptyResult
  | otherwise = emptyResult

validateDocUrls :: Array String -> ValidationResult
validateDocUrls docs
  | Array.length docs == 0 = addWarning (makeWarning "No documentation URLs provided" "urls.doc") emptyResult
  | otherwise = foldl combineResults emptyResult (map (validateUrl' "urls.doc") docs)

validateUrl :: String -> ValidationResult
validateUrl url
  | isValidUrl url = emptyResult
  | otherwise = addWarning (makeWarning ("URL appears invalid: " <> url) "urls") emptyResult

validateUrl' :: String -> String -> ValidationResult
validateUrl' loc url
  | isValidUrl url = emptyResult
  | otherwise = addWarning (makeWarning ("URL appears invalid: " <> url) loc) emptyResult

-- | Validate capabilities
validateCapabilities :: Capabilities -> ValidationResult
validateCapabilities caps = foldl combineResults emptyResult
  [ validateRequiredCapabilities caps
  , validateCapabilityConsistency caps
  ]

validateRequiredCapabilities :: Capabilities -> ValidationResult
validateRequiredCapabilities caps =
  let required = ["fetchMarkets", "fetchTicker", "fetchOrderBook"]
      missing = Array.filter (\cap -> not (hasCapability caps cap)) required
  in if Array.length missing > 0
     then addWarning (makeWarning ("Missing common capabilities: " <> String.joinWith ", " missing) "has") emptyResult
     else emptyResult

validateCapabilityConsistency :: Capabilities -> ValidationResult
validateCapabilityConsistency caps = foldl combineResults emptyResult
  [ -- If we have createOrder, we should have cancelOrder
    if hasCapability caps "createOrder" && not (hasCapability caps "cancelOrder")
    then addWarning (makeWarning "createOrder without cancelOrder is unusual" "has") emptyResult
    else emptyResult
  , -- If we have spot trading, we should have balance
    if hasCapability caps "spot" && not (hasCapability caps "fetchBalance")
    then addWarning (makeWarning "spot trading without fetchBalance" "has") emptyResult
    else emptyResult
  , -- Limit orders should imply market orders
    if hasCapability caps "createLimitOrder" && not (hasCapability caps "createMarketOrder")
    then addInfo (makeInfo "createLimitOrder without createMarketOrder" "has") emptyResult
    else emptyResult
  ]

hasCapability :: Capabilities -> String -> Boolean
hasCapability caps name = case Map.lookup name caps of
  Just (Just true) -> true
  _ -> false

-- | Validate authentication configuration
validateAuth :: AuthMethod -> ValidationResult
validateAuth (HMACAuth config) = validateHMACAuth config
validateAuth (JWTAuth config) = validateJWTAuth config
validateAuth (RSAAuth config) = validateRSAAuth config
validateAuth (EdDSAAuth config) = validateEdDSAAuth config
validateAuth (APIKeyOnlyAuth config) = validateAPIKeyAuth config
validateAuth (CustomAuth config) = validateCustomAuth config

validateHMACAuth :: HMACConfig -> ValidationResult
validateHMACAuth config = foldl combineResults emptyResult
  [ validateSignatureComponents config.signatureComponents
  , if Map.isEmpty config.headers
    then addWarning (makeWarning "No auth headers defined for HMAC" "auth.headers") emptyResult
    else emptyResult
  ]

validateJWTAuth :: JWTConfig -> ValidationResult
validateJWTAuth config =
  if Map.isEmpty config.claims
  then addWarning (makeWarning "No JWT claims defined" "auth.claims") emptyResult
  else emptyResult

validateRSAAuth :: RSAConfig -> ValidationResult
validateRSAAuth config = validateSignatureComponents config.signatureComponents

validateEdDSAAuth :: EdDSAConfig -> ValidationResult
validateEdDSAAuth config = validateSignatureComponents config.signatureComponents

validateAPIKeyAuth :: APIKeyConfig -> ValidationResult
validateAPIKeyAuth config =
  if String.length config.headerName == 0
  then addError (makeError "API key header name cannot be empty" "auth.headerName") emptyResult
  else emptyResult

validateCustomAuth :: CustomAuthConfig -> ValidationResult
validateCustomAuth config =
  if String.length config.overrideFile == 0
  then addError (makeError "Custom auth must specify an override file" "auth.overrideFile") emptyResult
  else emptyResult

validateSignatureComponents :: Array SignatureComponent -> ValidationResult
validateSignatureComponents components
  | Array.length components == 0 = addWarning (makeWarning "No signature components defined" "auth.signature.components") emptyResult
  | otherwise = emptyResult

-- | Validate API definition
validateAPI :: APIDefinition -> ValidationResult
validateAPI api = foldl combineResults emptyResult
  [ validateAPICategory "public" api.public
  , validateAPICategory "private" api.private
  ]

validateAPICategory :: String -> Map String (Map HTTPMethod (Array EndpointDef)) -> ValidationResult
validateAPICategory category endpoints
  | Map.isEmpty endpoints = addWarning (makeWarning ("No " <> category <> " endpoints defined") ("api." <> category)) emptyResult
  | otherwise = foldl combineResults emptyResult (map (validateEndpointGroup category) (Map.toUnfoldable endpoints :: Array _))

validateEndpointGroup :: String -> Tuple String (Map HTTPMethod (Array EndpointDef)) -> ValidationResult
validateEndpointGroup category (Tuple method endpoints) =
  let allEndpoints = Array.concat (Map.values endpoints)
  in foldl combineResults emptyResult (map (validateEndpoint category method) allEndpoints)

validateEndpoint :: String -> String -> EndpointDef -> ValidationResult
validateEndpoint category method endpoint = foldl combineResults emptyResult
  [ if String.length endpoint.path == 0
    then addError (makeError "Endpoint path cannot be empty" ("api." <> category <> "." <> method)) emptyResult
    else emptyResult
  , if endpoint.cost < 0.0
    then addError (makeError "Endpoint cost cannot be negative" ("api." <> category <> "." <> method <> "." <> endpoint.path)) emptyResult
    else emptyResult
  , validateEndpointParams endpoint.params
  ]

validateEndpointParams :: Array ParamDef -> ValidationResult
validateEndpointParams params = foldl combineResults emptyResult (map validateParam params)

validateParam :: ParamDef -> ValidationResult
validateParam param
  | String.length param.name == 0 = addError (makeError "Parameter name cannot be empty" "params") emptyResult
  | otherwise = emptyResult

-- | Validate parsers and cross-reference with API
validateParsers :: Map String ParserDef -> APIDefinition -> ValidationResult
validateParsers parsers api = foldl combineResults emptyResult
  [ validateParserDefinitions parsers
  , validateParserSourceReferences parsers api
  ]

validateParserDefinitions :: Map String ParserDef -> ValidationResult
validateParserDefinitions parsers =
  foldl combineResults emptyResult (map validateParserDef (Map.values parsers))

validateParserDef :: ParserDef -> ValidationResult
validateParserDef parser = foldl combineResults emptyResult
  [ if String.length parser.source == 0
    then addError (makeError ("Parser '" <> parser.name <> "' has no source") ("parsers." <> parser.name)) emptyResult
    else emptyResult
  , validateFieldMappings parser.name parser.mapping
  ]

validateFieldMappings :: String -> Array FieldMapping -> ValidationResult
validateFieldMappings parserName mappings =
  foldl combineResults emptyResult (map (validateFieldMapping parserName) mappings)

validateFieldMapping :: String -> FieldMapping -> ValidationResult
validateFieldMapping parserName mapping = case mapping.mapping of
  PathMapping config ->
    if String.length config.path == 0
    then addError (makeError ("Empty path in mapping for '" <> mapping.targetField <> "'") ("parsers." <> parserName)) emptyResult
    else emptyResult
  ComputeMapping config ->
    validateComputeExpression parserName mapping.targetField config.expression
  MapMapping config ->
    if Map.isEmpty config.valueMap
    then addWarning (makeWarning ("Empty value map for '" <> mapping.targetField <> "'") ("parsers." <> parserName)) emptyResult
    else emptyResult
  ContextMapping key ->
    if String.length key == 0
    then addError (makeError ("Empty context key for '" <> mapping.targetField <> "'") ("parsers." <> parserName)) emptyResult
    else emptyResult
  LiteralMapping _ -> emptyResult
  NullMapping -> emptyResult

validateComputeExpression :: String -> String -> String -> ValidationResult
validateComputeExpression parserName fieldName expr
  | String.length expr == 0 = addError (makeError ("Empty compute expression for '" <> fieldName <> "'") ("parsers." <> parserName)) emptyResult
  | otherwise = emptyResult

validateParserSourceReferences :: Map String ParserDef -> APIDefinition -> ValidationResult
validateParserSourceReferences parsers api =
  -- For each parser, check if its source endpoint exists
  foldl combineResults emptyResult (map (validateSourceReference api) (Map.values parsers))

validateSourceReference :: APIDefinition -> ParserDef -> ValidationResult
validateSourceReference api parser =
  -- Source should match an endpoint path
  -- This is a simplified check - could be more sophisticated
  emptyResult  -- TODO: implement full source validation

-- | Validate error patterns
validateErrors :: Array ErrorPattern -> ValidationResult
validateErrors patterns = foldl combineResults emptyResult (map validateErrorPattern patterns)

validateErrorPattern :: ErrorPattern -> ValidationResult
validateErrorPattern pattern = case pattern.match of
  ExactMatch str ->
    if String.length str == 0
    then addError (makeError "Error match pattern cannot be empty" "errors.patterns") emptyResult
    else emptyResult
  BroadMatch str ->
    if String.length str == 0
    then addError (makeError "Error match pattern cannot be empty" "errors.patterns") emptyResult
    else emptyResult
  CodeMatch code ->
    emptyResult
  RegexMatch regexStr ->
    case regex regexStr noFlags of
      Left _ -> addError (makeError ("Invalid regex pattern: " <> regexStr) "errors.patterns") emptyResult
      Right _ -> emptyResult

-- | Validate overrides
validateOverrides :: Array OverrideDef -> ValidationResult
validateOverrides overrides = foldl combineResults emptyResult (map validateOverride overrides)

validateOverride :: OverrideDef -> ValidationResult
validateOverride override = foldl combineResults emptyResult
  [ if String.length override.method == 0
    then addError (makeError "Override method name cannot be empty" "overrides") emptyResult
    else emptyResult
  , if String.length override.file == 0
    then addError (makeError ("Override for '" <> override.method <> "' must specify a file") "overrides") emptyResult
    else emptyResult
  ]

-- | Cross-validation between different sections
crossValidate :: EDLDocument -> ValidationResult
crossValidate doc = foldl combineResults emptyResult
  [ validateAuthCredentials doc.auth doc.requiredCredentials
  , validateTimeframeOHLCV doc.timeframes doc.has
  , validatePrivateAPICredentials doc.api doc.requiredCredentials
  ]

validateAuthCredentials :: AuthMethod -> RequiredCredentials -> ValidationResult
validateAuthCredentials auth creds = case auth of
  HMACAuth _ ->
    if not creds.apiKey || not creds.secret
    then addWarning (makeWarning "HMAC auth typically requires apiKey and secret" "requiredCredentials") emptyResult
    else emptyResult
  JWTAuth config ->
    case config.keyType of
      PrivateKey ->
        if not creds.privateKey
        then addWarning (makeWarning "JWT with private key should require privateKey credential" "requiredCredentials") emptyResult
        else emptyResult
      _ -> emptyResult
  _ -> emptyResult

validateTimeframeOHLCV :: Maybe TimeframeMap -> Capabilities -> ValidationResult
validateTimeframeOHLCV timeframes caps =
  case timeframes of
    Just tf | not (Map.isEmpty tf) && not (hasCapability caps "fetchOHLCV") ->
      addWarning (makeWarning "Timeframes defined but fetchOHLCV is not enabled" "timeframes") emptyResult
    Nothing | hasCapability caps "fetchOHLCV" ->
      addWarning (makeWarning "fetchOHLCV enabled but no timeframes defined" "timeframes") emptyResult
    _ -> emptyResult

validatePrivateAPICredentials :: APIDefinition -> RequiredCredentials -> ValidationResult
validatePrivateAPICredentials api creds =
  if not (Map.isEmpty api.private) && not creds.apiKey
  then addWarning (makeWarning "Private API endpoints defined but apiKey not required" "requiredCredentials") emptyResult
  else emptyResult

-- | Helper functions
makeError :: String -> String -> ValidationError
makeError msg loc = { message: msg, severity: Error, location: Just loc, suggestion: Nothing }

makeWarning :: String -> String -> ValidationError
makeWarning msg loc = { message: msg, severity: Warning, location: Just loc, suggestion: Nothing }

makeInfo :: String -> String -> ValidationError
makeInfo msg loc = { message: msg, severity: Info, location: Just loc, suggestion: Nothing }

isValidIdentifier :: String -> Boolean
isValidIdentifier str =
  case regex "^[a-z][a-z0-9_]*$" noFlags of
    Left _ -> false
    Right r -> test r str

isValidUrl :: String -> Boolean
isValidUrl str =
  String.take 7 str == "http://" || String.take 8 str == "https://"
