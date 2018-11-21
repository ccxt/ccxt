# -*- coding: utf-8 -*-


class AsyncSymbolContext:
    def __init__(self, conxid):
        self.subscribed = False
        self.subscribing = False
        self.data = {}
        self.conxid = conxid

    def reset(self):
        self.subscribed = False
        self.subscribing = False
        self.data = {}
