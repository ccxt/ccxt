/**
 * Safe Expression Evaluator
 *
 * Provides a secure sandbox for evaluating expressions without using eval().
 * Supports math operations, string functions, and type conversions with
 * security measures like whitelisting, depth limits, and timeouts.
 */

/**
 * Context for expression evaluation
 */
export interface ExpressionContext {
    /** Variables available in the expression */
    variables: Record<string, any>;
    /** Custom functions available in the expression */
    functions: Record<string, Function>;
    /** Maximum recursion depth (default: 100) */
    maxDepth?: number;
    /** Execution timeout in milliseconds (default: 1000) */
    timeout?: number;
}

/**
 * Result of expression evaluation
 */
export interface ExpressionResult {
    /** The evaluated value */
    value: any;
    /** The type of the value */
    type: string;
    /** Error message if evaluation failed */
    error?: string;
}

/**
 * Token types for expression parsing
 */
enum TokenType {
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    NULL = 'NULL',
    UNDEFINED = 'UNDEFINED',
    IDENTIFIER = 'IDENTIFIER',
    OPERATOR = 'OPERATOR',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    LBRACKET = 'LBRACKET',
    RBRACKET = 'RBRACKET',
    DOT = 'DOT',
    COMMA = 'COMMA',
    QUESTION = 'QUESTION',
    COLON = 'COLON',
    EOF = 'EOF'
}

interface Token {
    type: TokenType;
    value: any;
    position: number;
}

/**
 * Safe Expression Evaluator
 *
 * Evaluates expressions without using eval() by parsing and executing
 * a safe subset of JavaScript-like syntax.
 */
export class SafeExpressionEvaluator {
    private context: ExpressionContext;
    private builtinFunctions: Record<string, Function>;
    private depth: number = 0;
    private startTime: number = 0;

    constructor(context: Partial<ExpressionContext> = {}) {
        this.context = {
            variables: context.variables || {},
            functions: context.functions || {},
            maxDepth: context.maxDepth || 100,
            timeout: context.timeout || 1000
        };

        this.builtinFunctions = this.createBuiltinFunctions();
    }

