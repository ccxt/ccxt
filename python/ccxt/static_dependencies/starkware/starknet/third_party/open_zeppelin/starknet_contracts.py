import os.path

from starkware.starknet.services.api.contract_class.contract_class import DeprecatedCompiledClass

DIR = os.path.dirname(__file__)

account_contract = DeprecatedCompiledClass.loads(
    data=open(os.path.join(DIR, "account.json")).read()
)
