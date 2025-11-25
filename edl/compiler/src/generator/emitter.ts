/**
 * TypeScript Code Emitter
 * Converts TypeScript AST to formatted code strings
 */

import type {
    TSFile,
    TSImport,
    TSStatement,
    TSClassDeclaration,
    TSClassMember,
    TSMethodDeclaration,
    TSPropertyDeclaration,
    TSParameter,
    TSType,
    TSExpression,
    TSObjectProperty,
    TSBodyStatement,
    JSDocComment,
} from '../types/ast.js';

export interface EmitOptions {
    indent?: string;
    lineWidth?: number;
    trailingCommas?: boolean;
}

const DEFAULT_OPTIONS: Required<EmitOptions> = {
    indent: '    ',
    lineWidth: 120,
    trailingCommas: true,
};

export function emit(file: TSFile, options: EmitOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const lines: string[] = [];

    // Emit imports
    for (const imp of file.imports) {
        lines.push(emitImport(imp));
    }

    if (file.imports.length > 0) {
        lines.push('');
    }

    // Emit statements
    for (const stmt of file.statements) {
        lines.push(emitStatement(stmt, '', opts));
        lines.push('');
    }

    return lines.join('\n');
}

function emitImport(imp: TSImport): string {
    const typePrefix = imp.isType ? 'type ' : '';

    if (imp.names === '*') {
        return `import * as ${imp.alias} from '${imp.from}';`;
    }

    const names = imp.names.join(', ');
    return `import ${typePrefix}{ ${names} } from '${imp.from}';`;
}

function emitStatement(stmt: TSStatement, indent: string, opts: Required<EmitOptions>): string {
    if (!stmt || typeof stmt !== 'object') {
        return '';
    }

    const kind = (stmt as any).kind;

    switch (kind) {
        case 'class':
            return emitClass(stmt as TSClassDeclaration, indent, opts);
        case 'variable':
            return emitVariable(stmt as any, indent, opts);
        case 'return':
            return emitReturn(stmt as any, indent, opts);
        case 'if':
            return emitIf(stmt as any, indent, opts);
        case 'expression':
            return `${indent}${emitExpression((stmt as any).expression, opts)};`;
        case 'throw':
            return `${indent}throw ${emitExpression((stmt as any).argument, opts)};`;
        default:
            return '';
    }
}

function emitClass(cls: TSClassDeclaration, indent: string, opts: Required<EmitOptions>): string {
    const lines: string[] = [];

    // Class declaration
    const exportStr = cls.isExport ? (cls.isDefault ? 'export default ' : 'export ') : '';
    const extendsStr = cls.extends ? ` extends ${cls.extends}` : '';
    const implementsStr = cls.implements?.length ? ` implements ${cls.implements.join(', ')}` : '';

    lines.push(`${indent}${exportStr}class ${cls.name}${extendsStr}${implementsStr} {`);

    // Members
    for (const member of cls.members) {
        lines.push('');
        lines.push(emitClassMember(member, indent + opts.indent, opts));
    }

    lines.push(`${indent}}`);

    return lines.join('\n');
}

function emitClassMember(member: TSClassMember, indent: string, opts: Required<EmitOptions>): string {
    const kind = (member as any).kind;

    switch (kind) {
        case 'method':
            return emitMethod(member as TSMethodDeclaration, indent, opts);
        case 'property':
            return emitProperty(member as TSPropertyDeclaration, indent, opts);
        default:
            return '';
    }
}

function emitMethod(method: TSMethodDeclaration, indent: string, opts: Required<EmitOptions>): string {
    const lines: string[] = [];

    // JSDoc
    if (method.jsDoc) {
        lines.push(emitJSDoc(method.jsDoc, indent));
    }

    // Method signature
    const asyncStr = method.isAsync ? 'async ' : '';
    const visibility = method.visibility ? `${method.visibility} ` : '';
    const staticStr = method.isStatic ? 'static ' : '';
    const params = method.params.map(p => emitParameter(p, opts)).join(', ');
    const returnType = method.returnType ? `: ${emitType(method.returnType)}` : '';

    lines.push(`${indent}${visibility}${staticStr}${asyncStr}${method.name}(${params})${returnType} {`);

    // Body
    for (const stmt of method.body) {
        lines.push(emitStatement(stmt, indent + opts.indent, opts));
    }

    lines.push(`${indent}}`);

    return lines.join('\n');
}

