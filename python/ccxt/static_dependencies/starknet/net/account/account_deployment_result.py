from dataclasses import dataclass

from contract import SentTransaction
from utils.sync import add_sync_methods


@add_sync_methods
@dataclass(frozen=True)
class AccountDeploymentResult(SentTransaction):
    """
    Result of the :meth:`Account.deploy_account <starknet_py.net.account.account.Account.deploy_account>` method.
    """

    account: "Account" = None  # pyright: ignore
    """Account instance created during the deployment."""

    def __post_init__(self):
        if self.account is None:
            raise ValueError(
                "Parameter account cannot be None in AccountDeploymentResult."
            )
