import assert from 'node:assert/strict';
import test from 'node:test';
import { createPostHog, redactEvent } from '../../ts/posthog.js';

test ('analytics stays off without a project token', () => {
    assert.equal (createPostHog (undefined, undefined), undefined);
    assert.equal (createPostHog ('  ', 'https://eu.i.posthog.com'), undefined);
});

test ('signing steps are reported without what went in or came out', () => {
    const viaStepTool = redactEvent ({ 'event': '$mcp_tool_call', 'properties': {
        '$mcp_tool_name': 'browser_sign_step', '$mcp_is_error': false,
        '$mcp_parameters': { 'request': { 'params': { 'name': 'browser_sign_step', 'arguments': { 'apiKey': 'the-api-key', 'signatures': [ { 'id': 'a', 'signature': 'b' } ] } } } },
        '$mcp_response': { 'structuredContent': { 'status': 'done', 'result': { 'balances': { 'USDT': { 'total': 1000 } } } } },
    } });
    assert.deepEqual (viaStepTool.properties, { '$mcp_tool_name': 'browser_sign_step', '$mcp_is_error': false, '$mcp_parameters': '[removed]', '$mcp_response': '[removed]' });
    // the same step sent through the widget's own tool (the "signing" field)
    const viaOwnTool = redactEvent ({ 'event': '$mcp_tool_call', 'properties': {
        '$mcp_tool_name': 'browser_create_order',
        '$mcp_parameters': { 'request': { 'params': { 'name': 'browser_create_order', 'arguments': { 'exchange': 'bybit', 'signing': { 'apiKey': 'the-api-key' } } } } },
        '$mcp_response': { 'structuredContent': { 'status': 'sign', 'need': [ { 'message': 'bytes' } ] } },
    } });
    assert.ok (!JSON.stringify (viaOwnTool).includes ('the-api-key'));
    assert.equal (viaOwnTool.properties['$mcp_response'], '[removed]');
});

test ('ordinary tool calls keep their arguments, minus anything credential-shaped', () => {
    const event = redactEvent ({ 'event': '$mcp_tool_call', 'properties': {
        '$mcp_tool_name': 'get_ohlcv',
        '$mcp_parameters': { 'request': { 'params': { 'name': 'get_ohlcv', 'arguments': { 'exchange': 'kraken', 'symbol': 'BTC/USD', 'params': { 'apiKey': 'pasted-by-mistake', 'until': 1 } } } } },
        '$mcp_response': { 'content': [ { 'type': 'text', 'text': '{}' } ] },
    } });
    assert.deepEqual (event.properties['$mcp_parameters'].request.params.arguments, { 'exchange': 'kraken', 'symbol': 'BTC/USD', 'params': { 'apiKey': '[removed]', 'until': 1 } });
    assert.deepEqual (event.properties['$mcp_response'], { 'content': [ { 'type': 'text', 'text': '{}' } ] });
    assert.deepEqual (redactEvent ({ 'event': 'x' }), { 'event': 'x' });
});
