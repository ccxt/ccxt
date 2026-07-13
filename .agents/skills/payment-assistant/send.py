#!/usr/bin/env python3
"""
Payment Assistant - Send Actions

All send/pay action functions + QRCodeHandler.
Extracted from payment_skill.py — logic unchanged.
"""
import os
import json
import subprocess
import platform
import time
from typing import Dict, Any, Optional

try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    HAS_PYZBAR = True
except ImportError:
    HAS_PYZBAR = False

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

from common import (
    OrderStatus, SKILLS_ERROR_CODES,
    SKILL_DIR, CONFIG_FILE_PATH, STATE_FILE_PATH, QR_CODE_OUTPUT_PATH, INBOX_DIR, CLIPBOARD_IMAGE_PATH,
    API_KEY_GUIDE_MESSAGE,
    load_config, is_config_ready, show_config_guide, validate_config,
    load_state, update_state, set_order_status, get_order_status, clear_state, get_status_hint,
    PaymentAPI,
)
from send_extension import detect_extension, get_extension_by_type, get_all_endpoints

# API Endpoints - aggregated from all extensions
ENDPOINTS = get_all_endpoints()


# ============================================================
# State helpers dict - passed to extension.purchase()
# ============================================================
def _get_state_helpers() -> Dict[str, Any]:
    """Build the state_helpers dict that extensions use to manage state."""
    return {
        'set_order_status': set_order_status,
        'update_state': update_state,
        'OrderStatus': OrderStatus,
    }


# ============================================================
# QR Code Handler
# ============================================================
class QRCodeHandler:
    """Handle QR code generation, decoding, and clipboard/inbox image operations."""

    @staticmethod
    def generate_qr_image(qr_string: str, output_path: str = QR_CODE_OUTPUT_PATH) -> Optional[str]:
        """Generate QR code image from string"""
        if not HAS_QRCODE:
            return None
        try:
            qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=5, border=2)
            qr.add_data(qr_string)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            img.save(output_path)
            return output_path
        except:
            return None

    @staticmethod
    def decode_qr_from_image(image_path: str) -> Optional[str]:
        """Decode QR code from image file. Tries pyzbar first, then opencv."""
        # Try pyzbar first
        if HAS_PIL and HAS_PYZBAR:
            try:
                img = Image.open(image_path)
                decoded = pyzbar_decode(img)
                if decoded:
                    return decoded[0].data.decode('utf-8')
            except Exception:
                pass

        # Fallback to OpenCV
        if HAS_CV2:
            try:
                img = cv2.imread(image_path)
                if img is not None:
                    detector = cv2.QRCodeDetector()
                    data, _, _ = detector.detectAndDecode(img)
                    if data:
                        return data
            except Exception:
                pass

        return None

    @staticmethod
    def save_clipboard_image_macos(output_path: str) -> bool:
        """Save clipboard image to file on macOS using osascript"""
        try:
            script = f'''
            set theFile to POSIX file "{output_path}"
            try
                set imgData to the clipboard as «class PNGf»
                set fileRef to open for access theFile with write permission
                write imgData to fileRef
                close access fileRef
                return "success"
            on error
                return "no_image"
            end try
            '''
            result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True, timeout=5)
            return 'success' in result.stdout
        except:
            return False

    @staticmethod
    def save_clipboard_image_linux(output_path: str) -> bool:
        """Save clipboard image to file on Linux using xclip"""
        try:
            result = subprocess.run(
                ['xclip', '-selection', 'clipboard', '-t', 'image/png', '-o'],
                capture_output=True, timeout=5
            )
            if result.returncode == 0 and result.stdout:
                with open(output_path, 'wb') as f:
                    f.write(result.stdout)
                return True
        except:
            pass
        return False

    @staticmethod
    def save_clipboard_image_windows(output_path: str) -> bool:
        """Save clipboard image to file on Windows"""
        try:
            script = f'''
            Add-Type -AssemblyName System.Windows.Forms
            $img = [System.Windows.Forms.Clipboard]::GetImage()
            if ($img) {{
                $img.Save("{output_path}")
                Write-Output "success"
            }} else {{
                Write-Output "no_image"
            }}
            '''
            result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True, timeout=5)
            return 'success' in result.stdout
        except:
            return False

    @staticmethod
    def save_clipboard_image(output_path: str) -> bool:
        """Save clipboard image to file (cross-platform)"""
        system = platform.system().lower()
        if system == 'darwin':
            return QRCodeHandler.save_clipboard_image_macos(output_path)
        elif system == 'linux':
            return QRCodeHandler.save_clipboard_image_linux(output_path)
        elif system == 'windows':
            return QRCodeHandler.save_clipboard_image_windows(output_path)
        return False

    @staticmethod
    def decode_qr_from_clipboard() -> tuple:
        """
        Decode QR from clipboard image.
        Returns: (success: bool, qr_data: str or None, message: str)
        """
        os.makedirs(INBOX_DIR, exist_ok=True)

        if not QRCodeHandler.save_clipboard_image(CLIPBOARD_IMAGE_PATH):
            return False, None, "clipboard_no_image"

        qr_data = QRCodeHandler.decode_qr_from_image(CLIPBOARD_IMAGE_PATH)
        if qr_data:
            return True, qr_data, "success"
        else:
            return False, None, "decode_failed"

    @staticmethod
    def parse_emvco_qr(qr_string: str) -> Dict[str, str]:
        """Parse EMVCo QR code format to extract merchant info"""
        result = {}
        try:
            if '5918' in qr_string:
                idx = qr_string.index('5918') + 4
                result['merchant_name'] = qr_string[idx:idx+18].strip()
            if '6012' in qr_string:
                idx = qr_string.index('6012') + 4
                result['merchant_city'] = qr_string[idx:idx+12].strip()
            if '5802' in qr_string:
                idx = qr_string.index('5802') + 4
                result['country_code'] = qr_string[idx:idx+2]
        except:
            pass
        return result


