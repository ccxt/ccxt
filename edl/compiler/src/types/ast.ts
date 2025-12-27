/**
 * TypeScript AST Types for Code Generation
 * Represents the structure of generated TypeScript code
 */

// ============================================================
// Top-Level AST Types
// ============================================================

export interface TSFile {
    imports: TSImport[];
    statements: TSStatement[];
}

export interface TSImport {
    names: string[] | '*';
    from: string;
    isType?: boolean;
    alias?: string;
}

export type TSStatement =
    | TSClassDeclaration
    | TSInterfaceDeclaration
    | TSTypeDeclaration
    | TSFunctionDeclaration
    | TSVariableDeclaration
    | TSExportStatement
    | TSReturnStatement
    | TSIfStatement
    | TSSwitchStatement
    | TSForStatement
    | TSForOfStatement
    | TSForInStatement
    | TSWhileStatement
    | TSTryStatement
    | TSThrowStatement
    | TSBlockStatement
    | TSExpressionStatement
    | TSBreakStatement
    | TSContinueStatement;

// ============================================================
// Declaration Types
// ============================================================

export interface TSClassDeclaration {
    kind: 'class';
    name: string;
    extends?: string;
    implements?: string[];
    decorators?: TSDecorator[];
    members: TSClassMember[];
    isExport?: boolean;
    isDefault?: boolean;
}

export interface TSDecorator {
    name: string;
    args?: TSExpression[];
}

export type TSClassMember =
    | TSPropertyDeclaration
    | TSMethodDeclaration
    | TSConstructor
    | TSGetter
    | TSSetter;

export interface TSPropertyDeclaration {
    kind: 'property';
    name: string;
    type?: TSType;
    value?: TSExpression;
    visibility?: 'public' | 'private' | 'protected';
    isStatic?: boolean;
    isReadonly?: boolean;
    isOptional?: boolean;
}

export interface TSMethodDeclaration {
    kind: 'method';
    name: string;
    params: TSParameter[];
    returnType?: TSType;
    body: TSStatement[];
    visibility?: 'public' | 'private' | 'protected';
    isStatic?: boolean;
    isAsync?: boolean;
    isAbstract?: boolean;
    jsDoc?: JSDocComment;
}

export interface TSConstructor {
    kind: 'constructor';
    params: TSParameter[];
    body: TSStatement[];
}

export interface TSGetter {
    kind: 'getter';
    name: string;
    returnType?: TSType;
    body: TSStatement[];
}

export interface TSSetter {
    kind: 'setter';
    name: string;
    param: TSParameter;
    body: TSStatement[];
}

export interface TSParameter {
    name: string;
    type?: TSType;
    default?: TSExpression;
    isOptional?: boolean;
    isRest?: boolean;
    isDestructured?: boolean;  // For destructuring patterns like [key, value]
}

export interface TSInterfaceDeclaration {
    kind: 'interface';
    name: string;
    extends?: string[];
    members: TSInterfaceMember[];
    isExport?: boolean;
}

export interface TSInterfaceMember {
    name: string;
    type: TSType;
    isOptional?: boolean;
    isReadonly?: boolean;
}

export interface TSTypeDeclaration {
    kind: 'type';
    name: string;
    type: TSType;
    isExport?: boolean;
}

export interface TSFunctionDeclaration {
    kind: 'function';
    name: string;
    params: TSParameter[];
    returnType?: TSType;
    body: TSStatement[];
    isAsync?: boolean;
    isExport?: boolean;
}

export interface TSVariableDeclaration {
    kind: 'variable';
    keyword: 'const' | 'let' | 'var';
    name: string;
    type?: TSType;
    value?: TSExpression;
    isExport?: boolean;
}

export interface TSExportStatement {
    kind: 'export';
    names: string[];
    from?: string;
}

// ============================================================
// Type System Types
// ============================================================

export type TSType =
    | TSPrimitiveType
    | TSArrayType
    | TSObjectType
    | TSUnionType
    | TSIntersectionType
    | TSGenericType
    | TSFunctionType
    | TSTupleType
    | TSLiteralType
    | TSKeyofType
    | TSTypeReference;

export interface TSPrimitiveType {
    kind: 'primitive';
    type: 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'void' | 'any' | 'unknown' | 'never' | 'object' | 'bigint' | 'symbol';
}

export interface TSArrayType {
    kind: 'array';
    elementType: TSType;
}

export interface TSObjectType {
    kind: 'object';
    properties: TSInterfaceMember[];
    indexSignature?: {
        keyType: TSType;
        valueType: TSType;
    };
}

export interface TSUnionType {
    kind: 'union';
    types: TSType[];
}

export interface TSIntersectionType {
    kind: 'intersection';
    types: TSType[];
}

export interface TSGenericType {
    kind: 'generic';
    name: string;
    typeArgs: TSType[];
}

export interface TSFunctionType {
    kind: 'functionType';
    params: TSParameter[];
    returnType: TSType;
}

export interface TSTupleType {
    kind: 'tuple';
    elementTypes: TSType[];
}

export interface TSLiteralType {
    kind: 'literal';
    value: string | number | boolean;
}

export interface TSKeyofType {
    kind: 'keyof';
    type: TSType;
}

export interface TSTypeReference {
    kind: 'reference';
    name: string;
    typeArgs?: TSType[];
}

// ============================================================
// Expression Types
// ============================================================

