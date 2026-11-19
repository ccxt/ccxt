import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import ccxt.pro  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated).
#
# gemini/bitopro authenticate by temporarily setting
# options['ws']['options']['headers'], calling client(url), and then putting
# the original headers back. in js, client() deepExtends the ws options into a
# new 'options' object, so the restore does not reach the client. python
# merged them with a shallow extend, so the client kept a reference to the
# same dict and the restore removed the auth headers it had just been given.
# every case below fails without copy_nested_dicts() in client().
# ----------------------------------------------------------------------------


async def test_client_keeps_headers_after_options_are_reassigned():
    # the exact gemini/bitopro pattern: reassign the headers key
    exchange = ccxt.pro.gemini()
    try:
        exchange.options['ws'] = {'options': {'headers': {'a': 1}}}
        client = exchange.client('ws://example.invalid/reassign')
        exchange.options['ws']['options']['headers'] = {}
        assert client.options['headers'] == {'a': 1}, f"client headers were changed by a later options write, got {client.options['headers']}"
    finally:
        await exchange.close()


async def test_client_keeps_headers_after_options_are_mutated():
    # in-place mutation of the nested headers dict must not leak in either
    exchange = ccxt.pro.gemini()
    try:
        exchange.options['ws'] = {'options': {'headers': {'a': 1}}}
        client = exchange.client('ws://example.invalid/mutate')
        exchange.options['ws']['options']['headers']['a'] = 2
        assert client.options['headers'] == {'a': 1}, f"client headers were changed by a later options write, got {client.options['headers']}"
    finally:
        await exchange.close()


async def test_clients_do_not_share_options():
    # a second client built with different headers must not change the first
    exchange = ccxt.pro.gemini()
    try:
        exchange.options['ws'] = {'options': {'headers': {'a': 1}}}
        first = exchange.client('ws://example.invalid/first')
        exchange.options['ws']['options']['headers'] = {'b': 2}
        second = exchange.client('ws://example.invalid/second')
        assert first.options['headers'] == {'a': 1}, f"first client headers changed, got {first.options['headers']}"
        assert second.options['headers'] == {'b': 2}, f"second client headers wrong, got {second.options['headers']}"
        assert first.options is not second.options, "clients must not share the options dict"
    finally:
        await exchange.close()


async def test_ws_client_options_copy():
    await test_client_keeps_headers_after_options_are_reassigned()
    await test_client_keeps_headers_after_options_are_mutated()
    await test_clients_do_not_share_options()


if __name__ == '__main__':
    asyncio.run(test_ws_client_options_copy())
    print('test_client_options_copy passed')
