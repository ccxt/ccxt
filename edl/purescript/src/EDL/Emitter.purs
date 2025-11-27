-- | TypeScript Code Emitter
-- |
-- | This module converts TypeScript AST into formatted string output
-- | that matches CCXT's coding conventions.
module EDL.Emitter where

import Prelude

import Data.Maybe (Maybe(..), maybe)
import Data.Array as Array
import Data.String as String
import Data.Foldable (intercalate, foldl)

import CCXT.Types

-- | Indentation configuration
type EmitConfig =
  { indentSize :: Int
  , useTabs :: Boolean
  , lineWidth :: Int
  }

defaultConfig :: EmitConfig
defaultConfig =
  { indentSize: 4
  , useTabs: false
  , lineWidth: 120
  }

-- | Emit a complete TypeScript file
emitFile :: EmitConfig -> TSFile -> String
emitFile cfg file =
  emitImports cfg file.imports
  <> "\n\n"
  <> emitClass cfg file.classDecl
  <> "\n\n"
  <> emitExports cfg file.exports

-- | Emit import statements
emitImports :: EmitConfig -> Array TSImport -> String
emitImports cfg imports =
  String.joinWith "\n" (map emitImport imports)

emitImport :: TSImport -> String
emitImport imp =
  let
    typePrefix = if imp.typeOnly then "import type " else "import "
    defaultPart = maybe "" (\d -> d <> ", ") imp.defaultImport
    namedPart = if Array.null imp.namedImports
                then ""
                else "{ " <> String.joinWith ", " imp.namedImports <> " }"
    fromPart = " from '" <> imp.source <> "';"
  in
    case defaultPart, namedPart of
      "", "" -> typePrefix <> fromPart
      d, "" -> typePrefix <> String.dropRight 2 d <> fromPart
      "", n -> typePrefix <> n <> fromPart
      d, n -> typePrefix <> d <> n <> fromPart

-- | Emit export statements
emitExports :: EmitConfig -> Array TSExport -> String
emitExports cfg exports =
  String.joinWith "\n" (map emitExport exports)

emitExport :: TSExport -> String
emitExport (ExportDefault name) = "export default " <> name <> ";"
emitExport (ExportNamed names) = "export { " <> String.joinWith ", " names <> " };"
emitExport (ExportAll source) = "export * from '" <> source <> "';"

-- | Emit class declaration
emitClass :: EmitConfig -> TSClass -> String
emitClass cfg cls =
  let
    extendsClause = maybe "" (\e -> " extends " <> e) cls.extends
    implementsClause = if Array.null cls.implements
                       then ""
                       else " implements " <> String.joinWith ", " cls.implements
    header = "export default class " <> cls.name <> extendsClause <> implementsClause <> " {"
    properties = String.joinWith "\n" (map (emitProperty cfg 1) cls.properties)
    methods = String.joinWith "\n\n" (map (emitMethod cfg 1) cls.methods)
  in
    header <> "\n"
    <> (if String.null properties then "" else properties <> "\n\n")
    <> methods <> "\n"
    <> "}"

-- | Emit class property
emitProperty :: EmitConfig -> Int -> TSProperty -> String
emitProperty cfg indent prop =
  let
    visibilityStr = maybe "" (\v -> show v <> " ") prop.visibility
    staticStr = if prop.static then "static " else ""
    readonlyStr = if prop.readonly then "readonly " else ""
    typeStr = maybe "" (\t -> ": " <> emitType t) prop.propType
    initStr = maybe "" (\e -> " = " <> emitExpr cfg e) prop.initializer
  in
    ind cfg indent <> visibilityStr <> staticStr <> readonlyStr
    <> prop.name <> typeStr <> initStr <> ";"

-- | Emit method declaration
emitMethod :: EmitConfig -> Int -> TSMethod -> String
emitMethod cfg indent method =
  let
    visibilityStr = maybe "" (\v -> show v <> " ") method.visibility
    staticStr = if method.static then "static " else ""
    asyncStr = if method.async then "async " else ""
    overrideStr = if method.override then "override " else ""
    paramsStr = emitParams cfg method.params
    returnStr = maybe "" (\t -> ": " <> emitType t) method.returnType
    bodyStr = emitBlock cfg (indent + 1) method.body
  in
    ind cfg indent <> visibilityStr <> staticStr <> asyncStr <> overrideStr
    <> method.name <> " (" <> paramsStr <> ")" <> returnStr <> " {\n"
    <> bodyStr
    <> ind cfg indent <> "}"

