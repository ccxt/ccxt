// JS-only helpers that rely on a dynamic `this`; kept out of Exchange.ts so the ports never parse them

import { unCamelCase } from './string.js';

const legacyHasGetters = new WeakSet ();
const snakeCaseAliased = new WeakSet ();
const implicitApiDefined = new WeakSet ();
const sharedMembersInstalled = new WeakSet ();
let implicitApiTarget: any = undefined;

/**
 * @ignore
 * @description puts every function export of the functions module on proto once; returns the non-function exports for per-instance copying
 */
function installSharedPrototypeMembers (proto: any, functions: any) {
    const data: any = {};
    const methods: any = {};
    const keys = Object.keys (functions);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (typeof functions[k] === 'function') {
            methods[k] = functions[k];
        } else {
            data[k] = functions[k];
        }
    }
    if (!sharedMembersInstalled.has (proto)) {
        sharedMembersInstalled.add (proto);
        methods['deepExtendSafe'] = functions['deepExtend'];
        methods['indexBySafe'] = functions['indexBy'];
        Object.assign (proto, methods);
    }
    return data;
}

/**
 * @ignore
 * @description adds snake_case aliases of prototype methods once per prototype in the chain
 */
function installSnakeCaseAliases (start: any, base: any) {
    let obj = start;
    while ((obj !== null) && !snakeCaseAliased.has (obj)) {
        snakeCaseAliased.add (obj);
        const target = (obj === Object.prototype) ? base : obj;
        const names = Object.getOwnPropertyNames (obj);
        for (let i = 0; i < names.length; i++) {
            const k = names[i];
            const snake = unCamelCase (k);
            const descriptor = Object.getOwnPropertyDescriptor (obj, k);
            if ((snake !== k) && (descriptor !== undefined) && ('value' in descriptor) && !Object.prototype.hasOwnProperty.call (target, snake)) {
                target[snake] = descriptor.value;
            }
        }
        obj = Object.getPrototypeOf (obj);
    }
}

/**
 * @ignore
 * @description whether the implicit api was already generated on this exact prototype
 */
function isImplicitApiDefined (proto: any) {
    return implicitApiDefined.has (proto);
}

/**
 * @ignore
 * @description records that the implicit api was generated on proto
 */
function markImplicitApiDefined (proto: any) {
    implicitApiDefined.add (proto);
}

/**
 * @ignore
 * @description prototype receiving implicit api methods during generation, undefined otherwise
 */
function getImplicitApiTarget () {
    return implicitApiTarget;
}

/**
 * @ignore
 * @description sets the prototype receiving implicit api methods
 */
function setImplicitApiTarget (target: any) {
    implicitApiTarget = target;
}

/**
 * @ignore
 * @description one implicit api method shared by every instance through the prototype
 */
function sharedImplicitMethod (methodName: string, path: string, typeArgument: any, uppercaseMethod: string, config: any) {
    // eslint-disable-next-line no-unused-vars
    return async function (this: any, params = {}, context = {}) {
        return this[methodName] (path, typeArgument, uppercaseMethod, params, undefined, undefined, config, context);
    };
}

/**
 * @ignore
 * @description true when name resolves to one of our legacy hasXxx getters
 */
function isLegacyHasGetter (proto: any, name: string) {
    let obj = proto;
    while ((obj !== null) && !Object.prototype.hasOwnProperty.call (obj, name)) {
        obj = Object.getPrototypeOf (obj);
    }
    if (obj === null) {
        return false;
    }
    const get = Object.getOwnPropertyDescriptor (obj, name)?.get;
    return (get !== undefined) && legacyHasGetters.has (get);
}

/**
 * @ignore
 * @description defines hasXxx as a getter over this.has; assigning creates an own property
 */
function defineLegacyHasGetter (proto: any, name: string, key: string) {
    // eslint-disable-next-line no-unused-vars
    const get = function (this: any) {
        const has = this.has;
        return (has[key] !== undefined) && (has[key] !== false);
    };
    legacyHasGetters.add (get);
    Object.defineProperty (proto, name, {
        'configurable': true,
        'get': get,
        // eslint-disable-next-line no-unused-vars
        'set': function (this: any, value: any) {
            Object.defineProperty (this, name, { 'value': value, 'writable': true, 'enumerable': true, 'configurable': true });
        },
    });
}

export {
    installSharedPrototypeMembers,
    installSnakeCaseAliases,
    isImplicitApiDefined,
    markImplicitApiDefined,
    getImplicitApiTarget,
    setImplicitApiTarget,
    sharedImplicitMethod,
    isLegacyHasGetter,
    defineLegacyHasGetter,
};
