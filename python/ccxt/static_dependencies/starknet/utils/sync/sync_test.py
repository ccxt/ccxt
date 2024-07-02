import asyncio

import pytest

from utils.sync import add_sync_methods


@add_sync_methods
class Function:
    def __init__(self):
        self.name = "function X"

    @staticmethod
    async def call():
        await asyncio.sleep(0.1)
        return 1

    @staticmethod
    async def failure():
        # pylint: disable=broad-exception-raised
        raise Exception("Error")

    def get_name(self):
        return self.name

    @staticmethod
    async def method():
        return 1

    @staticmethod
    def method_sync():
        # Shouldn't be overridden
        return 2


@add_sync_methods
class Repository:
    def __init__(self):
        self.function = Function()

    async def get_function(self):
        await asyncio.sleep(0.1)
        return self.function


# pylint: disable=no-member
@add_sync_methods
class Contract:
    def __init__(self, address):
        self.address = address

    @staticmethod
    async def get_repository():
        await asyncio.sleep(0.1)
        return Repository()

    @classmethod
    async def example_class_method(cls):
        await asyncio.sleep(0.1)
        return 2


@pytest.mark.asyncio
async def test_asynchronous_versions():
    contract = Contract("1")
    repository = await contract.get_repository()
    function = await repository.get_function()

    assert await function.call() == 1
    assert function.get_name() == "function X"
    assert await contract.example_class_method() == 2
    assert await Function.method() == 1
    assert Function.method_sync() == 2

    with pytest.raises(Exception):
        await function.failure()


def test_sync_versions():
    contract = Contract("1")
    # Ignore typing, because _sync is added dynamically
    repository = contract.get_repository_sync()  # pyright: ignore
    function = repository.get_function_sync()  # pyright: ignore

    assert function.call_sync() == 1
    assert function.get_name() == "function X"
    assert contract.example_class_method_sync() == 2  # pyright: ignore

    with pytest.raises(Exception):
        function.failure_sync()
