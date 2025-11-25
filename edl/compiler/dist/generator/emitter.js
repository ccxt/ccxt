/**
 * TypeScript Code Emitter
 * Converts TypeScript AST to formatted code strings
 */
const DEFAULT_OPTIONS = {
    indent: '    ',
    lineWidth: 120,
    trailingCommas: true,
};
export function emit(file, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const lines = [];
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
function emitImport(imp) {
    const typePrefix = imp.isType ? 'type ' : '';
    if (imp.names === '*') {
        return `import * as ${imp.alias} from '${imp.from}';`;
    }
    const names = imp.names.join(', ');
    return `import ${typePrefix}{ ${names} } from '${imp.from}';`;
}
function emitStatement(stmt, indent, opts) {
    if (!stmt || typeof stmt !== 'object') {
        return '';
    }
    const kind = stmt.kind;
    switch (kind) {
        case 'class':
            return emitClass(stmt, indent, opts);
        case 'variable':
            return emitVariable(stmt, indent, opts);
        case 'return':
            return emitReturn(stmt, indent, opts);
        case 'if':
            return emitIf(stmt, indent, opts);
        case 'expression':
            return `${indent}${emitExpression(stmt.expression, opts)};`;
        case 'throw':
            return `${indent}throw ${emitExpression(stmt.argument, opts)};`;
        default:
            return '';
    }
}
function emitClass(cls, indent, opts) {
    const lines = [];
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
function emitClassMember(member, indent, opts) {
    const kind = member.kind;
    switch (kind) {
        case 'method':
            return emitMethod(member, indent, opts);
        case 'property':
            return emitProperty(member, indent, opts);
        default:
            return '';
    }
}
function emitMethod(method, indent, opts) {
    const lines = [];
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
function emitProperty(prop, indent, opts) {
    const visibility = prop.visibility ? `${prop.visibility} ` : '';
    const staticStr = prop.isStatic ? 'static ' : '';
    const readonlyStr = prop.isReadonly ? 'readonly ' : '';
    const optional = prop.isOptional ? '?' : '';
    const type = prop.type ? `: ${emitType(prop.type)}` : '';
    const value = prop.value ? ` = ${emitExpression(prop.value, opts)}` : '';
    return `${indent}${visibility}${staticStr}${readonlyStr}${prop.name}${optional}${type}${value};`;
}
function emitParameter(param, opts) {
    const rest = param.isRest ? '...' : '';
    const optional = param.isOptional ? '?' : '';
    const type = param.type ? `: ${emitType(param.type)}` : '';
    const defaultVal = param.default ? ` = ${emitExpression(param.default, opts)}` : '';
    return `${rest}${param.name}${optional}${type}${defaultVal}`;
}
function emitType(type) {
    const kind = type.kind;
    switch (kind) {
        case 'primitive':
            return type.type;
        case 'array':
            return `${emitType(type.elementType)}[]`;
        case 'union':
            return type.types.map(emitType).join(' | ');
        case 'intersection':
            return type.types.map(emitType).join(' & ');
        case 'generic':
            const args = type.typeArgs.map(emitType).join(', ');
            return `${type.name}<${args}>`;
        case 'reference':
            if (type.typeArgs?.length) {
                const args = type.typeArgs.map(emitType).join(', ');
                return `${type.name}<${args}>`;
            }
            return type.name;
        case 'literal':
            const val = type.value;
            return typeof val === 'string' ? `'${val}'` : String(val);
        case 'functionType':
            const params = type.params.map((p) => emitParameter(p, DEFAULT_OPTIONS)).join(', ');
            return `(${params}) => ${emitType(type.returnType)}`;
        default:
            return 'any';
    }
}
function emitExpression(expr, opts) {
    if (!expr || typeof expr !== 'object') {
        return String(expr);
    }
    const kind = expr.kind;
    switch (kind) {
        case 'literal':
            return emitLiteral(expr.value);
        case 'identifier':
            return expr.name;
        case 'this':
            return 'this';
        case 'binary':
            return `${emitExpression(expr.left, opts)} ${expr.operator} ${emitExpression(expr.right, opts)}`;
        case 'unary':
            return `${expr.operator}${emitExpression(expr.operand, opts)}`;
        case 'call':
            return emitCall(expr, opts);
        case 'member':
            return emitMember(expr, opts);
        case 'object':
            return emitObject(expr, opts);
        case 'array':
            return emitArray(expr, opts);
        case 'arrow':
            return emitArrow(expr, opts);
        case 'await':
            return `await ${emitExpression(expr.expression, opts)}`;
        case 'conditional':
            return `${emitExpression(expr.test, opts)} ? ${emitExpression(expr.consequent, opts)} : ${emitExpression(expr.alternate, opts)}`;
        case 'assignment':
            return `${emitExpression(expr.left, opts)} ${expr.operator} ${emitExpression(expr.right, opts)}`;
        case 'spread':
            return `...${emitExpression(expr.argument, opts)}`;
        case 'new':
            const newArgs = expr.args.map((a) => emitExpression(a, opts)).join(', ');
            return `new ${emitExpression(expr.callee, opts)}(${newArgs})`;
        case 'paren':
            return `(${emitExpression(expr.expression, opts)})`;
        default:
            return '';
    }
}
function emitLiteral(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (typeof value === 'string')
        return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'boolean')
        return value ? 'true' : 'false';
    return String(value);
}
function emitCall(expr, opts) {
    const callee = emitExpression(expr.callee, opts);
    const args = expr.args.map((a) => emitExpression(a, opts)).join(', ');
    return `${callee}(${args})`;
}
function emitMember(expr, opts) {
    const obj = emitExpression(expr.object, opts);
    if (expr.computed) {
        const prop = emitExpression(expr.property, opts);
        return `${obj}[${prop}]`;
    }
    return `${obj}.${expr.property}`;
}
function emitObject(expr, opts) {
    if (expr.properties.length === 0) {
        return '{}';
    }
    const props = expr.properties.map((p) => {
        if (p.spread) {
            return `...${emitExpression(p.value, opts)}`;
        }
        const key = p.computed
            ? `[${emitExpression(p.key, opts)}]`
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
    return `{\n${props.map((p) => `    ${p},`).join('\n')}\n}`;
}
function emitArray(expr, opts) {
    if (expr.elements.length === 0) {
        return '[]';
    }
    const elements = expr.elements.map((e) => emitExpression(e, opts));
    // Single line if short enough
    const singleLine = `[${elements.join(', ')}]`;
    if (singleLine.length <= opts.lineWidth) {
        return singleLine;
    }
    // Multi-line
    return `[\n${elements.map((e) => `    ${e},`).join('\n')}\n]`;
}
function emitArrow(expr, opts) {
    const params = expr.params.map((p) => emitParameter(p, opts)).join(', ');
    const returnType = expr.returnType ? `: ${emitType(expr.returnType)}` : '';
    const asyncStr = expr.async ? 'async ' : '';
    if (Array.isArray(expr.body)) {
        const body = expr.body.map((s) => emitStatement(s, '    ', opts)).join('\n');
        return `${asyncStr}(${params})${returnType} => {\n${body}\n}`;
    }
    return `${asyncStr}(${params})${returnType} => ${emitExpression(expr.body, opts)}`;
}
function emitVariable(stmt, indent, opts) {
    const type = stmt.type ? `: ${emitType(stmt.type)}` : '';
    const value = stmt.value ? ` = ${emitExpression(stmt.value, opts)}` : '';
    return `${indent}${stmt.keyword} ${stmt.name}${type}${value};`;
}
function emitReturn(stmt, indent, opts) {
    if (!stmt.expression) {
        return `${indent}return;`;
    }
    return `${indent}return ${emitExpression(stmt.expression, opts)};`;
}
function emitIf(stmt, indent, opts) {
    const lines = [];
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
function emitJSDoc(doc, indent) {
    const lines = [];
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
function quotePropertyKey(key) {
    // Quote keys that need it
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        return key;
    }
    return `'${key}'`;
}
//# sourceMappingURL=emitter.js.map