# ============================================================
# Actions
# ============================================================
def action_config():
    """Show configuration status and guide user to complete setup"""
    config = load_config()
    is_valid, missing = validate_config(config)
    file_exists = os.path.exists(CONFIG_FILE_PATH)

    print()
    print("════════════════════════════════════════════════════")
    print("⚙️  Configuration Status")
    print("════════════════════════════════════════════════════")
    print()
    print(f"📁 Config file: {CONFIG_FILE_PATH}")
    print(f"   Status: {'✅ Exists' if file_exists else '❌ Not found'}")
    print()

    base_url_ok = config.get('base_url') and len(config.get('base_url', '')) > 0
    api_key_ok = config.get('api_key') and len(config.get('api_key', '')) > 0
    api_secret_ok = config.get('api_secret') and len(config.get('api_secret', '')) > 0

    print("📊 Current Settings:")
    print(f"   base_url:   {'✅ ' + config.get('base_url', '') + ' (auto)' if base_url_ok else '❌ Not set'}")
    print(f"   api_key:    {'✅ ****' + config.get('api_key', '')[-4:] if api_key_ok else '❌ Not set'}")
    print(f"   api_secret: {'✅ ****' + config.get('api_secret', '')[-4:] if api_secret_ok else '❌ Not set'}")
    print()

    if is_valid:
        print("════════════════════════════════════════════════════")
        print("✅ Ready")
        print("════════════════════════════════════════════════════")
        print("   All credentials are configured.")
    else:
        print("════════════════════════════════════════════════════")
        print("⚠️  Setup Required")
        print("════════════════════════════════════════════════════")
        print(f"   Missing: {', '.join(missing)}")
        print()
        print(f"📝 Please edit: {CONFIG_FILE_PATH}")
        print()
        print("   Required fields:")
        if 'api_key' in missing:
            print("   • api_key:    Your API key")
        if 'api_secret' in missing:
            print("   • api_secret: Your API secret")
        print()
        print("📝 Configuration Template:")
        print('   {')
        print('     "configured": true,')
        print('     "api_key": "YOUR_API_KEY",')
        print('     "api_secret": "YOUR_API_SECRET"')
        print('   }')
        print()
        print(f"🔑 {API_KEY_GUIDE_MESSAGE}")
        print()
        print("   Or use environment variables:")
        print("   export PAYMENT_API_KEY='your_key'")
        print("   export PAYMENT_API_SECRET='your_secret'")

    print("════════════════════════════════════════════════════")
    print()

    print(json.dumps({
        'config_exists': file_exists,
        'is_valid': is_valid,
        'missing_fields': missing,
        'config_path': CONFIG_FILE_PATH
    }))


