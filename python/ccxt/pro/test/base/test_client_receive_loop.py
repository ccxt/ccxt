import asyncio
from types import SimpleNamespace

from aiohttp import WSMessage, WSMsgType
from aiohttp._websocket.reader_py import WebSocketDataQueue

from ccxt import NetworkError
from ccxt.async_support.base.ws.client import Client, MSG_SIZE_OVERHEAD


class QueueProtocol:
    def __init__(self):
        self._reading_paused = False
        self.resumes = 0

    def pause_reading(self):
        self._reading_paused = True

    def resume_reading(self):
        self._reading_paused = False
        self.resumes += 1


class QueueConnection:
    def __init__(self, queue):
        self.closed = False
        self.queue = queue
        self._conn = SimpleNamespace(protocol=SimpleNamespace(_payload=queue))

    async def receive(self):
        self.receiver = asyncio.current_task()
        return await self.queue.read()


async def check_receive_loop(queue_class, count):
    loop = asyncio.get_running_loop()
    protocol = QueueProtocol()
    queue = queue_class(protocol, 128, loop=loop)
    connection = QueueConnection(queue)
    received = []
    concurrent_progress = []
    done = asyncio.Event()
    errors = []

    def on_message(client, message):
        received.append(message['sequence'])
        if len(received) == 1:
            # A watcher, timeout or another connection becomes ready while a
            # busy socket still has a backlog. It must get a turn promptly.
            loop.call_soon(lambda: concurrent_progress.append(len(received)))
        if len(received) == count:
            connection.closed = True
            done.set()

    client = Client('wss://example.invalid', on_message, None, lambda *_: None, None)
    client.asyncio_loop = loop
    client.connection = connection
    original_handler = loop.get_exception_handler()
    loop.set_exception_handler(lambda _, context: errors.append(context))
    for sequence in range(count):
        data = '{"sequence":' + str(sequence) + '}'
        queue.feed_data(WSMessage(WSMsgType.TEXT, data, ''), len(data))
    try:
        client.receive_loop()
        await asyncio.wait_for(done.wait(), 2)
        # Run the final receive-loop callback, which sees the closed socket.
        await asyncio.sleep(0)
        assert received == list(range(count)), 'frames must be delivered once and in order'
        assert len(queue._buffer) == 0
        # Older aiohttp C extensions keep _size private. Check it directly
        # where exposed and verify flow-control thresholds on every version.
        if hasattr(queue, '_size'):
            assert queue._size == 0, 'manual reads must preserve aiohttp byte accounting'
        assert not protocol._reading_paused, 'draining must resume the transport'
        probe = WSMessage(WSMsgType.TEXT, '{}', '')
        queue.feed_data(probe, 256 - MSG_SIZE_OVERHEAD)
        assert not protocol._reading_paused, 'the empty queue must accept exactly its byte limit'
        queue.feed_data(probe, 1)
        assert protocol._reading_paused, 'one more frame must exceed the byte limit'
        assert await queue.read() == probe
        assert not protocol._reading_paused
        assert await queue.read() == probe
        assert not queue._buffer
        assert not errors, errors
        if count >= 2048:
            assert concurrent_progress[0] < count // 2, (
                'ready tasks waited for almost the entire receive backlog', concurrent_progress)
    finally:
        connection.closed = True
        client.connected.cancel()
        loop.set_exception_handler(original_handler)


async def check_pending_receive(queue_class, cancel):
    loop = asyncio.get_running_loop()
    queue = queue_class(QueueProtocol(), 128, loop=loop)
    connection = QueueConnection(queue)
    client = Client('wss://example.invalid', lambda *_: None, None, lambda *_: None, None)
    client.asyncio_loop = loop
    client.connection = connection
    future = client.future('trades')
    errors = []
    original_handler = loop.get_exception_handler()
    loop.set_exception_handler(lambda _, context: errors.append(context))
    try:
        client.receive_loop()
        await asyncio.sleep(0)
        if cancel:
            connection.receiver.cancel()
            try:
                await connection.receiver
            except asyncio.CancelledError:
                pass
            assert not future.done(), 'receive cancellation must not invent a watch error'
        else:
            queue.set_exception(OSError('connection lost'))
            try:
                await asyncio.wait_for(future, 1)
                assert False, 'receive errors must reject pending watchers'
            except NetworkError as error:
                assert str(error) == 'connection lost'
        await asyncio.sleep(0)
        assert not errors, errors
    finally:
        connection.closed = True
        future.cancel()
        client.connected.cancel()
        loop.set_exception_handler(original_handler)


async def test_client_receive_loop():
    queue_classes = [WebSocketDataQueue]
    try:
        from aiohttp._websocket.reader_c import WebSocketDataQueue as CWebSocketDataQueue
        queue_classes.append(CWebSocketDataQueue)
    except ImportError:
        pass  # aiohttp can be installed without its optional native extensions
    for queue_class in queue_classes:
        for count in (1, 2, 10, 100, 101, 102, 2048):
            await check_receive_loop(queue_class, count)
        for cancel in (False, True):
            await check_pending_receive(queue_class, cancel)


if __name__ == '__main__':
    asyncio.run(test_client_receive_loop())
    print('test_client_receive_loop passed')
