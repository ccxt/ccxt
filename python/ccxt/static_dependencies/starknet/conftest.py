# This is needed for importing fixtures from `fixtures` directory
pytest_plugins = [
    "starknet_py.tests.e2e.fixtures.event_loop",
    "starknet_py.tests.e2e.fixtures.clients",
    "starknet_py.tests.e2e.fixtures.accounts",
    "starknet_py.tests.e2e.fixtures.contracts",
    "starknet_py.tests.e2e.fixtures.contracts_v1",
    "starknet_py.tests.e2e.fixtures.misc",
    "starknet_py.tests.e2e.fixtures.devnet",
    "starknet_py.tests.e2e.fixtures.constants",
    "starknet_py.tests.e2e.fixtures.proxy",
    "starknet_py.tests.e2e.client.fixtures.transactions",
    "starknet_py.tests.e2e.client.fixtures.prepare_network",
    "starknet_py.tests.e2e.tests_on_networks.fixtures",
]