def action_purchase(config: Dict[str, Any], raw_qr: str):
    """
    Unified Purchase Flow - Step 1: Parse QR

    Auto-detects QR type and delegates to the matching extension.
    """
    if not raw_qr:
        print()
        print("❌ Missing QR code")
        print("💡 Please provide QR code data with --raw_qr parameter")
        print()
        return

    is_ready, reason, missing_fields = is_config_ready(config)
    if not is_ready:
        show_config_guide(config, reason, missing_fields)
        return

    # Detect QR type via extension registry
    ext = detect_extension(raw_qr)
    api = PaymentAPI(config)

    print()
    print("════════════════════════════════════════════════════")
    print(f"📦 Starting {ext.payment_type} Purchase Flow")
    print("════════════════════════════════════════════════════")
    print()

    # Initialize state with payment type
    update_state({
        'raw_qr': raw_qr,
        'payment_type': ext.payment_type,
        'order_status': OrderStatus.INIT.value
    })

    # Delegate to extension
    ext.purchase(api, raw_qr, _get_state_helpers())


def action_set_amount(amount: float, currency: str = None):
    """Set payment amount (and optionally currency) for orders without preset amount"""
    state = load_state()

    if not state.get('checkout_id'):
        print()
        print("❌ No active order")
        print("💡 Run '--action purchase --raw_qr <QR_DATA>' first")
        print()
        return

    # Block amount change if PIX QR has a locked amount
    if state.get('pix_amount_locked'):
        preset = state.get('preset_amount') or state.get('suggested_amount')
        cur = state.get('currency', 'BRL')
        print()
        print("════════════════════════════════════════════════════")
        print("❌ Cannot change amount")
        print("════════════════════════════════════════════════════")
        print(f"   This PIX QR code has a fixed amount: {preset} {cur}")
        print("   The amount is embedded in the QR code and cannot be modified.")
        print()
        print("💡 Reply 'y' to confirm payment with the QR amount, 'n' to cancel")
        print()
        print(json.dumps({
            'status': 'AMOUNT_LOCKED',
            'message': f'PIX QR has fixed amount: {preset} {cur}. Cannot be modified.',
            'locked_amount': str(preset),
            'currency': cur
        }))
        return

    final_currency = currency or state.get('currency', 'USDT')

    set_order_status(OrderStatus.AMOUNT_SET,
        suggested_amount=amount,
        currency=final_currency,
        needs_amount_input=False
    )

    print()
    print(f"✅ Amount set: {amount} {final_currency}")
    print()
    print("💡 Reply 'y' to confirm, 'n' to cancel")
    print(json.dumps({
        'status': 'AMOUNT_SET',
        'amount': amount,
        'currency': final_currency,
        'checkout_id': state.get('checkout_id'),
        'payee': state.get('nickname')
    }))