-- | Emit method parameters
emitParams :: EmitConfig -> Array TSParam -> String
emitParams cfg params =
  String.joinWith ", " (map emitParam params)

emitParam :: TSParam -> String
emitParam param =
  let
    restStr = if param.rest then "..." else ""
    optStr = if param.optional then "?" else ""
    typeStr = maybe "" (\t -> ": " <> emitType t) param.paramType
    defaultStr = maybe "" (\e -> " = " <> emitExpr defaultConfig e) param.defaultValue
  in
    restStr <> param.name <> optStr <> typeStr <> defaultStr

-- | Emit TypeScript type
emitType :: TSType -> String
emitType TSString = "string"
emitType TSNumber = "number"
emitType TSBoolean = "boolean"
emitType TSVoid = "void"
emitType TSNull = "null"
emitType TSUndefined = "undefined"
emitType TSAny = "any"
emitType TSUnknown = "unknown"
emitType TSNever = "never"
emitType (TSObject Nothing) = "object"
emitType (TSObject (Just members)) = "{ " <> String.joinWith "; " (map emitTypeMember members) <> " }"
emitType (TSArray t) = emitType t <> "[]"
emitType (TSDict k v) = "{ [key: " <> emitType k <> "]: " <> emitType v <> " }"
emitType (TSRecord members) = "{ " <> String.joinWith "; " (map emitTypeMember members) <> " }"
emitType (TSTuple types) = "[" <> String.joinWith ", " (map emitType types) <> "]"
emitType (TSUnion types) = String.joinWith " | " (map emitType types)
emitType (TSIntersection types) = String.joinWith " & " (map emitType types)
emitType (TSNullable t) = emitType t <> " | undefined"
emitType (TSRef name) = name
emitType (TSGeneric name args) = name <> "<" <> String.joinWith ", " (map emitType args) <> ">"
emitType (TSPromise t) = "Promise<" <> emitType t <> ">"
emitType (TSFunction params ret) = "(" <> String.joinWith ", " (Array.mapWithIndex (\i t -> "arg" <> show i <> ": " <> emitType t) params) <> ") => " <> emitType ret
emitType (TSLiteral lit) = emitLiteralType lit

emitLiteralType :: TSLiteralType -> String
emitLiteralType (StringLiteral s) = "'" <> s <> "'"
emitLiteralType (NumberLiteral n) = show n
emitLiteralType (BooleanLiteral b) = if b then "true" else "false"

emitTypeMember :: TSTypeMember -> String
emitTypeMember member =
  let
    readonlyStr = if member.readonly then "readonly " else ""
    optStr = if member.optional then "?" else ""
  in
    readonlyStr <> member.name <> optStr <> ": " <> emitType member.memberType

-- | Emit statement block
emitBlock :: EmitConfig -> Int -> Array TSStatement -> String
emitBlock cfg indent stmts =
  String.joinWith "\n" (map (emitStatement cfg indent) stmts)

