# -*- coding: utf-8 -*-

from tests_helpers import get_cli_arg_value, IS_SYNCHRONOUS, argvExchange, argvSymbol, argvMethod

try:
    import asyncio
except ImportError:
    asyncio = None

from base.tests_init import base_tests_init  # noqa: F401
from ccxt.pro.test.base.tests_init import test_base_init_ws  # noqa: F401

# fix : https://github.com/aio-libs/aiodns/issues/86
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# ########### args ###########
isWs = get_cli_arg_value('--ws')
isBaseTests = get_cli_arg_value('--baseTests')
runAll = get_cli_arg_value('--all')


if (IS_SYNCHRONOUS):
    from tests_sync import testMainClass as testMainClassSync
    testMainClassSync().init(argvExchange, argvSymbol, argvMethod)
else:
    from tests_async import testMainClass as testMainClassAsync

    # run-tests.js declares RUNTEST_TIMED_OUT after a 120s wall budget for ws
    # lanes without killing the child, and stops capturing output at that
    # moment. The watchdog fires shortly before the budget and dumps one
    # forensic line per live ws client into stdout while it is still being
    # captured, so every timeout carries its cause: never connected, connect
    # failed, dead pipe, or frames arriving that never resolve a future.
    WS_ORCHESTRATOR_BUDGET_SECONDS = 120
    WATCHDOG_MARGIN_SECONDS = 15

    def classify_client(client, now):
        established = getattr(client, 'connectionEstablished', None)
        last_message = getattr(client, 'last_message_at', None)
        pending = len(getattr(client, 'futures', {}) or {})
        if not client.isConnected:
            if getattr(client, 'error', None):
                return 'CONNECT_FAILED'
            if getattr(client, 'connecting', False):
                return 'NEVER_CONNECTED'
            return 'NEVER_CONNECTED'
        last_activity = last_message or established
        if last_activity is not None and now - last_activity > 30000:
            return 'CONNECTED_NO_FRAMES'
        if pending > 0:
            return 'FRAMES_NO_RESOLVE'
        return 'SLOW_TEST'

    async def timeout_cause_watchdog():
        await asyncio.sleep(WS_ORCHESTRATOR_BUDGET_SECONDS - WATCHDOG_MARGIN_SECONDS)
        import gc
        import time
        from ccxt.async_support.base.ws.client import Client as WsClient
        now = int(time.time() * 1000)
        clients = [obj for obj in gc.get_objects() if isinstance(obj, WsClient)]
        if not clients:
            # stdout is a block-buffered pipe under the test orchestrator and a
            # timed-out child is harvested before it exits, unflushed lines are
            # lost, so the watchdog must flush every line immediately
            print('[TEST_WARNING] TIMEOUT_CAUSE no live ws clients at watchdog fire', flush=True)
        for client in clients:
            established = getattr(client, 'connectionEstablished', None)
            last_message = getattr(client, 'last_message_at', None)
            futures = getattr(client, 'futures', {}) or {}
            hashes = list(futures.keys())[:3]
            error = getattr(client, 'error', None)
            print(
                '[TEST_WARNING] TIMEOUT_CAUSE'
                + ' verdict=' + classify_client(client, now)
                + ' url=' + str(getattr(client, 'url', '?'))
                + ' connected=' + str(client.isConnected)
                + ' connecting=' + str(getattr(client, 'connecting', False))
                + ' established_age_s=' + (str(round((now - established) / 1000)) if established else 'never')
                + ' last_msg_age_s=' + (str(round((now - last_message) / 1000)) if last_message else 'none')
                + ' pending=' + str(len(futures))
                + ' hashes=' + str(hashes)
                + (' err=' + repr(error)[:120] if error else ''),
                flush=True,
            )

    async def main ():
        watchdog = None
        if isWs:
            watchdog = asyncio.ensure_future(timeout_cause_watchdog())
        try:
            await main_inner()
        finally:
            if watchdog is not None:
                watchdog.cancel()

    async def main_inner ():
        if (isBaseTests):
            if (isWs):
                await test_base_init_ws()
                print('base WS tests passed!')
            else:
                await base_tests_init()
                print('base REST tests passed!')
            if not runAll:
                exit(0)
        await testMainClassAsync().init(argvExchange, argvSymbol, argvMethod)

    asyncio.run(main())
