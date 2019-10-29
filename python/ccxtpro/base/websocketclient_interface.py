import abc


class AbstractWebSocketClient(abc.ABC):
    @abc.abstractmethod
    def isConnected(self):
        pass

    @abc.abstractmethod
    def send(self, data):
        pass

    @abc.abstractmethod
    async def connect(self):
        pass

    @abc.abstractmethod
    async def close(self):
        pass