def action_pay_confirm(config: Dict[str, Any], amount: float = None, currency: str = None):
    """
    Payment Flow - Step 2: Confirm Payment

    Routes to the correct extension endpoint based on payment_type in state.
    """
    is_ready, reason, missing_fields = is_config_ready(config)
    if not is_ready:
        show_config_guide(config, reason, missing_fields)
        return

    state = load_state()

    # Safety check: Prevent duplicate payment
    current_status = state.get('order_status')
    if current_status in [OrderStatus.SUCCESS.value, OrderStatus.PAYMENT_CONFIRMED.value, OrderStatus.POLLING.value]:
        print()
        print("════════════════════════════════════════════════════")
        print("⚠️  Payment Already In Progress or Complete")
        print("════════════════════════════════════════════════════")
        print(f"   Current status: {current_status}")
        if current_status == OrderStatus.SUCCESS.value:
            print("   This order has already been paid successfully.")
        else:
            print("   Payment is in progress. Run --action poll to check result.")
        print()
        print("💡 Run: --action status to check current state")
        print("   Run: --action reset to start a new payment")
        print()
        return

    if not state.get('checkout_id'):
        print()
        print("❌ No active order")
        print("💡 Run '--action purchase --raw_qr <QR_DATA>' first")
        print()
        return

    # If PIX amount is locked, force use the QR amount regardless of user input
    if state.get('pix_amount_locked'):
        locked_amount = state.get('preset_amount') or state.get('suggested_amount')
        if locked_amount is not None:
            if amount is not None and float(amount) != float(locked_amount):
                print(f"⚠️  PIX QR has fixed amount {locked_amount} {state.get('currency', 'BRL')}. Ignoring user amount {amount}.")
            amount = float(locked_amount)
            currency = state.get('currency', 'BRL')

    if amount is None:
        amount = state.get('suggested_amount')

    if amount is None:
        print()
        print("❌ No amount specified")
        print("💡 Use: --action set_amount --amount <amount> [--currency <currency>]")
        print()
        return

    final_currency = currency or state.get('currency', 'USDT')

    # Get the right extension for this payment type
    payment_type = state.get('payment_type', 'C2C')
    ext = get_extension_by_type(payment_type)
    api = PaymentAPI(config)

    payee = state.get('nickname', 'Unknown')
    amount_str = str(int(amount)) if amount == int(amount) else str(amount)

    print()
    print("════════════════════════════════════════════════════")
    print(f"💳 [Step 2] Confirming {payment_type} Payment")
    print("════════════════════════════════════════════════════")
    print(f"   Checkout: {state.get('checkout_id')}")
    print(f"   Amount:   {amount_str} {final_currency}")
    print(f"   Payee:    {payee}")
    print()

    # Build params via extension and call API
    print("🔄 Processing payment...")
    confirm_params = ext.build_confirm_params(state, amount_str, final_currency)
    confirm_result = api.confirm_payment(ext.get_confirm_endpoint(), confirm_params)

    if not confirm_result['success']:
        error_status = confirm_result.get('status', 'ERROR')
        error_msg = confirm_result.get('message', 'Payment failed')
        error_hint = confirm_result.get('hint', '')
        error_code = confirm_result.get('code')

        set_order_status(OrderStatus.FAILED, error_message=error_msg, error_code=error_code)

        print()
        print("════════════════════════════════════════════════════")
        print(f"❌ Payment Failed")
        print("════════════════════════════════════════════════════")
        print(f"   {error_msg}")
        if error_hint:
            print(f"   💡 {error_hint}")
        print("════════════════════════════════════════════════════")

        print(json.dumps({
            'status': error_status,
            'code': error_code,
            'message': error_msg,
            'hint': error_hint
        }))
        return

    payment_info = confirm_result['payment_info']

    set_order_status(OrderStatus.PAYMENT_CONFIRMED,
        pay_order_id=payment_info.pay_order_id,
        amount=amount,
        currency=final_currency,
        usd_amount=str(payment_info.usd_amount) if payment_info.usd_amount else None,
        daily_used_before=str(payment_info.daily_used_before) if payment_info.daily_used_before is not None else None,
        daily_used_after=str(payment_info.daily_used_after) if payment_info.daily_used_after is not None else None
    )

    print("✅ Payment confirmed, processing...")
    print(f"   Pay Order ID: {payment_info.pay_order_id}")
    if payment_info.usd_amount:
        print(f"   USD Amount: {payment_info.usd_amount}")
    daily_limit = state.get('daily_limit')
    if payment_info.daily_used_before is not None and payment_info.daily_used_after is not None and daily_limit:
        print(f"   Daily Usage: {payment_info.daily_used_before} → {payment_info.daily_used_after} / {daily_limit} USD")
    elif payment_info.daily_used_after is not None and daily_limit:
        print(f"   Daily Usage: {payment_info.daily_used_after} / {daily_limit} USD")

    print(json.dumps({
        'status': 'PROCESSING',
        'pay_order_id': payment_info.pay_order_id,
        'amount': amount,
        'currency': final_currency,
        'payee': payee,
        'usd_amount': str(payment_info.usd_amount) if payment_info.usd_amount else None,
        'daily_used_before': str(payment_info.daily_used_before) if payment_info.daily_used_before is not None else None,
        'daily_used_after': str(payment_info.daily_used_after) if payment_info.daily_used_after is not None else None,
        'daily_limit': daily_limit
    }))


