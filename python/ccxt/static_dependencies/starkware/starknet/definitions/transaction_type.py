from enum import auto

from services.everest.api.gateway.transaction_type import TransactionTypeBase

# The name of the schema for deprecated transactions. Must be of the form:
# "DEPRECATED_" + TransactionType.name.
DEPRECATED_DECLARE_SCHEMA_NAME = "DEPRECATED_DECLARE"
DEPRECATED_DEPLOY_ACCOUNT_SCHEMA_NAME = "DEPRECATED_DEPLOY_ACCOUNT"
DEPRECATED_INVOKE_FUNCTION_SCHEMA_NAME = "DEPRECATED_INVOKE_FUNCTION"
DEPRECATED_OLD_DECLARE_SCHEMA_NAME = "DEPRECATED_OLD_DECLARE"


class TransactionType(TransactionTypeBase):
    DECLARE = 0
    DEPLOY = auto()
    DEPLOY_ACCOUNT = auto()
    INITIALIZE_BLOCK_INFO = auto()
    INVOKE_FUNCTION = auto()
    L1_HANDLER = auto()
