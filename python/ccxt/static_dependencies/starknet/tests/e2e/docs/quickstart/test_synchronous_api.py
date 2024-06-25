# pylint: disable=import-outside-toplevel, no-member, duplicate-code


def test_synchronous_api(account, map_contract):
    # docs: start
    from contract import Contract

    contract_address = (
        "0x01336fa7c870a7403aced14dda865b75f29113230ed84e3a661f7af70fe83e7b"
    )
    # docs: end

    contract_address = map_contract.address

    # docs: start

    key = 1234
    contract = Contract.from_address_sync(address=contract_address, provider=account)

    invocation = contract.functions["put"].invoke_v1_sync(key, 7, max_fee=int(1e16))
    invocation.wait_for_acceptance_sync()

    (saved,) = contract.functions["get"].call_sync(key)  # 7
    # docs: end

    assert saved == 7
