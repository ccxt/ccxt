from typing import Iterable
from .. import _abc as abc


class ProxyChain:
    def __init__(self, proxies: Iterable[abc.AsyncProxy]):
        self._proxies = proxies

    async def connect(self, dest_host, dest_port, timeout=None):
        curr_socket = None
        proxies = list(self._proxies)

        length = len(proxies) - 1
        for i in range(length):
            curr_socket = await proxies[i].connect(
                dest_host=proxies[i + 1].proxy_host,
                dest_port=proxies[i + 1].proxy_port,
                timeout=timeout,
                _socket=curr_socket
            )

        curr_socket = await proxies[length].connect(
            dest_host=dest_host,
            dest_port=dest_port,
            timeout=timeout,
            _socket=curr_socket
        )

        return curr_socket
