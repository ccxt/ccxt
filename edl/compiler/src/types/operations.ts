/**
 * Safe Expression Operations Type Definitions
 *
 * This file defines the allowed operations for safe expression evaluation
 * in the EDL evaluator. No arbitrary code execution is permitted - only
 * these predefined operations can be used in computed expressions.
 */

// ============================================================
// Operation Categories
// ============================================================

/**
 * Mathematical operations
 * All operations are safe and deterministic
 */
export const MathOperations = {
  // Binary operations
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => a / b,
  mod: (a: number, b: number): number => a % b,
  pow: (a: number, b: number): number => Math.pow(a, b),
  min: (...args: number[]): number => Math.min(...args),
  max: (...args: number[]): number => Math.max(...args),

  // Unary operations
  abs: (n: number): number => Math.abs(n),
  floor: (n: number): number => Math.floor(n),
  ceil: (n: number): number => Math.ceil(n),
  round: (n: number): number => Math.round(n),
  sqrt: (n: number): number => Math.sqrt(n),
} as const;

/**
 * String operations
 * All operations are safe and cannot execute code
 */
export const StringOperations = {
  concat: (...args: string[]): string => args.join(''),
  substring: (str: string, start: number, end?: number): string => str.substring(start, end),
  lowercase: (str: string): string => str.toLowerCase(),
  uppercase: (str: string): string => str.toUpperCase(),
  trim: (str: string): string => str.trim(),
  split: (str: string, separator: string): string[] => str.split(separator),
  join: (arr: string[], separator: string): string => arr.join(separator),
  replace: (str: string, search: string, replacement: string): string => str.replace(search, replacement),
  indexOf: (str: string, search: string): number => str.indexOf(search),
  length: (str: string): number => str.length,
  startsWith: (str: string, search: string): boolean => str.startsWith(search),
  endsWith: (str: string, search: string): boolean => str.endsWith(search),
  includes: (str: string, search: string): boolean => str.includes(search),
} as const;

/**
 * Comparison and logical operations
 */
export const ComparisonOperations = {
  eq: (a: any, b: any): boolean => a === b,
  ne: (a: any, b: any): boolean => a !== b,
  gt: (a: any, b: any): boolean => a > b,
  lt: (a: any, b: any): boolean => a < b,
  gte: (a: any, b: any): boolean => a >= b,
  lte: (a: any, b: any): boolean => a <= b,
  and: (a: boolean, b: boolean): boolean => a && b,
  or: (a: boolean, b: boolean): boolean => a || b,
  not: (a: boolean): boolean => !a,
} as const;

/**
 * Type conversion and checking operations
 */
export const TypeOperations = {
  parseNumber: (value: any): number => Number(value),
  parseString: (value: any): string => String(value),
  parseBoolean: (value: any): boolean => Boolean(value),
  toString: (value: any): string => String(value),
  toNumber: (value: any): number => Number(value),
  isNumber: (value: any): boolean => typeof value === 'number' && !isNaN(value),
  isString: (value: any): boolean => typeof value === 'string',
  isBoolean: (value: any): boolean => typeof value === 'boolean',
  isNull: (value: any): boolean => value === null,
  isUndefined: (value: any): boolean => value === undefined,
} as const;

/**
 * Date and timestamp operations
 */
export const DateOperations = {
  now: (): number => Date.now(),
  timestamp: (): number => Math.floor(Date.now() / 1000),
  iso8601: (timestamp: number): string => new Date(timestamp).toISOString(),
  parseTimestamp: (dateString: string): number => Date.parse(dateString),
  timestampMs: (timestamp: number): number => timestamp,
  timestampUs: (timestamp: number): number => timestamp * 1000,
  timestampNs: (timestamp: number): number => timestamp * 1000000,
} as const;

/**
 * Array operations
 */
