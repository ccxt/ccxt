-- | CLI Entry Point for EDL Compiler
-- |
-- | Usage: edl-compile <input.edl.yaml> [--out <dir>] [--validate-only]
module Main where

import Prelude

import Effect (Effect)
import Effect.Console (log, error)
import Effect.Aff (Aff, launchAff_, attempt)
import Effect.Class (liftEffect)
import Data.Either (Either(..), either)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Array as Array
import Data.Traversable (traverse, traverse_)
import Data.String as String
import Node.Process (argv, exit)
import Node.Path (basename, dirname, extname)
import Node.FS.Aff (readTextFile, writeTextFile, exists, mkdir')
import Node.Encoding (Encoding(..))
import Foreign (Foreign)

import EDL.Types (EDLDocument, ParseError, ValidationError, Severity(..))
import EDL.Parser (parseEDLDocument)
import EDL.Analyzer (analyzeDocument, ValidationResult)
import EDL.Generator (generateExchange)
import EDL.Emitter (emitFile, defaultConfig)

-- | CLI options
type Options =
  { inputFiles :: Array String
  , outputDir :: String
  , validateOnly :: Boolean
  , verbose :: Boolean
  , help :: Boolean
  }

defaultOptions :: Options
defaultOptions =
  { inputFiles: []
  , outputDir: "ts/src/"
  , validateOnly: false
  , verbose: false
  , help: false
  }

-- | Parse command line arguments
parseArgs :: Array String -> Options
parseArgs args = go defaultOptions (Array.drop 2 args)  -- Drop node and script path
  where
    go opts arr = case Array.uncons arr of
      Nothing -> opts
      Just { head: "--out", tail } ->
        case Array.uncons tail of
          Just { head: dir, tail: rest } -> go (opts { outputDir = dir }) rest
          Nothing -> opts
      Just { head: "--validate-only", tail } ->
        go (opts { validateOnly = true }) tail
      Just { head: "-v", tail } ->
        go (opts { verbose = true }) tail
      Just { head: "--verbose", tail } ->
        go (opts { verbose = true }) tail
      Just { head: "-h", tail } ->
        go (opts { help = true }) tail
      Just { head: "--help", tail } ->
        go (opts { help = true }) tail
      Just { head: file, tail } ->
        if String.take 1 file == "-"
        then go opts tail  -- Skip unknown flags
        else go (opts { inputFiles = Array.snoc opts.inputFiles file }) tail

-- | Main entry point
main :: Effect Unit
main = launchAff_ do
  args <- liftEffect argv
  let opts = parseArgs args

  if opts.help || Array.null opts.inputFiles
    then liftEffect printHelp
    else compileFiles opts

-- | Print help message
printHelp :: Effect Unit
printHelp = do
  log "EDL Compiler - Exchange Definition Language to TypeScript"
  log ""
  log "Usage: edl-compile <input.edl.yaml> [options]"
  log ""
  log "Options:"
  log "  --out <dir>       Output directory (default: ts/src/)"
  log "  --validate-only   Only validate, don't generate code"
  log "  -v, --verbose     Verbose output"
  log "  -h, --help        Show this help message"
  log ""
  log "Examples:"
  log "  edl-compile edl/exchanges/binance.edl.yaml"
  log "  edl-compile edl/exchanges/*.edl.yaml --out ts/src/"
  log "  edl-compile edl/exchanges/kraken.edl.yaml --validate-only"

-- | Compile all input files
compileFiles :: Options -> Aff Unit
compileFiles opts = do
  results <- traverse (compileFile opts) opts.inputFiles
  let failures = Array.length (Array.filter not results)
  when (failures > 0) do
    liftEffect $ error $ "\n" <> show failures <> " file(s) failed to compile"
    liftEffect $ exit 1

-- | Compile a single EDL file
compileFile :: Options -> String -> Aff Boolean
compileFile opts inputPath = do
  liftEffect $ log $ "Processing: " <> inputPath

  -- Read input file
  contentResult <- attempt $ readTextFile UTF8 inputPath
  case contentResult of
    Left err -> do
      liftEffect $ error $ "  Error reading file: " <> show err
      pure false
    Right content -> do
      -- Parse YAML
      case parseYAML content of
        Left parseErrors -> do
          liftEffect $ printParseErrors parseErrors
          pure false
        Right yaml -> do
          -- Parse EDL document
          case parseEDLDocument yaml of
            Left parseErrors -> do
              liftEffect $ printParseErrors parseErrors
              pure false
            Right doc -> do
              -- Validate document
              let validation = analyzeDocument doc
              liftEffect $ printValidation opts validation

              if hasErrors validation
                then pure false
                else if opts.validateOnly
                  then do
                    liftEffect $ log "  Validation passed"
                    pure true
                  else do
                    -- Generate TypeScript
                    let tsFile = generateExchange doc
                    let tsCode = emitFile defaultConfig tsFile

                    -- Write output file
                    let outputPath = opts.outputDir <> doc.exchange.id <> ".ts"
                    ensureDir (dirname outputPath)
                    writeTextFile UTF8 outputPath tsCode
                    liftEffect $ log $ "  Generated: " <> outputPath
                    pure true

-- | Parse YAML content to Foreign
parseYAML :: String -> Either (Array ParseError) Foreign
parseYAML content =
  -- This would use yoga-yaml in real implementation
  -- For now, return a placeholder error
  Left [{ message: "YAML parsing not yet implemented - use JS FFI", line: Just 1, column: Nothing, path: [] }]

-- | Print parse errors
printParseErrors :: Array ParseError -> Effect Unit
printParseErrors errors = do
  error "  Parse errors:"
  traverse_ printParseError errors

printParseError :: ParseError -> Effect Unit
printParseError err = do
  let location = case err.line of
        Just l -> " (line " <> show l <> ")"
        Nothing -> ""
  let path = if Array.null err.path
             then ""
             else " at " <> String.joinWith "." err.path
  error $ "    - " <> err.message <> path <> location

-- | Print validation results
printValidation :: Options -> ValidationResult -> Effect Unit
printValidation opts result = do
  when (opts.verbose || not (Array.null result.errors)) do
    traverse_ (printValidationError "ERROR") result.errors
  when opts.verbose do
    traverse_ (printValidationError "WARN") result.warnings
    traverse_ (printValidationError "INFO") result.info

printValidationError :: String -> ValidationError -> Effect Unit
printValidationError level err = do
  let location = fromMaybe "" err.location
  let msg = "  [" <> level <> "] " <> err.message
        <> (if String.null location then "" else " (" <> location <> ")")
  case err.severity of
    Error -> error msg
    Warning -> log msg
    Info -> log msg

-- | Check if validation has errors
hasErrors :: ValidationResult -> Boolean
hasErrors result = not (Array.null result.errors)

-- | Ensure directory exists
ensureDir :: String -> Aff Unit
ensureDir dir = do
  dirExists <- exists dir
  unless dirExists do
    mkdir' dir { recursive: true, mode: 493 }  -- 0755 in octal

-- FFI for YAML parsing (to be implemented)
foreign import parseYAMLImpl :: String -> Effect Foreign