def action_poll(config: Dict[str, Any]):
    """Payment Flow - Step 3: Poll payment status until final result"""
    state = load_state()
    pay_order_id = state.get('pay_order_id')

    if not pay_order_id:
        print()
        print("❌ No active payment")
        print()
        return

    # Get the right extension for this payment type
    payment_type = state.get('payment_type', 'C2C')
    ext = get_extension_by_type(payment_type)
    api = PaymentAPI(config)

    print()
    print("🔍 Querying order status...")

    poll_params = ext.build_poll_params(state)
    status_result = api.query_payment_status(ext.get_poll_endpoint(), poll_params)

    if not status_result['success']:
        print(f"❌ Query failed: {status_result.get('message', '')}")
        return

    status_info = status_result['status_info']
    status_icon = '✅' if status_info.status == 'SUCCESS' else ('❌' if status_info.status in ['FAILED', 'FAIL'] else '⏳')
    status_text = 'Success' if status_info.status == 'SUCCESS' else ('Failed' if status_info.status in ['FAILED', 'FAIL'] else 'Processing')

    print()
    print("════════════════════════════════════════════════════")
    print(f"{status_icon} Status: {status_text}")
    print("════════════════════════════════════════════════════")
    print(f"   📝 Pay Order: {pay_order_id}")
    if state.get('amount'):
        print(f"   💵 Amount Sent: {state['amount']} {state.get('currency', 'USDT')}")
    if status_info.asset_cost_vos:
        costs = [f"{vo['amount']} {vo['asset']}" for vo in status_info.asset_cost_vos]
        print(f"   💳 Paid With: {' + '.join(costs)}")
    # Show daily usage change on success
    daily_used_before = state.get('daily_used_before')
    daily_used_after = state.get('daily_used_after')
    daily_limit = state.get('daily_limit')
    if status_info.status == 'SUCCESS' and daily_used_before is not None and daily_used_after is not None and daily_limit:
        print(f"   📊 Daily Usage: {daily_used_before} → {daily_used_after} / {daily_limit} USD")
    print("════════════════════════════════════════════════════")
    print(json.dumps({
        'status': status_info.status,
        'pay_order_id': pay_order_id,
        'amount_sent': state.get('amount'),
        'currency': state.get('currency', 'USDT'),
        'paid_with': status_info.asset_cost_vos if status_info.asset_cost_vos else None,
        'daily_used_before': daily_used_before,
        'daily_used_after': daily_used_after,
        'daily_limit': daily_limit
    }))