-- | Emit single statement
emitStatement :: EmitConfig -> Int -> TSStatement -> String
emitStatement cfg indent stmt = case stmt of
  TSVarDecl decl ->
    ind cfg indent <> "var " <> decl.name
    <> maybe "" (\t -> ": " <> emitType t) decl.varType
    <> maybe "" (\e -> " = " <> emitExpr cfg e) decl.initializer
    <> ";"

  TSConstDecl decl ->
    ind cfg indent <> "const " <> decl.name
    <> maybe "" (\t -> ": " <> emitType t) decl.constType
    <> " = " <> emitExpr cfg decl.initializer <> ";"

  TSLetDecl decl ->
    ind cfg indent <> "let " <> decl.name
    <> maybe "" (\t -> ": " <> emitType t) decl.letType
    <> maybe "" (\e -> " = " <> emitExpr cfg e) decl.initializer
    <> ";"

  TSExprStmt expr ->
    ind cfg indent <> emitExpr cfg expr <> ";"

  TSReturn Nothing ->
    ind cfg indent <> "return;"

  TSReturn (Just expr) ->
    ind cfg indent <> "return " <> emitExpr cfg expr <> ";"

  TSIf ifStmt ->
    ind cfg indent <> "if (" <> emitExpr cfg ifStmt.condition <> ") {\n"
    <> emitBlock cfg (indent + 1) ifStmt.thenBranch <> "\n"
    <> ind cfg indent <> "}"
    <> maybe "" (\elseBranch ->
        " else {\n"
        <> emitBlock cfg (indent + 1) elseBranch <> "\n"
        <> ind cfg indent <> "}"
      ) ifStmt.elseBranch

  TSSwitch switchStmt ->
    ind cfg indent <> "switch (" <> emitExpr cfg switchStmt.expr <> ") {\n"
    <> String.joinWith "\n" (map (emitSwitchCase cfg (indent + 1)) switchStmt.cases)
    <> maybe "" (\body ->
        "\n" <> ind cfg (indent + 1) <> "default:\n"
        <> emitBlock cfg (indent + 2) body
      ) switchStmt.defaultCase
    <> "\n" <> ind cfg indent <> "}"

  TSFor forStmt ->
    ind cfg indent <> "for ("
    <> maybe "" (\i -> String.drop (String.length (ind cfg indent)) (emitStatement cfg indent i)) forStmt.init
    <> " "
    <> maybe "" (emitExpr cfg) forStmt.test
    <> "; "
    <> maybe "" (emitExpr cfg) forStmt.update
    <> ") {\n"
    <> emitBlock cfg (indent + 1) forStmt.body <> "\n"
    <> ind cfg indent <> "}"

  TSForOf forOfStmt ->
    ind cfg indent <> "for ("
    <> (if forOfStmt.isConst then "const " else "let ")
    <> forOfStmt.variable <> " of " <> emitExpr cfg forOfStmt.iterable
    <> ") {\n"
    <> emitBlock cfg (indent + 1) forOfStmt.body <> "\n"
    <> ind cfg indent <> "}"

  TSForIn forInStmt ->
    ind cfg indent <> "for ("
    <> (if forInStmt.isConst then "const " else "let ")
    <> forInStmt.variable <> " in " <> emitExpr cfg forInStmt.object
    <> ") {\n"
    <> emitBlock cfg (indent + 1) forInStmt.body <> "\n"
    <> ind cfg indent <> "}"

  TSWhile whileStmt ->
    ind cfg indent <> "while (" <> emitExpr cfg whileStmt.condition <> ") {\n"
    <> emitBlock cfg (indent + 1) whileStmt.body <> "\n"
    <> ind cfg indent <> "}"

  TSTry tryStmt ->
    ind cfg indent <> "try {\n"
    <> emitBlock cfg (indent + 1) tryStmt.tryBlock <> "\n"
    <> ind cfg indent <> "}"
    <> maybe "" (\c ->
        " catch (" <> maybe "e" identity c.param
        <> maybe "" (\t -> ": " <> emitType t) c.paramType
        <> ") {\n"
        <> emitBlock cfg (indent + 1) c.body <> "\n"
        <> ind cfg indent <> "}"
      ) tryStmt.catchClause
    <> maybe "" (\f ->
        " finally {\n"
        <> emitBlock cfg (indent + 1) f <> "\n"
        <> ind cfg indent <> "}"
      ) tryStmt.finallyBlock

  TSThrow expr ->
    ind cfg indent <> "throw " <> emitExpr cfg expr <> ";"

  TSBlock stmts' ->
    ind cfg indent <> "{\n"
    <> emitBlock cfg (indent + 1) stmts' <> "\n"
    <> ind cfg indent <> "}"

  TSBreak ->
    ind cfg indent <> "break;"

  TSContinue ->
    ind cfg indent <> "continue;"

  TSEmpty ->
    ""

  TSComment text ->
    ind cfg indent <> "// " <> text

emitSwitchCase :: EmitConfig -> Int -> SwitchCase -> String
emitSwitchCase cfg indent c =
  ind cfg indent <> "case " <> emitExpr cfg c.test <> ":\n"
  <> emitBlock cfg (indent + 1) c.body
  <> (if c.fallthrough then "" else "\n" <> ind cfg (indent + 1) <> "break;")

