# -*- coding: utf-8 -*-

""" AsyncConnection """

__all__ = [
    'WebsocketBaseConnection'
]

from pyee import EventEmitter
from abc import ABC, abstractmethod
import json


class WebsocketBaseConnection (ABC, EventEmitter):
    def __init__(self):
        super(WebsocketBaseConnection, self).__init__()

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def close(self):
        pass

    @abstractmethod
    def send(self, data):
        pass

    def sendJson(self, data):
        self.send(json.dumps(data))
