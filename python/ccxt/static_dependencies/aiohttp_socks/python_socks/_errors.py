class ProxyError(Exception):
    def __init__(self, message, error_code=None):
        super().__init__(message)
        self.error_code = error_code


class ProxyTimeoutError(Exception):
    pass


class ProxyConnectionError(OSError):
    pass