def action_status():
    """Show current order status and next steps"""
    state = load_state()
    status = get_order_status()

    print()
    print("════════════════════════════════════════════════════")
    print("📊 Current Order Status")
    print("════════════════════════════════════════════════════")

    if not state or not status:
        print("   No active order")
        print()
        print("💡 Start with: --action purchase --raw_qr <QR_DATA>")
        print("════════════════════════════════════════════════════")
        return

    checkout_id = state.get('checkout_id')
    pay_order_id = state.get('pay_order_id')
    payment_type = state.get('payment_type', 'C2C')

    print(f"   Type:        {payment_type}")
    print(f"   Status:      {status.value}")
    print(f"   Checkout ID: {checkout_id or 'Not yet created'}")
    if pay_order_id:
        print(f"   Pay Order:   {pay_order_id}")

    if state.get('nickname'):
        print(f"   Payee:       {state.get('nickname')}")
    if state.get('receiver_psp'):
        print(f"   Bank:        {state.get('receiver_psp')}")
    if state.get('receiver_document'):
        print(f"   Document:    {state.get('receiver_document')}")
    if state.get('currency'):
        print(f"   Currency:    {state.get('currency')}")
    if state.get('suggested_amount') or state.get('amount'):
        amt = state.get('amount') or state.get('suggested_amount')
        print(f"   Amount:      {amt} {state.get('currency', '')}")
    if state.get('error_message'):
        print(f"   Error:       {state.get('error_message')}")
    if state.get('last_updated'):
        print(f"   Updated:     {state.get('last_updated')}")

    print()
    print(f"💡 {get_status_hint(status, state)}")
    print("════════════════════════════════════════════════════")

    print(json.dumps({
        'status': status.value,
        'payment_type': payment_type,
        'checkout_id': checkout_id,
        'pay_order_id': pay_order_id,
        'amount': state.get('amount') or state.get('suggested_amount'),
        'currency': state.get('currency'),
        'payee': state.get('nickname')
    }))


def action_reset():
    """Clear state and start fresh"""
    clear_state()
    print()
    print("🗑️  State cleared")
    print()
    print("💡 Ready for new payment: --action purchase --raw_qr <QR_DATA>")
    print()


def action_resume(config: Dict[str, Any]):
    """Resume from current state - automatically continue the payment flow."""
    is_ready, reason, missing_fields = is_config_ready(config)
    if not is_ready:
        show_config_guide(config, reason, missing_fields)
        return

    state = load_state()
    status = get_order_status()

    if not state or not status:
        print()
        print("📭 No active order to resume")
        print("💡 Start with: --action purchase --raw_qr <QR_DATA>")
        print()
        return

    print()
    print(f"🔄 Resuming from status: {status.value}")
    print()

    if status == OrderStatus.INIT:
        raw_qr = state.get('raw_qr')
        if raw_qr:
            action_purchase(config, raw_qr)
        else:
            print("❌ No QR code in state")
            print("💡 Run: --action purchase --raw_qr <QR_DATA>")

    elif status == OrderStatus.QR_PARSED:
        if state.get('has_preset_amount') and state.get('preset_amount'):
            amount = float(state.get('preset_amount'))
            action_pay_confirm(config, amount)
        else:
            print("💡 Please set amount: --action set_amount --amount <AMOUNT>")
            print(f"   Currency: {state.get('currency', 'USDT')}")

    elif status == OrderStatus.AWAITING_AMOUNT:
        print("💡 Please set amount: --action set_amount --amount <AMOUNT>")
        print(f"   Currency: {state.get('currency', 'USDT')}")

    elif status == OrderStatus.AMOUNT_SET:
        amount = state.get('suggested_amount') or state.get('amount')
        if amount:
            action_pay_confirm(config, float(amount))
        else:
            print("❌ No amount set")
            print("💡 Run: --action set_amount --amount <AMOUNT>")

    elif status in [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.POLLING]:
        action_poll(config)

    elif status == OrderStatus.SUCCESS:
        print("✅ Payment already completed!")
        if state.get('asset_costs'):
            costs = [f"{c.get('amount')} {c.get('asset')}" for c in state['asset_costs']]
            print(f"   💳 Paid With: {' + '.join(costs)}")
        print()
        print("💡 Run: --action reset for a new payment")

    elif status == OrderStatus.FAILED:
        print(f"❌ Order failed: {state.get('error_message', 'Unknown error')}")
        print()
        print("💡 Run: --action reset to start over")

    else:
        print(f"⚠️  Unknown status: {status.value}")
        print("💡 Run: --action status to check details")


