
import ololog from 'ololog';
import ansi from 'ansicolor';

let add_static_result;

try {
    add_static_result = (await import ('../../js/static-tests.js')).add_static_result;
} catch (e) {
    // noop
}

ansi.nice;
const log = ololog.configure ({ 'locate': false }).unlimited;

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
function createRequestTemplate (exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'url': exchange.last_request_url ?? '',
        'input': args,
        'output': exchange.last_request_body ?? undefined,
    };
    log ('Report: (paste inside static/request/' + exchange.id + '.json ->' + methodName + ')');
    log.green ('-------------------------------------------');
    log (JSON.stringify (final, null, 2));
    log.green ('-------------------------------------------');
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log.green ('auto-saving static result');
        add_static_result ('request', exchange.id, methodName, final);
    }
}

//-----------------------------------------------------------------------------

/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
function createResponseTemplate (exchange, methodName, args, result) {
    const final = {
        'description': 'Fill this with a description of the method call',
        'method': methodName,
        'input': args,
        'httpResponse': exchange.parseJson (exchange.last_http_response),
        'parsedResponse': result,
    };
    log ('Report: (paste inside static/response/' + exchange.id + '.json ->' + methodName + ')');
    log.green ('-------------------------------------------');
    log (jsonStringify (final, 2));
    log.green ('-------------------------------------------');
    if (foundDescription !== undefined) {
        final.description = foundDescription;
        log.green ('auto-saving static result');
        add_static_result ('response', exchange.id, methodName, final);
    }
}

/**
 *
 * @param obj
 * @param indent
 */
function jsonStringify (obj: any, indent = undefined) {
    return JSON.stringify (obj, (k, v) => (v === undefined ? null : v), indent);
}

/**
 *
 * @param fn
 */
function countAllParams (fn) {
    const fnStr = fn.toString ()
        .replace (/\/\/.*$/mg, '')
        .replace (/\/\*[\s\S]*?\*\//mg, '')
        .replace (/\s+/g, '');

    const match = fnStr.match (/^[^(]*\(([^)]*)\)/);
    if (!match) return 0;

    const params = match[1].split (',').filter ((p) => p);
    return params.length;
}

export {
    createRequestTemplate,
    createResponseTemplate,
    countAllParams,
    jsonStringify,
};
