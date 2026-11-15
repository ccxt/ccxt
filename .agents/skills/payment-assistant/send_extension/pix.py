"""
PIX Payment Extension.

Handles Brazilian PIX EMV QR code payments (BR Code / Copia e Cola).
"""
import json
from typing import Dict, Any

from .base import PaymentExtension

# Payment type constant
PAYMENT_TYPE_PIX = 'PIX'


# ============================================================
# Data Models
# ============================================================
class PixParseQrResponse:
    """Response from Pix parseQr API"""
    def __init__(self, data: Dict[str, Any]):
        self.checkout_id = data.get('checkoutId', '')
        self.status = data.get('status', '')
        # Receiver info
        self.receiver_name = data.get('receiverName', '')
        self.receiver_psp = data.get('receiverPsp', '')
        self.receiver_cnpj = data.get('receiverCnpj', '')
        self.receiver_cpf = data.get('receiverCpf', '')
        self.receiver_identifier = data.get('receiverIdentifier', '')
        # Bill info
        self.debtor_name = data.get('debtorName', '')
        self.bill_due_date = data.get('billDueDate')
        self.bill_amount = data.get('billAmount')
        self.allow_amount_edit = data.get('allowAmountEdit', True)
        # Limits (from Pix backend)
        self.max_limit = data.get('maxLimit')
        self.min_limit = data.get('minLimit')
        self.limit_type = data.get('limitType', '')
        self.limit_period_type = data.get('limitPeriodType', '')
        # Limits (from Skills config)
        self.single_transaction_limit = data.get('singleTransactionLimit')
        self.daily_limit = data.get('dailyLimit')
        # Additional info
        self.additional_infos = data.get('additionalInfos', [])
        self.allow_note_add = data.get('allowNoteAdd', False)

    @property
    def has_preset_amount(self) -> bool:
        """Check if this QR has a preset amount (non-editable bill)"""
        return (self.bill_amount is not None
                and float(self.bill_amount) > 0
                and not self.allow_amount_edit)

    @property
    def display_name(self) -> str:
        """Get display name for the receiver"""
        return self.receiver_name or self.debtor_name or 'Unknown'

    @property
    def display_document(self) -> str:
        """Get masked document for display"""
        if self.receiver_cnpj:
            return f"CNPJ: {self.receiver_cnpj}"
        if self.receiver_cpf:
            return f"CPF: {self.receiver_cpf}"
        return ''


class PixConfirmPaymentResponse:
    """Response from Pix confirmPayment API"""
    def __init__(self, data: Dict[str, Any]):
        self.pay_order_id = data.get('payOrderId', '')
        self.status = data.get('status', '')
        self.usd_amount = data.get('usdAmount')
        self.daily_used_before = data.get('dailyUsedBefore')
        self.daily_used_after = data.get('dailyUsedAfter')


# ============================================================
# PIX EMV QR Code Parser (local preview)
# ============================================================
def parse_pix_emv_qr(qr_string: str) -> Dict[str, Any]:
    """
    Parse PIX EMV QR code (TLV format) for local preview display.

    This extracts merchant info from the QR data before calling the API.
    The API response is authoritative; this is just for quick preview.

    EMVCo TLV format: Tag(2) + Length(2) + Value(Length)

    Key tags:
    - 53: Transaction Currency (986=BRL)
    - 54: Transaction Amount
    - 58: Country Code
    - 59: Merchant Name
    - 60: Merchant City
    - 26: Merchant Account Info (contains sub-TLV with br.gov.bcb.pix)
    """
    result = {
        'currency': 'BRL',  # default for PIX
        'country': 'BR',
    }
    try:
        i = 0
        while i + 4 <= len(qr_string):
            tag = qr_string[i:i + 2]
            length = int(qr_string[i + 2:i + 4])
            if i + 4 + length > len(qr_string):
                break
            value = qr_string[i + 4:i + 4 + length]
            i += 4 + length

            if tag == '59':
                result['merchant_name'] = value
            elif tag == '60':
                result['merchant_city'] = value
            elif tag == '53':
                result['currency_code'] = value
                if value == '986':
                    result['currency'] = 'BRL'
            elif tag == '54':
                try:
                    result['amount'] = float(value)
                except ValueError:
                    result['amount_raw'] = value
            elif tag == '58':
                result['country'] = value
    except Exception:
        pass
    return result


