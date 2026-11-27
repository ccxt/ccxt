const SigningSteps = (() => {
  const SIGN_STEP_TOOL = 'browser_sign_step';
  const STEP_STATUSES = ['sign', 'done', 'error'];
  const REQUEST_FIELDS = ['exchange', 'network', 'market', 'symbol', 'side', 'type', 'amount', 'price', 'orderId'];
  const HOST_BLOCKS_TOOLS = 'This host does not let the widget call its tools, so it cannot sign here. Use the link below to open the signing page in a tab.';
  let dedicatedToolRefused = false;
  let callCount = 0;

  function resultOf(reply) {
    const result = reply?.structuredContent ?? reply?.result?.structuredContent;
    return result && STEP_STATUSES.includes(result.status) ? result : undefined;
  }

  function requestFields(request) {
    return Object.fromEntries(REQUEST_FIELDS.filter((field) => request[field] != null).map((field) => [field, request[field]]));
  }

  function serverShare(reply, total) {
    const server = resultOf(reply)?.serverMs;
    if (typeof server !== 'number') return 'no server time reported';
    return 'server ' + server + ' ms, host and network ' + Math.max(0, Math.round(total - server)) + ' ms';
  }

  async function timedCall(label, tool, args) {
    const startedAt = performance.now();
    let reply;
    try {
      reply = await HostBridge.callTool(tool, args);
    } catch (error) {
      Timing.recordSince(label + ' via ' + tool, startedAt, 'refused or failed');
      throw error;
    }
    const total = performance.now() - startedAt;
    Timing.record(label + ' via ' + tool, total, serverShare(reply, total));
    return reply;
  }

  async function viaDedicatedTool(label, args) {
    try {
      return resultOf(await timedCall(label, SIGN_STEP_TOOL, args));
    } catch {
      return undefined;
    }
  }

  async function viaMountingTool(label, request, args) {
    const { intent: _intent, ...signing } = args;
    const result = resultOf(await timedCall(label, request.action, { ...requestFields(request), signing }));
    if (!result) throw new Error(HOST_BLOCKS_TOOLS);
    return result;
  }

  async function send(request, args) {
    const label = 'tool call ' + (++callCount) + (args.session ? ' (send signature)' : ' (prepare request)');
    if (!dedicatedToolRefused) {
      const result = await viaDedicatedTool(label, args);
      if (result) return result;
      dedicatedToolRefused = true;
    }
    return viaMountingTool(label, request, args);
  }

  function prepare(request, apiKey) {
    return send(request, { intent: { action: request.action, ...requestFields(request) }, apiKey });
  }

  function submitSignatures(request, session, signatures) {
    return send(request, { session, signatures });
  }

  async function sign(secret, needs) {
    const key = await crypto.subtle.importKey('raw', Encoding.toUtf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatures = [];
    for (const need of needs) {
      if (need.algorithm !== 'HMAC-SHA256') throw new Error('Unsupported signature type.');
      const digest = await crypto.subtle.sign('HMAC', key, Encoding.fromBase64(need.message));
      signatures.push({ id: need.id, signature: need.encoding === 'base64' ? Encoding.toBase64(digest) : Encoding.toHex(digest) });
    }
    return signatures;
  }

  function resetCallCount() {
    callCount = 0;
  }

  return { resultOf, prepare, submitSignatures, sign, resetCallCount };
})();