export const ArrayOperations = {
  map: <T, U>(arr: T[], fn: (item: T) => U): U[] => arr.map(fn),
  filter: <T>(arr: T[], fn: (item: T) => boolean): T[] => arr.filter(fn),
  find: <T>(arr: T[], fn: (item: T) => boolean): T | undefined => arr.find(fn),
  first: <T>(arr: T[]): T | undefined => arr[0],
  last: <T>(arr: T[]): T | undefined => arr[arr.length - 1],
  length: <T>(arr: T[]): number => arr.length,
  slice: <T>(arr: T[], start: number, end?: number): T[] => arr.slice(start, end),
  includes: <T>(arr: T[], value: T): boolean => arr.includes(value),
  indexOf: <T>(arr: T[], value: T): number => arr.indexOf(value),
  concat: <T>(...arrays: T[][]): T[] => arrays.flat(),
  join: <T>(arr: T[], separator: string): string => arr.join(separator),
  reverse: <T>(arr: T[]): T[] => [...arr].reverse(),
  sort: <T>(arr: T[]): T[] => [...arr].sort(),
} as const;

/**
 * Object operations
 */
export const ObjectOperations = {
  get: <T>(obj: Record<string, T>, key: string): T | undefined => obj[key],
  has: (obj: Record<string, any>, key: string): boolean => key in obj,
  keys: (obj: Record<string, any>): string[] => Object.keys(obj),
  values: <T>(obj: Record<string, T>): T[] => Object.values(obj),
  entries: <T>(obj: Record<string, T>): [string, T][] => Object.entries(obj),
  assign: <T>(...objects: Partial<T>[]): T => Object.assign({}, ...objects),
  merge: <T>(...objects: Partial<T>[]): T => Object.assign({}, ...objects),
} as const;

// ============================================================
// Operation Type Definitions
// ============================================================

/**
 * All allowed operation names
 */
export type MathOperation = keyof typeof MathOperations;
export type StringOperation = keyof typeof StringOperations;
export type ComparisonOperation = keyof typeof ComparisonOperations;
export type TypeOperation = keyof typeof TypeOperations;
export type DateOperation = keyof typeof DateOperations;
export type ArrayOperation = keyof typeof ArrayOperations;
export type ObjectOperation = keyof typeof ObjectOperations;

/**
 * Union of all allowed operations
 */
export type AllowedOperation =
  | MathOperation
  | StringOperation
  | ComparisonOperation
  | TypeOperation
  | DateOperation
  | ArrayOperation
  | ObjectOperation;

/**
 * Operation signature mapping
 * Maps operation names to their function signatures
 */
export interface OperationSignatures {
  // Math
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  mod: (a: number, b: number) => number;
  abs: (n: number) => number;
  floor: (n: number) => number;
  ceil: (n: number) => number;
  round: (n: number) => number;
  min: (...args: number[]) => number;
  max: (...args: number[]) => number;
  pow: (a: number, b: number) => number;
  sqrt: (n: number) => number;

  // String
  concat: (...args: string[]) => string;
  substring: (str: string, start: number, end?: number) => string;
  lowercase: (str: string) => string;
  uppercase: (str: string) => string;
  trim: (str: string) => string;
  split: (str: string, separator: string) => string[];
  join: (arr: string[], separator: string) => string;
  replace: (str: string, search: string, replacement: string) => string;
  indexOf: (str: string, search: string) => number;
  length: (str: string) => number;
  startsWith: (str: string, search: string) => boolean;
  endsWith: (str: string, search: string) => boolean;
  includes: (str: string, search: string) => boolean;

  // Comparison
  eq: (a: any, b: any) => boolean;
  ne: (a: any, b: any) => boolean;
  gt: (a: any, b: any) => boolean;
  lt: (a: any, b: any) => boolean;
  gte: (a: any, b: any) => boolean;
  lte: (a: any, b: any) => boolean;
  and: (a: boolean, b: boolean) => boolean;
  or: (a: boolean, b: boolean) => boolean;
  not: (a: boolean) => boolean;

