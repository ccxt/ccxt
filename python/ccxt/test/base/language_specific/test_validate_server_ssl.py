import os
import sys
import asyncio
import subprocess

python_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(python_root)

import ccxt  # noqa: F402
import ccxt.async_support as ccxt_async  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled): validateServerSsl = False must let
# sync REST, async REST and WS connect to a server whose certificate is self-signed,
# expired and issued for another hostname, while the default (True) must reject it.
# the shared server lives in ts/src/test/static/ssl/server.cjs
# ----------------------------------------------------------------------------

SSL_SERVER_SCRIPT = os.path.join(os.path.dirname(python_root), 'ts', 'src', 'test', 'static', 'ssl', 'server.cjs')


def start_ssl_server():
    process = subprocess.Popen(['node', SSL_SERVER_SCRIPT], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    port = int(process.stdout.readline().decode().strip())
    return process, port


def stop_ssl_server(process):
    try:
        process.stdin.close()
    except Exception:
        pass
    process.kill()
    process.wait()


def sync_rest_fails(url, config):
    exchange = ccxt.Exchange(config)
    try:
        exchange.fetch(url)
    except ccxt.NetworkError:
        return True
    return False


async def async_rest(url, config):
    exchange = ccxt_async.Exchange(config)
    try:
        return await exchange.fetch(url)
    finally:
        await exchange.close()


async def async_ws(url, config, flip_after_open=False):
    exchange = ccxt_async.Exchange(config)
    if flip_after_open:
        # the session connector is built strict here, so only the per-connection ssl=False can let it through
        exchange.open()
        exchange.validateServerSsl = False
    received = asyncio.get_running_loop().create_future()

    def handle_message(client, message):
        if not received.done():
            received.set_result(message)

    def on_error(client, error):
        if not received.done():
            received.set_exception(error)

    exchange.handle_message = handle_message
    exchange.on_error = on_error
    try:
        client = exchange.client(url)
        client.connect(exchange.session)
        return await asyncio.wait_for(received, 10)
    finally:
        await exchange.close()


async def test_validate_server_ssl():
    process, port = start_ssl_server()
    rest_url = 'https://127.0.0.1:' + str(port) + '/ping'
    ws_url = 'wss://127.0.0.1:' + str(port) + '/ws'
    strict = {'id': 'ssltest', 'timeout': 5000}
    lax = {'id': 'ssltest', 'timeout': 5000, 'validateServerSsl': False}
    try:
        assert ccxt.Exchange(strict).validateServerSsl is True
        # sync REST
        assert sync_rest_fails(rest_url, strict), 'sync REST must fail against an invalid certificate by default'
        assert ccxt.Exchange(lax).fetch(rest_url) == {'ok': True}
        # async REST
        try:
            await async_rest(rest_url, strict)
            raise AssertionError('async REST must fail against an invalid certificate by default')
        except ccxt.NetworkError:
            pass
        assert await async_rest(rest_url, lax) == {'ok': True}
        # WS
        try:
            await async_ws(ws_url, strict)
            raise AssertionError('WS must fail against an invalid certificate by default')
        except ccxt.NetworkError:
            pass
        assert await async_ws(ws_url, lax) == {'ok': True}
        assert await async_ws(ws_url, strict, flip_after_open=True) == {'ok': True}, 'WS must honor validateServerSsl set after open()'
    finally:
        stop_ssl_server(process)
    print('validateServerSsl tests passed')


if __name__ == '__main__':
    asyncio.run(test_validate_server_ssl())
