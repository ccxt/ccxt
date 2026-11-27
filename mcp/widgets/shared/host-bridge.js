const HostBridge = (() => {
  const PROTOCOL_VERSION = '2026-01-26';
  const INITIALIZE_ID = 1;
  const TOOL_CALL_TIMEOUT = 60000;
  const pendingCalls = new Map();
  let nextCallId = 100;
  let initialized = false;
  let sizeObserver;

  function send(message) {
    window.parent.postMessage({ jsonrpc: '2.0', ...message }, '*');
  }

  function reportSizeChanges() {
    sizeObserver = new ResizeObserver(([entry]) => send({
      method: 'ui/notifications/size-changed', params: { height: Math.ceil(entry.contentRect.height) },
    }));
    sizeObserver.observe(document.body);
  }

  function settleToolCall(message) {
    const call = pendingCalls.get(message.id);
    pendingCalls.delete(message.id);
    clearTimeout(call.timer);
    if (message.error) call.reject(new Error(message.error.message ?? 'The host refused the tool call.'));
    else call.resolve(message.result);
  }

  function connect({ appInfo, onToolResult, onTeardown }) {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (event.source !== window.parent || message?.jsonrpc !== '2.0') return;
      const isReply = message.result !== undefined || message.error !== undefined;
      if (pendingCalls.has(message.id) && isReply) {
        settleToolCall(message);
        return;
      }
      if (message.id === INITIALIZE_ID && message.result?.protocolVersion && !initialized) {
        initialized = true;
        send({ method: 'ui/notifications/initialized' });
        reportSizeChanges();
      }
      if (message.method === 'ui/resource-teardown') {
        sizeObserver?.disconnect();
        onTeardown?.();
        send({ id: message.id, result: {} });
        return;
      }
      if (message.method === 'ui/notifications/tool-result') onToolResult(message.params);
    });
    if (window.parent !== window) {
      send({ id: INITIALIZE_ID, method: 'ui/initialize', params: { appInfo, appCapabilities: {}, protocolVersion: PROTOCOL_VERSION } });
    }
  }

  function callTool(name, args) {
    if (typeof window.openai?.callTool === 'function') return window.openai.callTool(name, args);
    return new Promise((resolve, reject) => {
      const id = nextCallId++;
      const timer = setTimeout(() => {
        pendingCalls.delete(id);
        reject(new Error('The host did not answer. It may not allow this widget to call tools.'));
      }, TOOL_CALL_TIMEOUT);
      pendingCalls.set(id, { resolve, reject, timer });
      send({ id, method: 'tools/call', params: { name, arguments: args } });
    });
  }

  return { connect, callTool };
})();