  // Type
  parseNumber: (value: any) => number;
  parseString: (value: any) => string;
  parseBoolean: (value: any) => boolean;
  toString: (value: any) => string;
  toNumber: (value: any) => number;
  isNumber: (value: any) => boolean;
  isString: (value: any) => boolean;
  isBoolean: (value: any) => boolean;
  isNull: (value: any) => boolean;
  isUndefined: (value: any) => boolean;

  // Date
  now: () => number;
  timestamp: () => number;
  iso8601: (timestamp: number) => string;
  parseTimestamp: (dateString: string) => number;
  timestampMs: (timestamp: number) => number;
  timestampUs: (timestamp: number) => number;
  timestampNs: (timestamp: number) => number;

  // Array
  map: <T, U>(arr: T[], fn: (item: T) => U) => U[];
  filter: <T>(arr: T[], fn: (item: T) => boolean) => T[];
  find: <T>(arr: T[], fn: (item: T) => boolean) => T | undefined;
  first: <T>(arr: T[]) => T | undefined;
  last: <T>(arr: T[]) => T | undefined;
  slice: <T>(arr: T[], start: number, end?: number) => T[];
  reverse: <T>(arr: T[]) => T[];
  sort: <T>(arr: T[]) => T[];

  // Object
  get: <T>(obj: Record<string, T>, key: string) => T | undefined;
  has: (obj: Record<string, any>, key: string) => boolean;
  keys: (obj: Record<string, any>) => string[];
  values: <T>(obj: Record<string, T>) => T[];
  entries: <T>(obj: Record<string, T>) => [string, T][];
  assign: <T>(...objects: Partial<T>[]) => T;
  merge: <T>(...objects: Partial<T>[]) => T;
}

// ============================================================
// Operation Registry
// ============================================================

/**
 * Central registry of all allowed operations
 * This is used by the evaluator to safely execute expressions
 */
export const OperationRegistry = {
  ...MathOperations,
  ...StringOperations,
  ...ComparisonOperations,
  ...TypeOperations,
  ...DateOperations,
  ...ArrayOperations,
  ...ObjectOperations,
} as const;

/**
 * Check if an operation name is allowed
 */
export function isAllowedOperation(name: string): name is AllowedOperation {
  return name in OperationRegistry;
}

/**
 * Get an operation function by name
 * Returns undefined if operation is not allowed
 */
export function getOperation(name: string): Function | undefined {
  if (isAllowedOperation(name)) {
    return OperationRegistry[name];
  }
  return undefined;
}

// ============================================================
// Binary Operator Mapping
// ============================================================

/**
 * Maps binary operator symbols to operation names
 */
export const BinaryOperatorMap: Record<string, AllowedOperation> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'mod',
  '==': 'eq',
  '!=': 'ne',
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte',
  '&&': 'and',
  '||': 'or',
  'contains': 'includes',
} as const;

/**
 * Maps unary operator symbols to operation names
 */
export const UnaryOperatorMap: Record<string, AllowedOperation> = {
  '!': 'not',
  '-': 'abs', // Note: negation needs special handling
} as const;

// ============================================================
// Expression Evaluation Types
// ============================================================

/**
 * Expression evaluation context
 * Contains variables and helper functions available during evaluation
 */
export interface EvaluationContext {
  // Variables available in the expression (e.g., from path mappings)
  variables: Record<string, any>;

  // Access to "this" context (exchange methods)
  thisContext?: any;

  // Parameters from the request
  params?: Record<string, any>;

  // Response data
  response?: any;
}

/**
 * Expression evaluation result
 */
export interface EvaluationResult {
  value: any;
  errors?: EvaluationError[];
}

/**
 * Expression evaluation error
 */
export interface EvaluationError {
  message: string;
  operation?: string;
  path?: string;
}

// ============================================================
// All operations are already exported above via const exports
// ============================================================