function emitProperty(prop: TSPropertyDeclaration, indent: string, opts: Required<EmitOptions>): string {
    const visibility = prop.visibility ? `${prop.visibility} ` : '';
    const staticStr = prop.isStatic ? 'static ' : '';
    const readonlyStr = prop.isReadonly ? 'readonly ' : '';
    const optional = prop.isOptional ? '?' : '';
    const type = prop.type ? `: ${emitType(prop.type)}` : '';
    const value = prop.value ? ` = ${emitExpression(prop.value, opts)}` : '';

    return `${indent}${visibility}${staticStr}${readonlyStr}${prop.name}${optional}${type}${value};`;
}

function emitParameter(param: TSParameter, opts: Required<EmitOptions>): string {
    const rest = param.isRest ? '...' : '';
    const optional = param.isOptional ? '?' : '';
    const type = param.type ? `: ${emitType(param.type)}` : '';
    const defaultVal = param.default ? ` = ${emitExpression(param.default, opts)}` : '';

    return `${rest}${param.name}${optional}${type}${defaultVal}`;
}

function emitType(type: TSType): string {
    const kind = type.kind;

    switch (kind) {
        case 'primitive':
            return (type as any).type;
        case 'array':
            return `${emitType((type as any).elementType)}[]`;
        case 'union':
            return (type as any).types.map(emitType).join(' | ');
        case 'intersection':
            return (type as any).types.map(emitType).join(' & ');
        case 'generic':
            const args = (type as any).typeArgs.map(emitType).join(', ');
            return `${(type as any).name}<${args}>`;
        case 'reference':
            if ((type as any).typeArgs?.length) {
                const args = (type as any).typeArgs.map(emitType).join(', ');
                return `${(type as any).name}<${args}>`;
            }
            return (type as any).name;
        case 'literal':
            const val = (type as any).value;
            return typeof val === 'string' ? `'${val}'` : String(val);
        case 'functionType':
            const params = (type as any).params.map((p: TSParameter) => emitParameter(p, DEFAULT_OPTIONS)).join(', ');
            return `(${params}) => ${emitType((type as any).returnType)}`;
        default:
            return 'any';
    }
}

function emitExpression(expr: TSExpression, opts: Required<EmitOptions>): string {
    if (!expr || typeof expr !== 'object') {
        return String(expr);
    }

    const kind = expr.kind;

    switch (kind) {
        case 'literal':
            return emitLiteral((expr as any).value);
        case 'identifier':
            return (expr as any).name;
        case 'this':
            return 'this';
        case 'binary':
            return `${emitExpression((expr as any).left, opts)} ${(expr as any).operator} ${emitExpression((expr as any).right, opts)}`;
        case 'unary':
            return `${(expr as any).operator}${emitExpression((expr as any).operand, opts)}`;
        case 'call':
            return emitCall(expr as any, opts);
        case 'member':
            return emitMember(expr as any, opts);
        case 'object':
            return emitObject(expr as any, opts);
        case 'array':
            return emitArray(expr as any, opts);
        case 'arrow':
            return emitArrow(expr as any, opts);
        case 'await':
            return `await ${emitExpression((expr as any).expression, opts)}`;
        case 'conditional':
            return `${emitExpression((expr as any).test, opts)} ? ${emitExpression((expr as any).consequent, opts)} : ${emitExpression((expr as any).alternate, opts)}`;
        case 'assignment':
            return `${emitExpression((expr as any).left, opts)} ${(expr as any).operator} ${emitExpression((expr as any).right, opts)}`;
        case 'spread':
            return `...${emitExpression((expr as any).argument, opts)}`;
        case 'new':
            const newArgs = (expr as any).args.map((a: TSExpression) => emitExpression(a, opts)).join(', ');
            return `new ${emitExpression((expr as any).callee, opts)}(${newArgs})`;
        case 'paren':
            return `(${emitExpression((expr as any).expression, opts)})`;
        default:
            return '';
    }
}