def action_help():
    """Show help information"""
    print()
    print("════════════════════════════════════════════════════")
    print("👋 Payment Assistant Skill (C2C + PIX)")
    print("════════════════════════════════════════════════════")
    print()
    print("📋 Core Actions (3-step flow):")
    print("   purchase     - Step 1: Parse QR (requires --raw_qr)")
    print("                  Auto-detects C2C URL or PIX EMV QR")
    print("   set_amount   - Set amount (e.g., --amount 100 --currency BRL)")
    print("   pay_confirm  - Step 2: Confirm payment")
    print("   poll         - Step 3: Poll until final status")
    print("   query        - Check order status (API call)")
    print()
    print("📷 QR Decode Actions:")
    print("   decode_qr    - Decode QR from clipboard or image file")
    print()
    print("💰 Receive Actions:")
    print("   receive      - Generate receive QR code / payment link")
    print()
    print("🔄 Recovery Actions:")
    print("   status       - Show current state and next steps")
    print("   resume       - Auto-continue from any state")
    print("   reset        - Clear state for fresh start")
    print()
    print("⚙️  Config Actions:")
    print("   config       - Show configuration guide")

    print()
    print("💡 C2C Example Flow:")
    print("   1. --action decode_qr                    # Decode from clipboard/inbox")
    print("   2. --action purchase --raw_qr '<QR_DATA>'")
    print("   3. --action set_amount --amount 50       # If no preset amount")
    print("   4. --action pay_confirm")
    print("   5. --action poll")
    print()
    print("💡 PIX Example Flow:")
    print("   1. --action purchase --raw_qr '00020126...br.gov.bcb.pix...'")
    print("   2. --action set_amount --amount 100 --currency BRL  # If no preset")
    print("   3. --action pay_confirm")
    print("   4. --action poll")
    print()
    print("💡 Receive Example:")
    print("   --action receive --currency USDT --amount 50 --note 'For lunch'")
    print()
    print("🔄 Recovery (if interrupted at any point):")
    print("   --action status   # Check where you are")
    print("   --action resume   # Auto-continue")
    print("════════════════════════════════════════════════════")
    print()


def _get_file_info(file_path: str) -> Dict[str, Any]:
    """Get file metadata for debugging/transparency."""
    try:
        stat = os.stat(file_path)
        return {
            'path': file_path,
            'filename': os.path.basename(file_path),
            'size_bytes': stat.st_size,
            'modified_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(stat.st_mtime)),
        }
    except Exception:
        return {'path': file_path, 'filename': os.path.basename(file_path)}


