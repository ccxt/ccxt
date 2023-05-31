class SyncProxy:
    def connect(self, dest_host, dest_port, timeout=None, **kwargs):
        raise NotImplementedError()

    @property
    def proxy_host(self):
        raise NotImplementedError()

    @property
    def proxy_port(self):
        raise NotImplementedError()


class AsyncProxy:
    async def connect(self, dest_host, dest_port, timeout=None, **kwargs):
        raise NotImplementedError()

    @property
    def proxy_host(self):
        raise NotImplementedError()

    @property
    def proxy_port(self):
        raise NotImplementedError()


class SyncResolver:
    def resolve(self, host, port=0, family=0):
        raise NotImplementedError()


class AsyncResolver:
    async def resolve(self, host, port=0, family=0):
        raise NotImplementedError()


class SyncSocketStream:

    def write_all(self, data: bytes):
        raise NotImplementedError()

    def read(self, max_bytes: int = None):
        raise NotImplementedError()

    def read_exact(self, n: int):
        raise NotImplementedError()

    def close(self):
        raise NotImplementedError()


class AsyncSocketStream:
    async def write_all(self, data: bytes):
        raise NotImplementedError()

    async def read(self, max_bytes: int = None):
        raise NotImplementedError()

    async def read_exact(self, n: int):
        raise NotImplementedError()

    async def close(self):
        raise NotImplementedError()
