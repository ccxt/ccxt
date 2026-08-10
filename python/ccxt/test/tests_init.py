# -*- coding: utf-8 -*-

# tier-1 watchdog, armed before any heavy import: under a saturated ci
# runner the cold ccxt import chain alone can outlive the orchestrator's
# 120s budget, producing mass RUNTEST_TIMED_OUT with zero test markers and
# leaving the post-import asyncio watchdog never armed. A plain daemon
# timer from the stdlib names that failure class while stdout is still
# being captured. Cancelled in main() where the tier-2 watchdog takes over
import sys as _sys
import time as _time

# single epoch for both watchdog tiers: the orchestrator's budget runs from
# process spawn, so every deadline must be measured from here, not from
# whenever imports happen to finish
_process_started = _time.time()


def _warn(line):
    # run-tests.js generateResultFromOutput scans stderr for the TEST_WARNING
    # pattern while the harvester keeps the full stdout copy of the child, so
    # every forensic line goes to both streams, flushed, see
    # https://github.com/ccxt/ccxt/pull/29726
    print(line, flush=True)
    print(line, file=_sys.stderr, flush=True)


_import_watchdog = None
if '--ws' in _sys.argv:
    import os as _os
    import threading as _threading
    _import_started = _process_started

    def _import_phase_alarm():
        _warn(
            '[TEST_WARNING] TIMEOUT_CAUSE verdict=IMPORT_PHASE elapsed='
            + str(int(_time.time() - _import_started)) + 's pid=' + str(_os.getpid())
            + ' the child never reached the tests before the orchestrator budget,'
            + ' imports still running, ci runner likely saturated'
        )
    _import_watchdog = _threading.Timer(105.0, _import_phase_alarm)
    _import_watchdog.daemon = True
    _import_watchdog.start()

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
        # deadlines are anchored to process start, the orchestrator's clock,
        # not to main(): under a loaded runner imports alone can consume tens
        # of seconds. Two shots instead of one because an event loop starved
        # by runner-wide contention can lag a sleep wakeup past the output
        # harvest, an early shot at 60 percent of the budget survives heavy
        # lag and a second at 75 percent refreshes the picture closer to the
        # deadline. Every line carries fired_at so scheduler drift is
        # measurable from the logs, and the body prints its own failure
        # instead of dying silently. stdout is a block-buffered pipe under
        # the orchestrator and a timed-out child is harvested before it
        # exits, so every print flushes immediately
        import time
        for fraction in (0.6, 0.75):
            target = WS_ORCHESTRATOR_BUDGET_SECONDS * fraction
            remaining = target - (time.time() - _process_started)
            if remaining > 0:
                await asyncio.sleep(remaining)
            fired_at = ' fired_at=' + str(int(time.time() - _process_started)) + 's'
            try:
                import gc
                from ccxt.async_support.base.ws.client import Client as WsClient
                now = int(time.time() * 1000)
                clients = [obj for obj in gc.get_objects() if isinstance(obj, WsClient)]
                if not clients:
                    _warn('[TEST_WARNING] TIMEOUT_CAUSE no live ws clients' + fired_at)
                for client in clients:
                    established = getattr(client, 'connectionEstablished', None)
                    last_message = getattr(client, 'last_message_at', None)
                    futures = getattr(client, 'futures', {}) or {}
                    hashes = list(futures.keys())[:3]
                    error = getattr(client, 'error', None)
                    _warn(
                        '[TEST_WARNING] TIMEOUT_CAUSE'
                        + ' verdict=' + classify_client(client, now)
                        + ' url=' + str(getattr(client, 'url', '?'))
                        + ' connected=' + str(client.isConnected)
                        + ' connecting=' + str(getattr(client, 'connecting', False))
                        + ' established_age_s=' + (str(round((now - established) / 1000)) if established else 'never')
                        + ' last_msg_age_s=' + (str(round((now - last_message) / 1000)) if last_message else 'none')
                        + ' pending=' + str(len(futures))
                        + ' hashes=' + str(hashes)
                        + (' err=' + repr(error)[:120] if error else '')
                        + fired_at
                    )
            except BaseException as watchdog_error:
                _warn('[TEST_WARNING] TIMEOUT_CAUSE watchdog_error=' + repr(watchdog_error)[:200] + fired_at)

    async def main ():
        if _import_watchdog is not None:
            _import_watchdog.cancel()
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
