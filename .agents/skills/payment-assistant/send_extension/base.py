"""
PaymentExtension base class.

Each payment type (C2C, PIX, ...) implements this interface.
The main payment_skill.py dispatches to the matched extension.
"""
from typing import Dict, Any, Optional


class PaymentExtension:
    """Base class for payment type extensions."""

    payment_type: str = ''   # e.g. 'C2C', 'PIX'
    endpoints: Dict[str, str] = {}  # endpoint_key -> path

    def detect(self, raw_qr: str) -> bool:
        """Return True if this extension handles the given QR data."""
        return False

    def purchase(self, api: Any, raw_qr: str, state_helpers: Dict[str, Any]):
        """
        Step 1: Parse QR code and save order state.

        Args:
            api: PaymentAPI instance (for making HTTP requests)
            raw_qr: Raw QR code string
            state_helpers: Dict with helper functions:
                - set_order_status(status, **fields)
                - update_state(updates)
                - OrderStatus enum
        """
        raise NotImplementedError

    def build_confirm_params(self, state: Dict[str, Any], amount: str, currency: str) -> Dict[str, Any]:
        """Build request params for confirmPayment API."""
        raise NotImplementedError

    def get_confirm_endpoint(self) -> str:
        """Return the endpoint key for confirmPayment."""
        raise NotImplementedError

    def get_poll_endpoint(self) -> str:
        """Return the endpoint key for queryPaymentStatus."""
        raise NotImplementedError

    def build_poll_params(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Build request params for queryPaymentStatus API."""
        return {'payOrderId': state.get('pay_order_id', '')}