# ============================================================
# PIX Extension
# ============================================================
class PixExtension(PaymentExtension):
    """PIX EMV QR Code payment extension."""

    payment_type = PAYMENT_TYPE_PIX

    endpoints = {
        'parse_qr': '/binancepay/openapi/user/pix/parseQr',
        'confirm_payment': '/binancepay/openapi/user/pix/confirmPayment',
        'query_payment_status': '/binancepay/openapi/user/pix/queryPaymentStatus',
    }

    def detect(self, raw_qr: str) -> bool:
        """PIX EMV QR codes contain 'br.gov.bcb.pix' as GUI identifier."""
        if not raw_qr:
            return False
        return 'br.gov.bcb.pix' in raw_qr.lower()

    def purchase(self, api, raw_qr: str, state_helpers: Dict[str, Any]):
        """PIX purchase flow - Step 1: Parse PIX QR code"""
        set_order_status = state_helpers['set_order_status']
        update_state = state_helpers['update_state']
        OrderStatus = state_helpers['OrderStatus']

        # Show local preview from EMV data (before API call)
        preview = parse_pix_emv_qr(raw_qr)
        if preview.get('merchant_name') or preview.get('amount'):
            print("📋 QR Preview (local decode):")
            if preview.get('merchant_name'):
                print(f"   🏪 Merchant: {preview.get('merchant_name', '')}", end='')
                if preview.get('merchant_city'):
                    print(f" ({preview['merchant_city']})", end='')
                print()
            if preview.get('amount'):
                print(f"   💰 Amount: {preview['amount']} {preview.get('currency', 'BRL')}")
            print()

        # Call PIX parseQr API
        print("🔍 [Step 1] Parsing PIX QR code...")
        parse_result = api.make_parsed_request(
            self.endpoints['parse_qr'],
            {'rawQr': raw_qr},
            PixParseQrResponse,
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

        # Determine currency (PIX is typically BRL)
        currency = 'BRL'

        # Determine amount
        amount = order_info.bill_amount
        pix_has_amount = amount is not None and float(amount) > 0
        pix_amount_locked = pix_has_amount  # True = amount from QR, cannot be changed

        # Save order info to state
        set_order_status(OrderStatus.QR_PARSED,
            checkout_id=order_info.checkout_id,
            biz_type='PIX',
            nickname=order_info.display_name,
            receiver_psp=order_info.receiver_psp,
            receiver_document=order_info.display_document,
            currency=currency,
            currency_fixed=True,  # PIX is always BRL
            has_preset_amount=pix_has_amount,
            preset_amount=str(amount) if amount else None,
            allow_amount_edit=not pix_amount_locked,
            pix_amount_locked=pix_amount_locked,
            single_transaction_limit=str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
            daily_limit=str(order_info.daily_limit) if order_info.daily_limit else None,
            pix_max_limit=str(order_info.max_limit) if order_info.max_limit else None,
            pix_min_limit=str(order_info.min_limit) if order_info.min_limit else None,
            additional_infos=order_info.additional_infos,
        )

        print(f"✅ PIX QR Parsed Successfully")
        print(f"   📝 Checkout ID: {order_info.checkout_id}")
        print(f"   🏪 Receiver: {order_info.display_name}")
        if order_info.receiver_psp:
            print(f"   🏦 Bank: {order_info.receiver_psp}")
        if order_info.display_document:
            print(f"   📄 {order_info.display_document}")
        print(f"   💱 Currency: {currency}")
        if order_info.single_transaction_limit:
            print(f"   📊 Single Limit: {order_info.single_transaction_limit} USD")
        if order_info.daily_limit:
            print(f"   📊 Daily Limit: {order_info.daily_limit} USD")
        if order_info.additional_infos:
            print(f"   📎 Additional Info:")
            for info in order_info.additional_infos:
                print(f"      {info.get('key', '')}: {info.get('value', '')}")
        print()

        # Output result based on whether QR has amount
        if pix_has_amount:
            print("════════════════════════════════════════════════════")
            print(f"💰 Amount: {amount} {currency} (from QR, cannot be modified)")
            print("════════════════════════════════════════════════════")
            print()
            print("💡 Reply 'y' to confirm payment, 'n' to cancel")
            update_state({
                'suggested_amount': float(amount),
                'needs_amount_input': False,
                'order_status': OrderStatus.AMOUNT_SET.value
            })
            print(json.dumps({
                'status': 'AWAITING_CONFIRMATION',
                'checkout_id': order_info.checkout_id,
                'biz_type': 'PIX',
                'payment_type': PAYMENT_TYPE_PIX,
                'payee': order_info.display_name,
                'receiver_psp': order_info.receiver_psp,
                'amount': str(amount),
                'currency': currency,
                'has_preset_amount': True,
                'pix_amount_locked': True,
                'single_transaction_limit': str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
                'daily_limit': str(order_info.daily_limit) if order_info.daily_limit else None
            }))
        else:
            print("════════════════════════════════════════════════════")
            print("📝 No preset amount")
            print("════════════════════════════════════════════════════")
            print()
            min_hint = f" (min: {order_info.min_limit})" if order_info.min_limit else ""
            max_hint = f" (max: {order_info.max_limit})" if order_info.max_limit else ""
            print(f"💡 Please enter the amount in {currency}{min_hint}{max_hint}")
            update_state({
                'needs_amount_input': True,
                'order_status': OrderStatus.AWAITING_AMOUNT.value
            })
            print(json.dumps({
                'status': 'AWAITING_AMOUNT',
                'checkout_id': order_info.checkout_id,
                'biz_type': 'PIX',
                'payment_type': PAYMENT_TYPE_PIX,
                'payee': order_info.display_name,
                'receiver_psp': order_info.receiver_psp,
                'currency': currency,
                'has_preset_amount': False,
                'pix_amount_locked': False,
                'pix_min_limit': str(order_info.min_limit) if order_info.min_limit else None,
                'pix_max_limit': str(order_info.max_limit) if order_info.max_limit else None,
                'single_transaction_limit': str(order_info.single_transaction_limit) if order_info.single_transaction_limit else None,
                'daily_limit': str(order_info.daily_limit) if order_info.daily_limit else None
            }))

    def build_confirm_params(self, state: Dict[str, Any], amount: str, currency: str) -> Dict[str, Any]:
        """Build PIX confirmPayment params (no bizType needed)."""
        return {
            'checkoutId': state.get('checkout_id', ''),
            'currency': currency,
            'amount': float(amount),
        }

    def get_confirm_endpoint(self) -> str:
        return self.endpoints['confirm_payment']

    def get_poll_endpoint(self) -> str:
        return self.endpoints['query_payment_status']

    def build_poll_params(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """PIX poll does NOT include bizType."""
        return {'payOrderId': state.get('pay_order_id', '')}
