import json
from typing import Dict, Optional

from services.everest.api.gateway.gateway_client import EverestGatewayClient
from starkware.starknet.services.api.gateway.transaction import Transaction
from starkware.starknet.services.api.gateway.transaction_schema import TransactionSchema


class GatewayClient(EverestGatewayClient):
    """
    A client class for the StarkNet Gateway.
    """

    async def add_transaction(self, tx: Transaction, token: Optional[str] = None) -> Dict[str, str]:
        uri_suffix = "" if token is None else f"?token={token}"

        raw_response = await self._send_request(
            send_method="POST",
            uri=f"/add_transaction{uri_suffix}",
            data=TransactionSchema().dumps(obj=tx),
        )
        return json.loads(raw_response)
