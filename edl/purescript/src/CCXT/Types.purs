-- | TypeScript AST Types for Code Generation
-- |
-- | This module defines PureScript representations of TypeScript AST elements
-- | that will be emitted by the code generator. The types are designed to
-- | produce idiomatic CCXT-style TypeScript code.
module CCXT.Types where

import Prelude

import Data.Maybe (Maybe)
import Data.Array (Array)
import Data.Map (Map)

-- | A complete TypeScript file
type TSFile =
  { imports :: Array TSImport
  , exports :: Array TSExport
  , classDecl :: TSClass
  }

-- | Import statement
type TSImport =
  { source :: String
  , defaultImport :: Maybe String
  , namedImports :: Array String
  , typeOnly :: Boolean
  }

-- | Export statement
data TSExport
  = ExportDefault String
  | ExportNamed (Array String)
  | ExportAll String

-- | Class declaration (exchange class)
type TSClass =
  { name :: String
  , extends :: Maybe String
  , implements :: Array String
  , properties :: Array TSProperty
  , methods :: Array TSMethod
  }

-- | Class property
type TSProperty =
  { name :: String
  , propType :: TSType
  , visibility :: Visibility
  , static :: Boolean
  , readonly :: Boolean
  , initializer :: Maybe TSExpr
  }

-- | Visibility modifier
data Visibility
  = Public
  | Protected
  | Private

derive instance eqVisibility :: Eq Visibility

instance showVisibility :: Show Visibility where
  show Public = "public"
  show Protected = "protected"
  show Private = "private"

-- | Method declaration
type TSMethod =
  { name :: String
  , async :: Boolean
  , params :: Array TSParam
  , returnType :: Maybe TSType
  , body :: Array TSStatement
  , visibility :: Maybe Visibility
  , static :: Boolean
  , override :: Boolean
  }

-- | Method parameter
type TSParam =
  { name :: String
  , paramType :: Maybe TSType
  , defaultValue :: Maybe TSExpr
  , optional :: Boolean
  , rest :: Boolean
  }

-- | TypeScript types
data TSType
  = TSString
  | TSNumber
  | TSBoolean
  | TSVoid
  | TSNull
  | TSUndefined
  | TSAny
  | TSUnknown
  | TSNever
  | TSObject (Maybe (Array TSTypeMember))
  | TSArray TSType
  | TSDict TSType TSType
  | TSRecord (Array (TSTypeMember))
  | TSTuple (Array TSType)
  | TSUnion (Array TSType)
  | TSIntersection (Array TSType)
  | TSNullable TSType
  | TSRef String
  | TSGeneric String (Array TSType)
  | TSPromise TSType
  | TSFunction (Array TSType) TSType
  | TSLiteral TSLiteralType

derive instance eqTSType :: Eq TSType

-- | Object type member
type TSTypeMember =
  { name :: String
  , memberType :: TSType
  , optional :: Boolean
  , readonly :: Boolean
  }

-- | Literal types
data TSLiteralType
  = StringLiteral String
  | NumberLiteral Number
  | BooleanLiteral Boolean

derive instance eqTSLiteralType :: Eq TSLiteralType

-- | TypeScript statements
data TSStatement
  = TSVarDecl VarDecl
  | TSConstDecl ConstDecl
  | TSLetDecl LetDecl
  | TSExprStmt TSExpr
  | TSReturn (Maybe TSExpr)
  | TSIf IfStmt
  | TSSwitch SwitchStmt
  | TSFor ForStmt
  | TSForOf ForOfStmt
  | TSForIn ForInStmt
  | TSWhile WhileStmt
  | TSTry TryStmt
  | TSThrow TSExpr
  | TSBlock (Array TSStatement)
  | TSBreak
  | TSContinue
  | TSEmpty
  | TSComment String

-- | Variable declaration (var)
type VarDecl =
  { name :: String
  , varType :: Maybe TSType
  , initializer :: Maybe TSExpr
  }

-- | Const declaration
type ConstDecl =
  { name :: String
  , constType :: Maybe TSType
  , initializer :: TSExpr
  }

-- | Let declaration
type LetDecl =
  { name :: String
  , letType :: Maybe TSType
  , initializer :: Maybe TSExpr
  }

-- | If statement
type IfStmt =
  { condition :: TSExpr
  , thenBranch :: Array TSStatement
  , elseBranch :: Maybe (Array TSStatement)
  }

-- | Switch statement
type SwitchStmt =
  { expr :: TSExpr
  , cases :: Array SwitchCase
  , defaultCase :: Maybe (Array TSStatement)
  }

type SwitchCase =
  { test :: TSExpr
  , body :: Array TSStatement
  , fallthrough :: Boolean
  }

-- | For loop
type ForStmt =
  { init :: Maybe TSStatement
  , test :: Maybe TSExpr
  , update :: Maybe TSExpr
  , body :: Array TSStatement
  }

-- | For-of loop
type ForOfStmt =
  { variable :: String
  , iterable :: TSExpr
  , body :: Array TSStatement
  , isConst :: Boolean
  }

-- | For-in loop
type ForInStmt =
  { variable :: String
  , object :: TSExpr
  , body :: Array TSStatement
  , isConst :: Boolean
  }

-- | While loop
type WhileStmt =
  { condition :: TSExpr
  , body :: Array TSStatement
  }

-- | Try-catch-finally
type TryStmt =
  { tryBlock :: Array TSStatement
  , catchClause :: Maybe CatchClause
  , finallyBlock :: Maybe (Array TSStatement)
  }

type CatchClause =
  { param :: Maybe String
  , paramType :: Maybe TSType
  , body :: Array TSStatement
  }