function emitLiteral(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

function emitCall(expr: any, opts: Required<EmitOptions>): string {
    const callee = emitExpression(expr.callee, opts);
    const args = expr.args.map((a: TSExpression) => emitExpression(a, opts)).join(', ');
    return `${callee}(${args})`;
}

function emitMember(expr: any, opts: Required<EmitOptions>): string {
    const obj = emitExpression(expr.object, opts);

    if (expr.computed) {
        const prop = emitExpression(expr.property, opts);
        return `${obj}[${prop}]`;
    }

    return `${obj}.${expr.property}`;
}

function emitObject(expr: any, opts: Required<EmitOptions>): string {
    if (expr.properties.length === 0) {
        return '{}';
    }

    const props = expr.properties.map((p: TSObjectProperty) => {
        if (p.spread) {
            return `...${emitExpression(p.value, opts)}`;
        }

        const key = p.computed
            ? `[${emitExpression(p.key as TSExpression, opts)}]`
            : (typeof p.key === 'string' ? quotePropertyKey(p.key) : emitExpression(p.key, opts));

        if (p.shorthand) {
            return key;
        }

        return `${key}: ${emitExpression(p.value, opts)}`;
    });

    // Single line if short enough
    const singleLine = `{ ${props.join(', ')} }`;
    if (singleLine.length <= opts.lineWidth) {
        return singleLine;
    }

    // Multi-line
    return `{\n${props.map((p: string) => `    ${p},`).join('\n')}\n}`;
}

function emitArray(expr: any, opts: Required<EmitOptions>): string {
    if (expr.elements.length === 0) {
        return '[]';
    }

    const elements = expr.elements.map((e: TSExpression) => emitExpression(e, opts));

    // Single line if short enough
    const singleLine = `[${elements.join(', ')}]`;
    if (singleLine.length <= opts.lineWidth) {
        return singleLine;
    }

    // Multi-line
    return `[\n${elements.map((e: string) => `    ${e},`).join('\n')}\n]`;
}

function emitArrow(expr: any, opts: Required<EmitOptions>): string {
    const params = expr.params.map((p: TSParameter) => emitParameter(p, opts)).join(', ');
    const returnType = expr.returnType ? `: ${emitType(expr.returnType)}` : '';
    const asyncStr = expr.async ? 'async ' : '';

    if (Array.isArray(expr.body)) {
        const body = expr.body.map((s: TSStatement) => emitStatement(s, '    ', opts)).join('\n');
        return `${asyncStr}(${params})${returnType} => {\n${body}\n}`;
    }

    return `${asyncStr}(${params})${returnType} => ${emitExpression(expr.body, opts)}`;
}

function emitVariable(stmt: any, indent: string, opts: Required<EmitOptions>): string {
    const type = stmt.type ? `: ${emitType(stmt.type)}` : '';
    const value = stmt.value ? ` = ${emitExpression(stmt.value, opts)}` : '';
    return `${indent}${stmt.keyword} ${stmt.name}${type}${value};`;
}

function emitReturn(stmt: any, indent: string, opts: Required<EmitOptions>): string {
    if (!stmt.expression) {
        return `${indent}return;`;
    }
    return `${indent}return ${emitExpression(stmt.expression, opts)};`;
}

function emitIf(stmt: any, indent: string, opts: Required<EmitOptions>): string {
    const lines: string[] = [];

    lines.push(`${indent}if (${emitExpression(stmt.test, opts)}) {`);

    for (const s of stmt.consequent) {
        lines.push(emitStatement(s, indent + opts.indent, opts));
    }

    if (stmt.alternate && stmt.alternate.length > 0) {
        lines.push(`${indent}} else {`);
        for (const s of stmt.alternate) {
            lines.push(emitStatement(s, indent + opts.indent, opts));
        }
    }

    lines.push(`${indent}}`);

    return lines.join('\n');
}

function emitJSDoc(doc: JSDocComment, indent: string): string {
    const lines: string[] = [];
    lines.push(`${indent}/**`);

    if (doc.description) {
        lines.push(`${indent} * ${doc.description}`);
    }

    if (doc.tags.length > 0 && doc.description) {
        lines.push(`${indent} *`);
    }

    for (const tag of doc.tags) {
        let tagLine = `${indent} * @${tag.tag}`;
        if (tag.type) {
            tagLine += ` {${tag.type}}`;
        }
        if (tag.name) {
            tagLine += ` ${tag.name}`;
        }
        if (tag.description) {
            tagLine += ` ${tag.description}`;
        }
        lines.push(tagLine);
    }

    lines.push(`${indent} */`);
    return lines.join('\n');
}

function quotePropertyKey(key: string): string {
    // Quote keys that need it
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        return key;
    }
    return `'${key}'`;
}