-- | Emit expression
emitExpr :: EmitConfig -> TSExpr -> String
emitExpr cfg expr = case expr of
  TSLit lit -> emitLit lit

  TSIdent name -> name

  TSThis -> "this"

  TSSuper -> "super"

  TSMember obj prop ->
    emitExpr cfg obj <> "." <> prop

  TSIndex obj idx ->
    emitExpr cfg obj <> "[" <> emitExpr cfg idx <> "]"

  TSCall callee args ->
    emitExpr cfg callee <> " (" <> String.joinWith ", " (map (emitExpr cfg) args) <> ")"

  TSNew callee args ->
    "new " <> emitExpr cfg callee <> "(" <> String.joinWith ", " (map (emitExpr cfg) args) <> ")"

  TSBinary op left right ->
    emitExpr cfg left <> " " <> emitBinaryOp op <> " " <> emitExpr cfg right

  TSUnary op operand ->
    emitUnaryOp op <> emitExpr cfg operand

  TSConditional cond thenExpr elseExpr ->
    emitExpr cfg cond <> " ? " <> emitExpr cfg thenExpr <> " : " <> emitExpr cfg elseExpr

  TSAssign target value ->
    emitExpr cfg target <> " = " <> emitExpr cfg value

  TSCompoundAssign op target value ->
    emitExpr cfg target <> " " <> emitCompoundOp op <> " " <> emitExpr cfg value

  TSArrowFn params (Left expr') ->
    "(" <> emitParams cfg params <> ") => " <> emitExpr cfg expr'

  TSArrowFn params (Right stmts) ->
    "(" <> emitParams cfg params <> ") => {\n"
    <> emitBlock cfg 1 stmts <> "\n}"

  TSFunction name params stmts ->
    "function " <> maybe "" identity name
    <> "(" <> emitParams cfg params <> ") {\n"
    <> emitBlock cfg 1 stmts <> "\n}"

  TSArrayLit elements ->
    "[" <> String.joinWith ", " (map (emitExpr cfg) elements) <> "]"

  TSObjectLit props ->
    if Array.null props
    then "{}"
    else "{\n" <> String.joinWith ",\n" (map (emitObjectProp cfg 1) props) <> "\n}"

  TSTemplateLit elements ->
    "`" <> String.joinWith "" (map emitTemplateElement elements) <> "`"

  TSAwait expr' ->
    "await " <> emitExpr cfg expr'

  TSTypeAssertion expr' type' ->
    emitExpr cfg expr' <> " as " <> emitType type'

  TSNonNull expr' ->
    emitExpr cfg expr' <> "!"

  TSOptionalChain obj prop ->
    emitExpr cfg obj <> "?." <> prop

  TSNullishCoalesce left right ->
    emitExpr cfg left <> " ?? " <> emitExpr cfg right

  TSSpread expr' ->
    "..." <> emitExpr cfg expr'

  TSTypeof expr' ->
    "typeof " <> emitExpr cfg expr'

  TSInstanceof expr' type' ->
    emitExpr cfg expr' <> " instanceof " <> emitType type'

  TSIn prop obj ->
    "'" <> prop <> "' in " <> emitExpr cfg obj

  TSDelete expr' ->
    "delete " <> emitExpr cfg expr'

  TSVoid expr' ->
    "void " <> emitExpr cfg expr'

  TSParens expr' ->
    "(" <> emitExpr cfg expr' <> ")"

  TSComma exprs ->
    String.joinWith ", " (map (emitExpr cfg) exprs)

-- | Emit literal
emitLit :: TSLit -> String
emitLit (LitString s) = "'" <> escapeString s <> "'"
emitLit (LitNumber n) = show n
emitLit (LitBigInt s) = s <> "n"
emitLit (LitBoolean b) = if b then "true" else "false"
emitLit LitNull = "null"
emitLit LitUndefined = "undefined"
emitLit (LitRegex pattern flags) = "/" <> pattern <> "/" <> flags

-- | Emit object property
emitObjectProp :: EmitConfig -> Int -> TSObjectProp -> String
emitObjectProp cfg indent prop = case prop of
  PropValue name value ->
    ind cfg indent <> "'" <> name <> "': " <> emitExpr cfg value

  PropShorthand name ->
    ind cfg indent <> name

  PropComputed key value ->
    ind cfg indent <> "[" <> emitExpr cfg key <> "]: " <> emitExpr cfg value

  PropSpread expr ->
    ind cfg indent <> "..." <> emitExpr cfg expr

  PropMethod method ->
    ind cfg indent <> (if method.async then "async " else "")
    <> method.name <> " (" <> emitParams cfg method.params <> ") {\n"
    <> emitBlock cfg (indent + 1) method.body <> "\n"
    <> ind cfg indent <> "}"

  PropGetter name body ->
    ind cfg indent <> "get " <> name <> " () {\n"
    <> emitBlock cfg (indent + 1) body <> "\n"
    <> ind cfg indent <> "}"

  PropSetter name param body ->
    ind cfg indent <> "set " <> name <> " (" <> param <> ") {\n"
    <> emitBlock cfg (indent + 1) body <> "\n"
    <> ind cfg indent <> "}"

emitTemplateElement :: TemplateElement -> String
emitTemplateElement (TemplateString s) = s
emitTemplateElement (TemplateExpr e) = "${" <> emitExpr defaultConfig e <> "}"

-- | Emit binary operator
emitBinaryOp :: BinaryOp -> String
emitBinaryOp OpAdd = "+"
emitBinaryOp OpSub = "-"
emitBinaryOp OpMul = "*"
emitBinaryOp OpDiv = "/"
emitBinaryOp OpMod = "%"
emitBinaryOp OpPow = "**"
emitBinaryOp OpEq = "=="
emitBinaryOp OpNeq = "!="
emitBinaryOp OpStrictEq = "==="
emitBinaryOp OpStrictNeq = "!=="
emitBinaryOp OpLt = "<"
emitBinaryOp OpLte = "<="
emitBinaryOp OpGt = ">"
emitBinaryOp OpGte = ">="
emitBinaryOp OpAnd = "&&"
emitBinaryOp OpOr = "||"
emitBinaryOp OpBitAnd = "&"
emitBinaryOp OpBitOr = "|"
emitBinaryOp OpBitXor = "^"
emitBinaryOp OpShl = "<<"
emitBinaryOp OpShr = ">>"
emitBinaryOp OpUShr = ">>>"

-- | Emit unary operator
emitUnaryOp :: UnaryOp -> String
emitUnaryOp OpNeg = "-"
emitUnaryOp OpPos = "+"
emitUnaryOp OpNot = "!"
emitUnaryOp OpBitNot = "~"
emitUnaryOp OpPreInc = "++"
emitUnaryOp OpPreDec = "--"
emitUnaryOp OpPostInc = "++"
emitUnaryOp OpPostDec = "--"

-- | Emit compound assignment operator
emitCompoundOp :: CompoundOp -> String
emitCompoundOp OpAddAssign = "+="
emitCompoundOp OpSubAssign = "-="
emitCompoundOp OpMulAssign = "*="
emitCompoundOp OpDivAssign = "/="
emitCompoundOp OpModAssign = "%="
emitCompoundOp OpPowAssign = "**="
emitCompoundOp OpAndAssign = "&&="
emitCompoundOp OpOrAssign = "||="
emitCompoundOp OpNullishAssign = "??="
emitCompoundOp OpBitAndAssign = "&="
emitCompoundOp OpBitOrAssign = "|="
emitCompoundOp OpBitXorAssign = "^="
emitCompoundOp OpShlAssign = "<<="
emitCompoundOp OpShrAssign = ">>="
emitCompoundOp OpUShrAssign = ">>>="

-- | Generate indentation
ind :: EmitConfig -> Int -> String
ind cfg level =
  let spaces = String.joinWith "" (Array.replicate (cfg.indentSize * level) " ")
  in if cfg.useTabs
     then String.joinWith "" (Array.replicate level "\t")
     else spaces

-- | Escape string for output
escapeString :: String -> String
escapeString s = foldl replaceChar s escapeChars
  where
    escapeChars = [Tuple "\\" "\\\\", Tuple "'" "\\'", Tuple "\n" "\\n", Tuple "\r" "\\r", Tuple "\t" "\\t"]
    replaceChar str (Tuple from to) = String.replaceAll (String.Pattern from) (String.Replacement to) str

-- | Identity function
identity :: forall a. a -> a
identity a = a
