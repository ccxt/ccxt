// stdout is the JSON-RPC channel in a stdio MCP server — anything else written to it
// corrupts the framing. This module must be imported before any other module so that
// stray console.* calls from ccxt or transitive dependencies can never reach stdout.

/* eslint-disable no-console */

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

let redactor: (text: string) => string = (text) => text;

// stray library output (ccxt included) could carry secret material, so the reroute also
// runs every line through the redactor once it is wired up
const stderrWrite = (...args: any[]) => {
    const line = args.map ((arg) => ((typeof arg === 'string') ? arg : safeStringify (arg))).join (' ');
    process.stderr.write (redactor (line) + '\n');
};

console.log = stderrWrite;
console.info = stderrWrite;
console.debug = stderrWrite;
console.warn = stderrWrite;
console.error = stderrWrite;

export function setLogRedactor (fn: (text: string) => string): void {
    redactor = fn;
}

export function log (level: LogLevel, message: string, data?: any): void {
    const line = data === undefined ? message : message + ' ' + safeStringify (data);
    process.stderr.write ('[ccxt-mcp] [' + level + '] ' + redactor (line) + '\n');
}

function safeStringify (value: any): string {
    try {
        return JSON.stringify (value, (k, v) => ((v === undefined) ? null : v));
    } catch (e) {
        return String (value);
    }
}