export type TSExpression =
    | TSLiteral
    | TSIdentifier
    | TSBinaryExpression
    | TSUnaryExpression
    | TSCallExpression
    | TSMemberExpression
    | TSObjectExpression
    | TSArrayExpression
    | TSArrowFunction
    | TSRawExpression
    | TSConditionalExpression
    | TSAwaitExpression
    | TSNewExpression
    | TSTemplateLiteral
    | TSAsExpression
    | TSAssignmentExpression
    | TSSpreadElement
    | TSThisExpression
    | TSParenExpression;

export interface TSLiteral {
    kind: 'literal';
    value: string | number | boolean | null | undefined;
}

export interface TSIdentifier {
    kind: 'identifier';
    name: string;
}

export interface TSBinaryExpression {
    kind: 'binary';
    operator: string;
    left: TSExpression;
    right: TSExpression;
}

export interface TSUnaryExpression {
    kind: 'unary';
    operator: string;
    operand: TSExpression;
    prefix?: boolean;
}

export interface TSCallExpression {
    kind: 'call';
    callee: TSExpression;
    args: TSExpression[];
    typeArgs?: TSType[];
}

export interface TSMemberExpression {
    kind: 'member';
    object: TSExpression;
    property: string | TSExpression;
    computed?: boolean;
}

export interface TSObjectExpression {
    kind: 'object';
    properties: TSObjectProperty[];
}

export interface TSObjectProperty {
    key: string | TSExpression;
    value: TSExpression;
    shorthand?: boolean;
    computed?: boolean;
    spread?: boolean;
}

export interface TSArrayExpression {
    kind: 'array';
    elements: TSExpression[];
}

export interface TSArrowFunction {
    kind: 'arrow';
    params: TSParameter[];
    body: TSExpression | TSStatement[];
    returnType?: TSType;
    async?: boolean;
}

export interface TSRawExpression {
    kind: 'raw';
    code: string;
}

export interface TSConditionalExpression {
    kind: 'conditional';
    test: TSExpression;
    consequent: TSExpression;
    alternate: TSExpression;
}

export interface TSAwaitExpression {
    kind: 'await';
    expression: TSExpression;
}

export interface TSNewExpression {
    kind: 'new';
    callee: TSExpression;
    args: TSExpression[];
}

export interface TSTemplateLiteral {
    kind: 'template';
    quasis: string[];
    expressions: TSExpression[];
}

export interface TSAsExpression {
    kind: 'as';
    expression: TSExpression;
    type: TSType;
}

export interface TSAssignmentExpression {
    kind: 'assignment';
    operator: string;
    left: TSExpression;
    right: TSExpression;
}

export interface TSSpreadElement {
    kind: 'spread';
    argument: TSExpression;
}

export interface TSThisExpression {
    kind: 'this';
}

export interface TSParenExpression {
    kind: 'paren';
    expression: TSExpression;
}

// ============================================================
// Statement Types (for method bodies)
// ============================================================

export type TSBodyStatement =
    | TSReturnStatement
    | TSIfStatement
    | TSSwitchStatement
    | TSForStatement
    | TSForOfStatement
    | TSForInStatement
    | TSWhileStatement
    | TSTryStatement
    | TSThrowStatement
    | TSBlockStatement
    | TSExpressionStatement
    | TSVariableDeclaration
    | TSBreakStatement
    | TSContinueStatement;

export interface TSReturnStatement {
    kind: 'return';
    expression?: TSExpression;
}

export interface TSIfStatement {
    kind: 'if';
    test: TSExpression;
    consequent: TSStatement[];
    alternate?: TSStatement[];
}

export interface TSSwitchStatement {
    kind: 'switch';
    discriminant: TSExpression;
    cases: TSSwitchCase[];
}

export interface TSSwitchCase {
    test: TSExpression | null; // null for default case
    consequent: TSStatement[];
}

export interface TSForStatement {
    kind: 'for';
    init?: TSVariableDeclaration | TSExpression;
    test?: TSExpression;
    update?: TSExpression;
    body: TSStatement[];
}

export interface TSForOfStatement {
    kind: 'forOf';
    left: TSVariableDeclaration;
    right: TSExpression;
    body: TSStatement[];
    await?: boolean;
}

export interface TSForInStatement {
    kind: 'forIn';
    left: TSVariableDeclaration;
    right: TSExpression;
    body: TSStatement[];
}

export interface TSWhileStatement {
    kind: 'while';
    test: TSExpression;
    body: TSStatement[];
}

export interface TSTryStatement {
    kind: 'try';
    block: TSStatement[];
    handler?: {
        param: string;
        body: TSStatement[];
    };
    finalizer?: TSStatement[];
}

export interface TSThrowStatement {
    kind: 'throw';
    argument: TSExpression;
}

export interface TSBlockStatement {
    kind: 'block';
    body: TSStatement[];
}

export interface TSExpressionStatement {
    kind: 'expression';
    expression: TSExpression;
}

export interface TSBreakStatement {
    kind: 'break';
    label?: string;
}

export interface TSContinueStatement {
    kind: 'continue';
    label?: string;
}

// ============================================================
// JSDoc Types
// ============================================================

export interface JSDocComment {
    description?: string;
    tags: JSDocTag[];
}

export interface JSDocTag {
    tag: string;
    name?: string;
    type?: string;
    description?: string;
}
