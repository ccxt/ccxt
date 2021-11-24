class HeadersList(list):
    def __init__(self, value, headers):
        super(HeadersList, self).__init__(value)
        self.headers = headers


class HeadersDict(dict):
    def __init__(self, value, headers):
        super(HeadersDict, self).__init__(value)
        self.headers = headers
