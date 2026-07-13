"""
C2C Payment Extension.

Handles Binance C2C QR Code payments (URL-based QR codes).
"""
import json
from typing import Dict, Any

from .base import PaymentExtension

# Payment type constant
PAYMENT_TYPE_C2C = 'C2C'


# ============================================================
# Data Models
# ============================================================
class C2cParseQrResponse:
    """Response from C2C parseQr API"""
    def __init__(self, data: Dict[str, Any]):
        self.checkout_id = data.get('checkoutId', '')
        self.checkout_type = data.get('checkoutType', '')
        self.biz_type = data.get('bizType', '')
        self.nickname = data.get('nickname', '')
        self.avatar_url = data.get('avatarUrl', '')
        self.currency = data.get('currency', '')
        self.currency_fixed = data.get('currencyFixed', False)
        self.amount = data.get('amount')
        self.has_preset_amount = data.get('hasPresetAmount', False)
        self.description = data.get('description', '')
        self.single_transaction_limit = data.get('singleTransactionLimit')
        self.daily_limit = data.get('dailyLimit')


class C2cConfirmPaymentResponse:
    """Response from C2C confirmPayment API"""
    def __init__(self, data: Dict[str, Any]):
        self.pay_order_id = data.get('payOrderId', '')
        self.status = data.get('status', '')
        self.usd_amount = data.get('usdAmount')
        self.daily_used_before = data.get('dailyUsedBefore')
        self.daily_used_after = data.get('dailyUsedAfter')


# ============================================================
# C2C Extension
# ============================================================
class C2cExtension(PaymentExtension):
    """C2C QR Code payment extension."""

    payment_type = PAYMENT_TYPE_C2C

    # OpenAPI endpoints
    endpoints = {
        'parse_qr': '/binancepay/openapi/user/c2c/parseQr',
        'confirm_payment': '/binancepay/openapi/user/c2c/confirmPayment',
        'query_payment_status': '/binancepay/openapi/user/c2c/queryPaymentStatus',
    }

    def detect(self, raw_qr: str) -> bool:
        """C2C is the default/fallback — matches anything that isn't PIX."""
        # C2C detection is intentionally broad; PIX is checked first in registry.
        return True

    def purchase(self, api, raw_qr: str, state_helpers: Dict[str, Any]):
        """C2C purchase flow - Step 1: Parse C2C QR code"""
        set_order_status = state_helpers['set_order_status']
        update_state = state_helpers['update_state']
        OrderStatus = state_helpers['OrderStatus']

        print("🔍 [Step 1] Parsing QR code...")
        parse_result = api.make_parsed_request(
            self.endpoints['parse_qr'],
            {'rawQr': raw_qr},
            C2cParseQrResponse,
            use_body=True
        )

        if not parse_result['success']:
            error_status = parse_result.get('status', 'ERROR')
            error_msg = parse_result.get('message', 'Parse QR failed')
            error_hint = parse_result.get('hint', '')

            print(f"❌ {error_msg}")
            if error_hint:
                print(f"💡 {error_hint}")

            set_order_status(OrderStatus.FAILED, error_message=error_msg, error_code=parse_result.get('code'))
            print(json.dumps({
                'status': error_status,
                'code': parse_result.get('code'),
                'message': error_msg,
                'hint': error_hint
            }))
            return

        order_info = parse_result['order_info']

        # Save order info to state
        set_order_status(OrderStatus.QR_PARSED,
            checkout_id=order_info.checkout_id,
            biz_type=order_info.biz_type,
            nickname=order_info.nickname,
            avatar_url=order_info.avatar_url,
            currency=order_info.currency or 'USDT',
            currency_fixed=order_info.currency_fixed,
            has_preset_amount=order_info.has_preset_amount,
            preset_amount=str(order_info.amount) if order_info.amount else None,
            description=order_info.description,
            single_transaction_limit=str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
            daily_limit=str(order_info.daily_limit) if order_info.daily_limit else None
        )

        print(f"✅ QR Parsed Successfully")
        print(f"   📝 Checkout ID: {order_info.checkout_id}")
        print(f"   🏪 Payee: {order_info.nickname}")
        print(f"   💱 Currency: {order_info.currency or 'Not specified'}")
        if order_info.single_transaction_limit:
            print(f"   📊 Single Limit: {order_info.single_transaction_limit} USD")
        if order_info.daily_limit:
            print(f"   📊 Daily Limit: {order_info.daily_limit} USD")
        print()

        # Output result based on preset amount
        if order_info.has_preset_amount and order_info.amount:
            currency = order_info.currency or 'USDT'
            print("════════════════════════════════════════════════════")
            print(f"💰 Preset Amount: {order_info.amount} {currency}")
            print("════════════════════════════════════════════════════")
            print()
            print("💡 Reply 'y' to confirm payment, 'n' to cancel")
            update_state({
                'suggested_amount': float(order_info.amount),
                'needs_amount_input': False,
                'order_status': OrderStatus.AMOUNT_SET.value
            })
            print(json.dumps({
                'status': 'AWAITING_CONFIRMATION',
                'checkout_id': order_info.checkout_id,
                'biz_type': order_info.biz_type,
                'payment_type': PAYMENT_TYPE_C2C,
                'payee': order_info.nickname,
                'amount': str(order_info.amount),
                'currency': currency,
                'has_preset_amount': True,
                'single_transaction_limit': str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
                'daily_limit': str(order_info.daily_limit) if order_info.daily_limit else None
            }))
        else:
            currency = order_info.currency or 'USDT'
            print("════════════════════════════════════════════════════")
            print("📝 No preset amount")
            print("════════════════════════════════════════════════════")
            print()
            print(f"💡 Please enter the amount (e.g., '100' or '100 USDT')")
            update_state({
                'needs_amount_input': True,
                'order_status': OrderStatus.AWAITING_AMOUNT.value
            })
            print(json.dumps({
                'status': 'AWAITING_AMOUNT',
                'checkout_id': order_info.checkout_id,
                'biz_type': order_info.biz_type,
                'payment_type': PAYMENT_TYPE_C2C,
                'payee': order_info.nickname,
                'currency': currency,
                'has_preset_amount': False,
                'single_transaction_limit': str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
                'daily_limit': str(order_info.daily_limit) if order_info.daily_limit else None
            }))

    def build_confirm_params(self, state: Dict[str, Any], amount: str, currency: str) -> Dict[str, Any]:
        """Build C2C confirmPayment params (includes bizType)."""
        return {
            'checkoutId': state.get('checkout_id', ''),
            'bizType': state.get('biz_type', 'C2C_QR_CODE'),
            'currency': currency,
            'amount': float(amount),
        }

    def get_confirm_endpoint(self) -> str:
        return self.endpoints['confirm_payment']

    def get_poll_endpoint(self) -> str:
        return self.endpoints['query_payment_status']

    def build_poll_params(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """C2C poll includes bizType."""
        params = {'payOrderId': state.get('pay_order_id', '')}
        biz_type = state.get('biz_type')
        if biz_type:
            params['bizType'] = biz_type
        return params