-- | TypeScript expressions
data TSExpr
  = TSLit TSLit
  | TSIdent String
  | TSThis
  | TSSuper
  | TSMember TSExpr String
  | TSIndex TSExpr TSExpr
  | TSCall TSExpr (Array TSExpr)
  | TSNew TSExpr (Array TSExpr)
  | TSBinary BinaryOp TSExpr TSExpr
  | TSUnary UnaryOp TSExpr
  | TSConditional TSExpr TSExpr TSExpr
  | TSAssign TSExpr TSExpr
  | TSCompoundAssign CompoundOp TSExpr TSExpr
  | TSArrowFn (Array TSParam) (Either TSExpr (Array TSStatement))
  | TSFunction (Maybe String) (Array TSParam) (Array TSStatement)
  | TSArrayLit (Array TSExpr)
  | TSObjectLit (Array TSObjectProp)
  | TSTemplateLit (Array TemplateElement)
  | TSAwait TSExpr
  | TSTypeAssertion TSExpr TSType
  | TSNonNull TSExpr
  | TSOptionalChain TSExpr String
  | TSNullishCoalesce TSExpr TSExpr
  | TSSpread TSExpr
  | TSTypeof TSExpr
  | TSInstanceof TSExpr TSType
  | TSIn String TSExpr
  | TSDelete TSExpr
  | TSVoid TSExpr
  | TSParens TSExpr
  | TSComma (Array TSExpr)

-- | Binary operators
data BinaryOp
  = OpAdd
  | OpSub
  | OpMul
  | OpDiv
  | OpMod
  | OpPow
  | OpEq
  | OpNeq
  | OpStrictEq
  | OpStrictNeq
  | OpLt
  | OpLte
  | OpGt
  | OpGte
  | OpAnd
  | OpOr
  | OpBitAnd
  | OpBitOr
  | OpBitXor
  | OpShl
  | OpShr
  | OpUShr

derive instance eqBinaryOp :: Eq BinaryOp

-- | Unary operators
data UnaryOp
  = OpNeg
  | OpPos
  | OpNot
  | OpBitNot
  | OpPreInc
  | OpPreDec
  | OpPostInc
  | OpPostDec

derive instance eqUnaryOp :: Eq UnaryOp

-- | Compound assignment operators
data CompoundOp
  = OpAddAssign
  | OpSubAssign
  | OpMulAssign
  | OpDivAssign
  | OpModAssign
  | OpPowAssign
  | OpAndAssign
  | OpOrAssign
  | OpNullishAssign
  | OpBitAndAssign
  | OpBitOrAssign
  | OpBitXorAssign
  | OpShlAssign
  | OpShrAssign
  | OpUShrAssign

derive instance eqCompoundOp :: Eq CompoundOp

-- | Literal values
data TSLit
  = LitString String
  | LitNumber Number
  | LitBigInt String
  | LitBoolean Boolean
  | LitNull
  | LitUndefined
  | LitRegex String String

-- | Object property in literal
data TSObjectProp
  = PropValue String TSExpr
  | PropShorthand String
  | PropComputed TSExpr TSExpr
  | PropSpread TSExpr
  | PropMethod TSMethod
  | PropGetter String (Array TSStatement)
  | PropSetter String String (Array TSStatement)

-- | Template literal element
data TemplateElement
  = TemplateString String
  | TemplateExpr TSExpr

-- | CCXT-specific type aliases for common patterns
type TSMarket = TSRef "Market"
type TSTicker = TSRef "Ticker"
type TSOrder = TSRef "Order"
type TSTrade = TSRef "Trade"
type TSBalance = TSRef "Balances"
type TSOHLCV = TSRef "OHLCV"
type TSOrderBook = TSRef "OrderBook"
type TSCurrency = TSRef "Currency"
type TSPosition = TSRef "Position"

-- | Common CCXT method signatures
ccxtFetchTickerSig :: TSMethod
ccxtFetchTickerSig =
  { name: "fetchTicker"
  , async: true
  , params:
      [ { name: "symbol", paramType: Just TSString, defaultValue: Nothing, optional: false, rest: false }
      , { name: "params", paramType: Just (TSObject Nothing), defaultValue: Just (TSObjectLit []), optional: true, rest: false }
      ]
  , returnType: Just (TSPromise (TSRef "Ticker"))
  , body: []
  , visibility: Just Public
  , static: false
  , override: false
  }

ccxtCreateOrderSig :: TSMethod
ccxtCreateOrderSig =
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
  , body: []
  , visibility: Just Public
  , static: false
  , override: false
  }

-- | Common describe() method return type
type DescribeReturn =
  { id :: String
  , name :: String
  , countries :: Array String
  , rateLimit :: Int
  , certified :: Boolean
  , pro :: Boolean
  , has :: Map String (Maybe Boolean)
  , timeframes :: Maybe (Map String String)
  , urls :: URLsDescribe
  , api :: APIDescribe
  , fees :: Maybe FeesDescribe
  }

type URLsDescribe =
  { logo :: Maybe String
  , api :: Map String String
  , test :: Maybe (Map String String)
  , www :: String
  , doc :: Array String
  }

type APIDescribe = Map String (Map String (Map String APIEndpointCost))

type APIEndpointCost = { cost :: Number, byLimit :: Maybe (Array (Array Number)) }

type FeesDescribe =
  { trading :: TradingFeesDescribe
  }

type TradingFeesDescribe =
  { tierBased :: Boolean
  , percentage :: Boolean
  , taker :: Number
  , maker :: Number
  }

-- | Either type for arrow function bodies
data Either a b = Left a | Right b