def action_decode_qr(image_path: str = None, base64_data: str = None, use_clipboard: bool = False):
    """
    Decode QR code from image.

    Three MUTUALLY EXCLUSIVE input modes (no fallback between them):
    - --image <path>     : Decode from file path
    - --base64 <data>    : Decode from base64 encoded image
    - --clipboard        : Explicitly read from system clipboard

    If no input specified, returns an error asking for explicit input.
    This ensures 100% clarity on which image is being decoded.

    Returns JSON with qr_data and source info for transparency.
    """
    qr_handler = QRCodeHandler()

    has_decoder = (HAS_PIL and HAS_PYZBAR) or HAS_CV2
    if not has_decoder:
        print(json.dumps({
            'success': False,
            'error': 'missing_dependencies',
            'message': "No QR decoder available. Install: pip install opencv-python pyzbar"
        }))
        return

    # Count how many input modes are specified
    input_modes = sum([bool(image_path), bool(base64_data), use_clipboard])

    if input_modes > 1:
        print(json.dumps({
            'success': False,
            'error': 'multiple_inputs',
            'message': "Only one input mode allowed. Use --image OR --base64 OR --clipboard, not multiple.",
            'hint': 'Choose one input source to avoid ambiguity.'
        }))
        return

    if input_modes == 0:
        print(json.dumps({
            'success': False,
            'error': 'no_input',
            'message': "No image input specified. You must provide one of: --image, --base64, or --clipboard",
            'usage': {
                '--image <path>': 'Path to image file (from message attachment)',
                '--base64 <data>': 'Base64 encoded image data',
                '--clipboard': 'Read from system clipboard (user must have just copied an image)'
            },
            'hint': 'AI should use --image with the attachment path from the user message, or use Vision to read QR directly and pass --raw_qr to purchase action.'
        }))
        return

    # ============================================================
    # Mode 1: Image file path
    # ============================================================
    if image_path:
        if not os.path.exists(image_path):
            print(json.dumps({
                'success': False,
                'error': 'file_not_found',
                'message': f"File not found: {image_path}",
                'source_type': 'image_path',
                'provided_path': image_path
            }))
            return

        file_info = _get_file_info(image_path)
        qr_data = qr_handler.decode_qr_from_image(image_path)

        if qr_data:
            print(json.dumps({
                'success': True,
                'qr_data': qr_data,
                'source_type': 'image_path',
                'source_info': file_info,
                'message': f"QR decoded from: {file_info['filename']}"
            }))
        else:
            print(json.dumps({
                'success': False,
                'error': 'decode_failed',
                'message': f"No QR code found in image: {file_info['filename']}",
                'source_type': 'image_path',
                'source_info': file_info,
                'hint': 'Image exists but no QR code detected. Verify this is the correct image.'
            }))
        return

    # ============================================================
    # Mode 2: Base64 encoded image
    # ============================================================
    if base64_data:
        import base64
        import tempfile

        try:
            # Remove data URI prefix if present (e.g., "data:image/png;base64,")
            if ',' in base64_data:
                base64_data = base64_data.split(',', 1)[1]

            image_bytes = base64.b64decode(base64_data)

            # Save to temp file for decoding
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                tmp.write(image_bytes)
                tmp_path = tmp.name

            qr_data = qr_handler.decode_qr_from_image(tmp_path)

            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass

            if qr_data:
                print(json.dumps({
                    'success': True,
                    'qr_data': qr_data,
                    'source_type': 'base64',
                    'source_info': {
                        'data_length': len(base64_data),
                        'decoded_size': len(image_bytes)
                    },
                    'message': 'QR decoded from base64 image data'
                }))
            else:
                print(json.dumps({
                    'success': False,
                    'error': 'decode_failed',
                    'message': 'No QR code found in base64 image',
                    'source_type': 'base64',
                    'hint': 'Image decoded successfully but no QR code detected.'
                }))
        except Exception as e:
            print(json.dumps({
                'success': False,
                'error': 'base64_decode_failed',
                'message': f'Failed to decode base64 image: {str(e)}',
                'source_type': 'base64',
                'hint': 'Ensure the base64 data is valid image data.'
            }))
        return

    # ============================================================
    # Mode 3: System clipboard (explicit)
    # ============================================================
    if use_clipboard:
        success, data, msg = qr_handler.decode_qr_from_clipboard()

        if success:
            print(json.dumps({
                'success': True,
                'qr_data': data,
                'source_type': 'clipboard',
                'source_info': {
                    'method': 'system_clipboard',
                    'note': 'Image was read from current system clipboard'
                },
                'message': 'QR decoded from clipboard'
            }))
        else:
            print(json.dumps({
                'success': False,
                'error': 'clipboard_failed',
                'message': msg or 'Failed to read QR from clipboard',
                'source_type': 'clipboard',
                'hint': 'Ensure an image is copied to clipboard. On macOS: Cmd+Ctrl+Shift+4 to screenshot to clipboard.'
            }))
        return