    /**
     * Evaluate an expression and return the result
     */
    evaluate(expression: string): ExpressionResult {
        this.depth = 0;
        this.startTime = Date.now();

        try {
            const tokens = this.tokenize(expression);
            const ast = this.parse(tokens);
            const value = this.executeNode(ast);

            return {
                value,
                type: this.getType(value)
            };
        } catch (error) {
            return {
                value: undefined,
                type: 'undefined',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Register a custom function
     */
    registerFunction(name: string, fn: Function): void {
        // Security: prevent overriding built-in functions
        if (this.builtinFunctions.hasOwnProperty(name)) {
            throw new Error(`Cannot override built-in function: ${name}`);
        }
        this.context.functions[name] = fn;
    }

    /**
     * Set a variable in the context
     */
    setVariable(name: string, value: any): void {
        this.context.variables[name] = value;
    }

    /**
     * Tokenize the expression
     */
    private tokenize(expression: string): Token[] {
        const tokens: Token[] = [];
        let position = 0;

        while (position < expression.length) {
            const char = expression[position];

            // Skip whitespace
            if (/\s/.test(char)) {
                position++;
                continue;
            }

            // Numbers
            if (/\d/.test(char) || (char === '.' && /\d/.test(expression[position + 1]))) {
                let num = '';
                while (position < expression.length && /[\d.]/.test(expression[position])) {
                    num += expression[position++];
                }
                tokens.push({ type: TokenType.NUMBER, value: parseFloat(num), position });
                continue;
            }

            // Strings
            if (char === '"' || char === "'") {
                const quote = char;
                let str = '';
                position++; // Skip opening quote
                while (position < expression.length && expression[position] !== quote) {
                    if (expression[position] === '\\' && position + 1 < expression.length) {
                        position++; // Skip escape character
                        const escaped = expression[position];
                        str += escaped === 'n' ? '\n' : escaped === 't' ? '\t' : escaped;
                    } else {
                        str += expression[position];
                    }
                    position++;
                }
                if (position >= expression.length) {
                    throw new Error('Unterminated string');
                }
                position++; // Skip closing quote
                tokens.push({ type: TokenType.STRING, value: str, position });
                continue;
            }

            // Identifiers and keywords
            if (/[a-zA-Z_$]/.test(char)) {
                let identifier = '';
                while (position < expression.length && /[a-zA-Z0-9_$]/.test(expression[position])) {
                    identifier += expression[position++];
                }

                // Keywords
                if (identifier === 'true' || identifier === 'false') {
                    tokens.push({ type: TokenType.BOOLEAN, value: identifier === 'true', position });
                } else if (identifier === 'null') {
                    tokens.push({ type: TokenType.NULL, value: null, position });
                } else if (identifier === 'undefined') {
                    tokens.push({ type: TokenType.UNDEFINED, value: undefined, position });
                } else {
                    tokens.push({ type: TokenType.IDENTIFIER, value: identifier, position });
                }
                continue;
            }

            // Operators (multi-character)
            const twoChar = expression.substr(position, 2);
            if (['==', '!=', '<=', '>=', '&&', '||', '??'].includes(twoChar)) {
                tokens.push({ type: TokenType.OPERATOR, value: twoChar, position });
                position += 2;
                continue;
            }

            // Single-character tokens
            const singleCharTokens: Record<string, TokenType> = {
                '(': TokenType.LPAREN,
                ')': TokenType.RPAREN,
                '[': TokenType.LBRACKET,
                ']': TokenType.RBRACKET,
                '.': TokenType.DOT,
                ',': TokenType.COMMA,
                '?': TokenType.QUESTION,
                ':': TokenType.COLON
            };

            if (singleCharTokens[char]) {
                tokens.push({ type: singleCharTokens[char], value: char, position });
                position++;
                continue;
            }

            // Operators (single-character)
            if (['+', '-', '*', '/', '%', '<', '>', '!'].includes(char)) {
                tokens.push({ type: TokenType.OPERATOR, value: char, position });
                position++;
                continue;
            }

            throw new Error(`Unexpected character: ${char} at position ${position}`);
        }

        tokens.push({ type: TokenType.EOF, value: null, position });
        return tokens;
    }

    /**
     * Parse tokens into an AST
     */
    private parse(tokens: Token[]): any {
        let currentToken = 0;

        const peek = (): Token => tokens[currentToken];
        const consume = (): Token => tokens[currentToken++];
        const expect = (type: TokenType): Token => {
            const token = consume();
            if (token.type !== type) {
                throw new Error(`Expected ${type} but got ${token.type}`);
            }
            return token;
        };

        const parseExpression = (): any => parseTernary();

        const parseTernary = (): any => {
            let node = parseNullCoalescing();

            if (peek().type === TokenType.QUESTION) {
                consume(); // ?
                const consequent = parseExpression();
                expect(TokenType.COLON);
                const alternate = parseExpression();
                node = { type: 'Conditional', test: node, consequent, alternate };
            }

            return node;
        };

        const parseNullCoalescing = (): any => {
            let node = parseLogicalOr();

            while (peek().value === '??') {
                const operator = consume().value;
                const right = parseLogicalOr();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseLogicalOr = (): any => {
            let node = parseLogicalAnd();

            while (peek().value === '||') {
                const operator = consume().value;
                const right = parseLogicalAnd();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseLogicalAnd = (): any => {
            let node = parseEquality();

            while (peek().value === '&&') {
                const operator = consume().value;
                const right = parseEquality();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseEquality = (): any => {
            let node = parseRelational();

            while (['==', '!='].includes(peek().value)) {
                const operator = consume().value;
                const right = parseRelational();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseRelational = (): any => {
            let node = parseAdditive();

            while (['<', '>', '<=', '>='].includes(peek().value)) {
                const operator = consume().value;
                const right = parseAdditive();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseAdditive = (): any => {
            let node = parseMultiplicative();

            while (['+', '-'].includes(peek().value)) {
                const operator = consume().value;
                const right = parseMultiplicative();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseMultiplicative = (): any => {
            let node = parseUnary();

            while (['*', '/', '%'].includes(peek().value)) {
                const operator = consume().value;
                const right = parseUnary();
                node = { type: 'BinaryOp', operator, left: node, right };
            }

            return node;
        };

        const parseUnary = (): any => {
            if (['!', '-'].includes(peek().value)) {
                const operator = consume().value;
                const argument = parseUnary();
                return { type: 'UnaryOp', operator, argument };
            }

            return parsePostfix();
        };

        const parsePostfix = (): any => {
            let node = parsePrimary();

            while (true) {
                if (peek().type === TokenType.DOT) {
                    consume(); // .
                    const property = expect(TokenType.IDENTIFIER).value;
                    node = { type: 'MemberAccess', object: node, property };
                } else if (peek().type === TokenType.LBRACKET) {
                    consume(); // [
                    const index = parseExpression();
                    expect(TokenType.RBRACKET);
                    node = { type: 'IndexAccess', object: node, index };
                } else if (peek().type === TokenType.LPAREN) {
                    consume(); // (
                    const args: any[] = [];
                    while (peek().type !== TokenType.RPAREN) {
                        args.push(parseExpression());
                        if (peek().type === TokenType.COMMA) {
                            consume();
                        }
                    }
                    expect(TokenType.RPAREN);

                    if (node.type !== 'Identifier') {
                        throw new Error('Only identifiers can be called as functions');
                    }
                    node = { type: 'FunctionCall', name: node.value, arguments: args };
                } else {
                    break;
                }
            }

            return node;
        };

        const parsePrimary = (): any => {
            const token = peek();

            if (token.type === TokenType.NUMBER) {
                consume();
                return { type: 'Literal', value: token.value };
            }

            if (token.type === TokenType.STRING) {
                consume();
                return { type: 'Literal', value: token.value };
            }

            if (token.type === TokenType.BOOLEAN) {
                consume();
                return { type: 'Literal', value: token.value };
            }

            if (token.type === TokenType.NULL) {
                consume();
                return { type: 'Literal', value: null };
            }

            if (token.type === TokenType.UNDEFINED) {
                consume();
                return { type: 'Literal', value: undefined };
            }

            if (token.type === TokenType.IDENTIFIER) {
                consume();
                return { type: 'Identifier', value: token.value };
            }

            if (token.type === TokenType.LPAREN) {
                consume(); // (
                const expr = parseExpression();
                expect(TokenType.RPAREN);
                return expr;
            }

            throw new Error(`Unexpected token: ${token.type}`);
        };

        return parseExpression();
    }

    /**
     * Execute an AST node
     */
    private executeNode(node: any): any {
        this.checkTimeout();
        this.checkDepth();
        this.depth++;

        try {
            switch (node.type) {
                case 'Literal':
                    return node.value;

                case 'Identifier':
                    return this.resolveIdentifier(node.value);

                case 'BinaryOp':
                    return this.executeBinaryOp(node);

                case 'UnaryOp':
                    return this.executeUnaryOp(node);

                case 'Conditional':
                    return this.executeConditional(node);

                case 'MemberAccess':
                    return this.executeMemberAccess(node);

                case 'IndexAccess':
                    return this.executeIndexAccess(node);

                case 'FunctionCall':
                    return this.executeFunctionCall(node);

                default:
                    throw new Error(`Unknown node type: ${node.type}`);
            }
        } finally {
            this.depth--;
        }
    }

    /**
     * Resolve an identifier (variable or function reference)
     */
    private resolveIdentifier(name: string): any {
        // Security: block dangerous properties
        if (['constructor', 'prototype', '__proto__'].includes(name)) {
            throw new Error(`Access to '${name}' is not allowed`);
        }

        if (this.context.variables.hasOwnProperty(name)) {
            return this.context.variables[name];
        }

        // Also check custom functions - allows passing functions as arguments
        if (this.context.functions.hasOwnProperty(name)) {
            return this.context.functions[name];
        }

        // Also check built-in functions - allows passing them as arguments
        if (this.builtinFunctions.hasOwnProperty(name)) {
            return this.builtinFunctions[name];
        }

        throw new Error(`Undefined variable: ${name}`);
    }

    /**
     * Execute binary operation
     */
    private executeBinaryOp(node: any): any {
        const left = this.executeNode(node.left);

        // Short-circuit for null coalescing operator
        if (node.operator === '??') {
            return (left !== null && left !== undefined) ? left : this.executeNode(node.right);
        }

        const right = this.executeNode(node.right);

        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '==': return left == right;
            case '!=': return left != right;
            case '&&': return left && right;
            case '||': return left || right;
            default:
                throw new Error(`Unknown operator: ${node.operator}`);
        }
    }

    /**
     * Execute unary operation
     */
    private executeUnaryOp(node: any): any {
        const argument = this.executeNode(node.argument);

        switch (node.operator) {
            case '!': return !argument;
            case '-': return -argument;
            default:
                throw new Error(`Unknown unary operator: ${node.operator}`);
        }
    }

    /**
     * Execute conditional (ternary) expression
     */
    private executeConditional(node: any): any {
        const test = this.executeNode(node.test);
        return test ? this.executeNode(node.consequent) : this.executeNode(node.alternate);
    }

    /**
     * Execute member access (object.property)
     */
    private executeMemberAccess(node: any): any {
        const object = this.executeNode(node.object);
        const property = node.property;

        // Security: block dangerous properties
        if (['constructor', 'prototype', '__proto__'].includes(property)) {
            throw new Error(`Access to '${property}' is not allowed`);
        }

        if (object === null || object === undefined) {
            throw new Error(`Cannot access property '${property}' of ${object}`);
        }

        return object[property];
    }

    /**
     * Execute index access (array[index] or object['key'])
     */
    private executeIndexAccess(node: any): any {
        const object = this.executeNode(node.object);
        const index = this.executeNode(node.index);

        // Security: block dangerous properties
        if (['constructor', 'prototype', '__proto__'].includes(index)) {
            throw new Error(`Access to '${index}' is not allowed`);
        }

        if (object === null || object === undefined) {
            throw new Error(`Cannot access index of ${object}`);
        }

        return object[index];
    }

    /**
     * Execute function call
     */
    private executeFunctionCall(node: any): any {
        const name = node.name;
        const args = node.arguments.map((arg: any) => this.executeNode(arg));

        // Check built-in functions first
        if (this.builtinFunctions.hasOwnProperty(name)) {
            return this.builtinFunctions[name](...args);
        }

        // Check custom functions
        if (this.context.functions.hasOwnProperty(name)) {
            return this.context.functions[name](...args);
        }

        throw new Error(`Undefined function: ${name}`);
    }

    /**
     * Check if execution has exceeded timeout
     */
    private checkTimeout(): void {
        if (Date.now() - this.startTime > this.context.timeout!) {
            throw new Error('Execution timeout exceeded');
        }
    }

    /**
     * Check if recursion depth has been exceeded
     */
    private checkDepth(): void {
        if (this.depth >= this.context.maxDepth!) {
            throw new Error('Maximum recursion depth exceeded');
        }
    }

    /**
     * Get the type of a value
     */
    private getType(value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    /**
     * Create built-in functions
     */
    private createBuiltinFunctions(): Record<string, Function> {
        return {
            // Math functions
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            min: Math.min,
            max: Math.max,
            pow: Math.pow,
            sqrt: Math.sqrt,

            // Math operations
            add: (...args: number[]) => args.reduce((a, b) => a + b, 0),
            subtract: (a: number, b: number) => a - b,
            multiply: (...args: number[]) => args.reduce((a, b) => a * b, 1),
            divide: (a: number, b: number) => a / b,
            modulo: (a: number, b: number) => a % b,

            // String functions
            concat: (...args: any[]) => {
                // Handle both string concatenation and array concatenation
                if (args.length === 0) return '';
                if (typeof args[0] === 'string' || typeof args[0] === 'number' || typeof args[0] === 'boolean') {
                    return args.map(a => String(a)).join('');
                }
                if (Array.isArray(args[0])) {
                    return args.flat(1);
                }
                return args.join('');
            },
            substring: (str: string, start: number, end?: number) => str.substring(start, end),
            toLowerCase: (str: string) => str.toLowerCase(),
            toUpperCase: (str: string) => str.toUpperCase(),
            trim: (str: string) => str.trim(),
            split: (str: string, separator: string) => str.split(separator),
            join: (arr: any[], separator: string) => arr.join(separator),
            replace: (str: string, search: string, replace: string) => str.replace(search, replace),
            replaceAll: (str: string, search: string, replace: string) => str.split(search).join(replace),
            length: (value: string | any[]) => value.length,
            startsWith: (str: string, search: string) => str.startsWith(search),
            endsWith: (str: string, search: string) => str.endsWith(search),
            includes: (value: string | any[], search: any) => value.includes(search),
            indexOf: (value: string | any[], search: any) => value.indexOf(search),
            lastIndexOf: (value: string | any[], search: any) => value.lastIndexOf(search),
            slice: (value: string | any[], start: number, end?: number) => value.slice(start, end),

            // Type conversion functions
            toString: (value: any) => String(value),
            toNumber: (value: any) => Number(value),
            toBoolean: (value: any) => Boolean(value),
            parseInt: (value: any, radix?: number) => parseInt(String(value), radix),
            parseFloat: (value: any) => parseFloat(String(value)),
            toFixed: (value: number, digits?: number) => value.toFixed(digits),

            // Type checking functions
            isNull: (value: any) => value === null,
            isUndefined: (value: any) => value === undefined,
            isNumber: (value: any) => typeof value === 'number' && !isNaN(value),
            isString: (value: any) => typeof value === 'string',
            isBoolean: (value: any) => typeof value === 'boolean',
            isArray: (value: any) => Array.isArray(value),
            isObject: (value: any) => typeof value === 'object' && value !== null && !Array.isArray(value),

            // Array functions
            map: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('map requires an array');
                return arr.map((item, index) => fn(item, index, arr));
            },
            filter: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('filter requires an array');
                return arr.filter((item, index) => fn(item, index, arr));
            },
            find: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('find requires an array');
                return arr.find((item, index) => fn(item, index, arr));
            },
            reduce: (arr: any[], fn: Function, initial?: any) => {
                if (!Array.isArray(arr)) throw new Error('reduce requires an array');
                if (initial !== undefined) {
                    return arr.reduce((acc, item, index) => fn(acc, item, index, arr), initial);
                }
                return arr.reduce((acc, item, index) => fn(acc, item, index, arr));
            },
            some: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('some requires an array');
                return arr.some((item, index) => fn(item, index, arr));
            },
            every: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('every requires an array');
                return arr.every((item, index) => fn(item, index, arr));
            },
            sort: (arr: any[], fn?: (a: any, b: any) => number) => {
                if (!Array.isArray(arr)) throw new Error('sort requires an array');
                const copy = [...arr];
                return fn ? copy.sort(fn) : copy.sort();
            },
            reverse: (arr: any[]) => {
                if (!Array.isArray(arr)) throw new Error('reverse requires an array');
                return [...arr].reverse();
            },
            flat: (arr: any[], depth?: number) => {
                if (!Array.isArray(arr)) throw new Error('flat requires an array');
                return arr.flat(depth ?? 1);
            },
            flatMap: (arr: any[], fn: Function) => {
                if (!Array.isArray(arr)) throw new Error('flatMap requires an array');
                return arr.flatMap((item, index) => fn(item, index, arr));
            },
            push: (arr: any[], ...items: any[]) => {
                if (!Array.isArray(arr)) throw new Error('push requires an array');
                return [...arr, ...items];
            },
            pop: (arr: any[]) => {
                if (!Array.isArray(arr)) throw new Error('pop requires an array');
                return arr.slice(0, -1);
            },
            shift: (arr: any[]) => {
                if (!Array.isArray(arr)) throw new Error('shift requires an array');
                return arr.slice(1);
            },
            unshift: (arr: any[], ...items: any[]) => {
                if (!Array.isArray(arr)) throw new Error('unshift requires an array');
                return [...items, ...arr];
            }
        };
    }
}
