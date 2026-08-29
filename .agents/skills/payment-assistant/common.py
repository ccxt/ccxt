#!/usr/bin/env python3
"""
Payment Assistant - Common Infrastructure

Shared by send.py and receive.py:
  - Constants (paths, timing, error codes, headers, config templates)
  - Configuration (load, validate, guide)
  - State management (OrderStatus, save/load/update/clear)
  - API client (PaymentAPI with HMAC signing, rate limiting)
  - Data models (PaymentStatusResponse, ConfirmPaymentResponse)
"""
import time
import hmac
import hashlib
import os
import json
import secrets
from typing import Dict, Any, Optional
from enum import Enum

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# ============================================================
# Order Status State Machine
# ============================================================
class OrderStatus(Enum):
    """Order status for state machine tracking"""
    INIT = "INIT"                          # Initial state, QR received
    QR_PARSED = "QR_PARSED"                # parseQr success, has preset amount
    AWAITING_AMOUNT = "AWAITING_AMOUNT"    # Waiting for amount input (no preset)
    AMOUNT_SET = "AMOUNT_SET"              # Amount set, ready to confirm
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED" # confirmPayment called, polling
    POLLING = "POLLING"                    # Polling for result
    SUCCESS = "SUCCESS"                    # Payment successful
    FAILED = "FAILED"                      # Payment failed


# ============================================================
# Skills Payment Error Codes
# ============================================================
SKILLS_ERROR_CODES = {
    -7100: ('LIMIT_NOT_CONFIGURED', 'Please go to the Binance app payment setting page to set up your Agent Pay limits via MFA.'),
    -7101: ('SINGLE_LIMIT_EXCEEDED', 'Amount exceeds your limits. Please pay manually in the App.'),
    -7102: ('DAILY_LIMIT_EXCEEDED', 'Amount exceeds your limits. Please pay manually in the App.'),
    -7110: ('INSUFFICIENT_FUNDS', 'Insufficient balance in your Binance account.'),
    -7130: ('INVALID_QR_FORMAT', 'Invalid QR code format'),
    -7131: ('QR_EXPIRED_OR_NOT_FOUND', 'PayCode is invalid or expired. Please request a new one.'),
    -7199: ('INTERNAL_ERROR', 'System error, please try again later'),
}


# ============================================================
# Configuration
# ============================================================
SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE_PATH = os.path.join(SKILL_DIR, 'config.json')
STATE_FILE_PATH = os.path.join(SKILL_DIR, '.payment_state.json')
API_LOCK_FILE_PATH = os.path.join(SKILL_DIR, '.api_lock_time')
QR_CODE_OUTPUT_PATH = os.path.join(SKILL_DIR, 'payment_qr.png')
INBOX_DIR = os.path.join(SKILL_DIR, 'inbox')
CLIPBOARD_IMAGE_PATH = os.path.join(INBOX_DIR, 'qr_clipboard.png')

# Timing configurations
POLL_INTERVAL = 2
MAX_POLL_ATTEMPTS = 30
RECV_WINDOW = 30000
API_CALL_INTERVAL = 2.0

# OpenAPI Header names (for /binancepay/openapi/* endpoints)
OPENAPI_HEADER_TIMESTAMP = 'BinancePay-Timestamp'
OPENAPI_HEADER_NONCE = 'BinancePay-Nonce'
OPENAPI_HEADER_CERT = 'BinancePay-Certificate-SN'
OPENAPI_HEADER_SIGNATURE = 'BinancePay-Signature'

# OpenAPI path prefix for routing
OPENAPI_PATH_PREFIX = '/binancepay/openapi/'

# API Key Setup Guide Message
API_KEY_GUIDE_MESSAGE = 'Payment API key & secret not configured. Please set your API key & secret in Binance App first.'

# Default config for auto-creation when config.json is missing
DEFAULT_CONFIG_TEMPLATE = {
    "_comment_1": "=== Payment Assistant Configuration ===",
    "_comment_2": "Please fill in the required fields below and set 'configured' to true",
    "_comment_3": "---",
    "configured": False,
    "_comment_api_key": "API Key: Please set your API key & secret in Binance App first",
    "api_key": "",
    "_comment_api_secret": "API Secret: Generated together with API Key, keep it safe!",
    "api_secret": "",
    "_comment_5": "--- After filling in, set 'configured' to true to enable payment ---"
}

# Template for configuration (shown in guide)
CONFIG_TEMPLATE = {
    "configured": True,
    "api_key": "YOUR_API_KEY",
    "api_secret": "YOUR_API_SECRET"
}


def create_default_config() -> str:
    """Create default config.json file with template and instructions."""
    with open(CONFIG_FILE_PATH, 'w') as f:
        json.dump(DEFAULT_CONFIG_TEMPLATE, f, indent=2, ensure_ascii=False)
    return CONFIG_FILE_PATH


def load_config() -> Dict[str, Any]:
    """
    Load configuration with priority: ENV > config.json > defaults

    If config.json doesn't exist, create a template and show setup guide.
    """
    config = {
        'api_key': '',
        'api_secret': '',
        'base_url': '',
        'configured': False
    }

    # Check if config.json exists, if not create template
    config_created = False
    if not os.path.exists(CONFIG_FILE_PATH):
        create_default_config()
        config_created = True

    # Load from config.json
    if os.path.exists(CONFIG_FILE_PATH):
        try:
            with open(CONFIG_FILE_PATH, 'r') as f:
                file_config = json.load(f)
                file_config = {k: v for k, v in file_config.items() if not k.startswith('_')}
                config.update(file_config)
        except Exception as e:
            print(f"⚠️  Warning: Failed to load config.json: {e}")

    if config_created:
        print()
        print("════════════════════════════════════════════════════")
        print("📝 Config template created: config.json")
        print("════════════════════════════════════════════════════")
        print()
        print("⚠️  Please complete the configuration before proceeding:")
        print()
        print(f"   📁 Edit: {CONFIG_FILE_PATH}")
        print()
        print("   📋 Required steps:")
        print("      1. Fill in: api_key, api_secret")
        print('      2. Set "configured": true')
        print()
        print(f"   🔑 {API_KEY_GUIDE_MESSAGE}")
        print()
        print("════════════════════════════════════════════════════")
        print("📝 Example configuration:")
        print("════════════════════════════════════════════════════")
        print()
        print('   {')
        print('     "configured": true,')
        print('     "api_key": "your_api_key_here",')
        print('     "api_secret": "your_api_secret_here"')
        print('   }')
        print()
        print("════════════════════════════════════════════════════")
        print()

    # Override with environment variables (highest priority)
    if os.environ.get('PAYMENT_API_KEY'):
        config['api_key'] = os.environ['PAYMENT_API_KEY']
    if os.environ.get('PAYMENT_API_SECRET'):
        config['api_secret'] = os.environ['PAYMENT_API_SECRET']
    if os.environ.get('PAYMENT_BASE_URL'):
        config['base_url'] = os.environ['PAYMENT_BASE_URL']

    # Fallback to production URL if not set via config/env
    if not config.get('base_url'):
        config['base_url'] = 'https://bpay.binanceapi.com'

    return config



def is_config_ready(config: Dict[str, Any]) -> tuple:
    """Check if configuration is ready for use."""
    if not config.get('configured', False):
        return False, 'not_configured', []

    required_fields = ['api_key', 'api_secret']
    missing = []
    for field in required_fields:
        value = config.get(field, '')
        if not value or value.startswith('YOUR_'):
            missing.append(field)
    if missing:
        return False, 'missing_fields', missing

    return True, 'ready', []


def show_config_guide(config: Dict[str, Any], reason: str, missing_fields: list = None):
    """Show configuration guide when config is not ready."""
    print()
    print("════════════════════════════════════════════════════")
    print("⚠️  Configuration Required")
    print("════════════════════════════════════════════════════")
    print()
    print("📋 Please complete the configuration before proceeding:")
    print()
    print(f"   Edit: {CONFIG_FILE_PATH}")
    print()

    if reason == 'not_configured':
        print("   1. Fill in: api_key, api_secret")
        print('   2. Set "configured": true')
    elif reason == 'missing_fields':
        print("   Missing required fields:")
        for field in (missing_fields or []):
            print(f"      ❌ {field}")
    else:
        print(f"   Configuration error: {reason}")

    print()
    print(f"🔑 {API_KEY_GUIDE_MESSAGE}")
    print()
    print("════════════════════════════════════════════════════")
    print("📝 Config Example:")
    print("════════════════════════════════════════════════════")
    print()
    print('   {')
    print('     "configured": true,')
    print('     "api_key": "...",')
    print('     "api_secret": "..."')
    print('   }')
    print()
    print("════════════════════════════════════════════════════")

    print(json.dumps({
        'status': 'CONFIG_REQUIRED',
        'reason': reason,
        'missing_fields': missing_fields or [],
        'config_path': CONFIG_FILE_PATH,
        'message': API_KEY_GUIDE_MESSAGE
    }))


def validate_config(config: Dict[str, Any]) -> tuple:
    """Validate configuration."""
    required_fields = ['api_key', 'api_secret']
    missing = []

    for field in required_fields:
        value = config.get(field, '')
        if not value or value.startswith('YOUR_'):
            missing.append(field)

    return len(missing) == 0, missing


# ============================================================
# API Lock Management
# ============================================================
def get_last_api_call_time() -> float:
    """Get timestamp of last API call"""
    try:
        if os.path.exists(API_LOCK_FILE_PATH):
            with open(API_LOCK_FILE_PATH, 'r') as f:
                return float(f.read().strip())
    except:
        pass
    return 0


def set_last_api_call_time(t: float):
    """Save timestamp of API call"""
    try:
        with open(API_LOCK_FILE_PATH, 'w') as f:
            f.write(str(t))
    except:
        pass


def wait_before_api_call():
    """Wait if needed to respect API rate limits"""
    last_time = get_last_api_call_time()
    if last_time > 0:
        elapsed = time.time() - last_time
        if elapsed < API_CALL_INTERVAL:
            time.sleep(API_CALL_INTERVAL - elapsed)


def mark_api_call_end():
    """Mark the end of an API call"""
    set_last_api_call_time(time.time())


# ============================================================
# State Management
# ============================================================
def save_state(state: Dict[str, Any]):
    """Save state to file"""
    state['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
    with open(STATE_FILE_PATH, 'w') as f:
        json.dump(state, f, indent=2)


def load_state() -> Dict[str, Any]:
    """Load state from file"""
    if os.path.exists(STATE_FILE_PATH):
        try:
            with open(STATE_FILE_PATH, 'r') as f:
                return json.load(f)
        except:
            pass
    return {}


def update_state(updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update state with new values"""
    state = load_state()
    state.update(updates)
    save_state(state)
    return state


def set_order_status(status: OrderStatus, **extra_fields) -> Dict[str, Any]:
    """Set order status and optionally update other fields"""
    updates = {'order_status': status.value}
    updates.update(extra_fields)
    return update_state(updates)


def get_order_status() -> Optional[OrderStatus]:
    """Get current order status"""
    state = load_state()
    status_str = state.get('order_status')
    if status_str:
        try:
            return OrderStatus(status_str)
        except ValueError:
            pass
    return None


def clear_state():
    """Clear all state for a fresh start"""
    if os.path.exists(STATE_FILE_PATH):
        os.remove(STATE_FILE_PATH)


def get_status_hint(status: OrderStatus, state: Dict[str, Any]) -> str:
    """Get hint for next action based on current status"""
    currency = state.get('currency', 'USDT')
    hints = {
        OrderStatus.INIT: "Run: --action resume (will parse QR)",
        OrderStatus.QR_PARSED: "Run: --action pay_confirm (or --action resume)",
        OrderStatus.AWAITING_AMOUNT: f"Run: --action set_amount --amount <AMOUNT> [--currency {currency}]",
        OrderStatus.AMOUNT_SET: "Run: --action pay_confirm (or --action resume)",
        OrderStatus.PAYMENT_CONFIRMED: "Run: --action poll (or --action resume)",
        OrderStatus.POLLING: "Run: --action poll (or --action resume)",
        OrderStatus.SUCCESS: "Payment complete! Run: --action reset for new payment",
        OrderStatus.FAILED: f"Failed: {state.get('error_message', 'Unknown')}. Run: --action reset",
    }
    return hints.get(status, "Run: --action status")


# ============================================================
# Shared Data Models
# ============================================================
class PaymentStatusResponse:
    """Response from queryPaymentStatus API (shared by all payment types)"""
    def __init__(self, data: Dict[str, Any]):
        self.status = data.get('status', '')
        self.asset_cost_vos = []
        if 'assetCostVos' in data and data['assetCostVos']:
            for vo in data['assetCostVos']:
                self.asset_cost_vos.append({
                    'asset': vo.get('asset', ''),
                    'amount': vo.get('amount', '0'),
                    'price': vo.get('price', '0')
                })


class ConfirmPaymentResponse:
    """Response from confirmPayment API (shared by all payment types)"""
    def __init__(self, data: Dict[str, Any]):
        self.pay_order_id = data.get('payOrderId', '')
        self.status = data.get('status', '')
        self.usd_amount = data.get('usdAmount')
        self.daily_used_before = data.get('dailyUsedBefore')
        self.daily_used_after = data.get('dailyUsedAfter')


# ============================================================
# API Client
# ============================================================
class PaymentAPI:
    """Payment API client with HMAC signing.

    Uses OpenAPI style: /binancepay/openapi/* endpoints with header-based signature.

    Extensions provide endpoints and params; this class handles transport.
    """

    def __init__(self, config: Dict[str, Any] = None):
        if config is None:
            config = load_config()
        self.config = config
        self.api_key = config.get('api_key', '')
        self.api_secret = config.get('api_secret', '')
        self.base_url = config.get('base_url', '')

    def _make_request(self, endpoint: str, params: Dict[str, Any], method: str = 'POST', use_body: bool = False) -> Dict[str, Any]:
        """Make API request using OpenAPI signing method.

        Args:
            endpoint: API path (e.g. '/binancepay/openapi/user/c2c/parseQr')
            params: Request parameters
            method: HTTP method (GET or POST)
            use_body: If True, send params as JSON body (for @RequestBody APIs)
        """
        if not HAS_REQUESTS:
            return {'success': False, 'code': '-1', 'message': 'requests module not installed'}

        if not self.base_url:
            return {'success': False, 'code': '-1', 'message': 'Missing configuration. Run --action config for setup guide.'}

        return self._make_openapi_request(endpoint, params)

    def _make_openapi_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make OpenAPI-style request with header-based signature.

        Signature format: HMAC-SHA512(payload, api_secret)
        Payload: timestamp\\n + nonce\\n + body\\n
        Headers: BinancePay-Timestamp, BinancePay-Nonce, BinancePay-Certificate-SN, BinancePay-Signature
        """
        wait_before_api_call()

        try:
            url = f"{self.base_url}{endpoint}"
            timestamp = int(time.time() * 1000)
            nonce = secrets.token_hex(16)  # 32-char random string

            # Ensure body_json matches what requests.post(json=...) will send
            # requests sends "{}" for empty dict, and the actual JSON for non-empty
            body_json = json.dumps(params) if params is not None else ''

            # Build signature (OpenAPI style: HMAC-SHA512 of timestamp + nonce + body)
            payload = f"{timestamp}\n{nonce}\n{body_json}\n"
            signature = hmac.new(self.api_secret.encode(), payload.encode(), hashlib.sha512).hexdigest().upper()

            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                OPENAPI_HEADER_TIMESTAMP: str(timestamp),
                OPENAPI_HEADER_NONCE: nonce,
                OPENAPI_HEADER_CERT: self.api_key,
                OPENAPI_HEADER_SIGNATURE: signature,
            }

            # Add gray environment header if configured
            gray_env = self.config.get('gray_env', '')
            if gray_env:
                headers['x-gray-env'] = gray_env

            response = requests.post(url, headers=headers, json=params, timeout=30)
            mark_api_call_end()
            return self._parse_response(response)

        except Exception as e:
            mark_api_call_end()
            return {'success': False, 'code': '-1', 'message': str(e)}

    def _parse_response(self, response) -> Dict[str, Any]:
        """Parse API response into unified format.

        OpenAPI format: {"status": "SUCCESS", "code": "000000", "data": {...}, "errorMessage": null}

        Returns:
            {'success': True, 'data': ...} on success
            {'success': False, 'code': ..., 'message': ...} on error
        """
        try:
            result = response.json()
        except:
            return {'code': str(response.status_code), 'message': response.text, 'success': False}

        code = result.get('code', '')

        # Check success condition (OpenAPI style)
        status = result.get('status', '')
        is_success = (status == 'SUCCESS' and code == '000000')

        if is_success:
            return {'success': True, 'data': result.get('data')}
        else:
            error_code = None
            try:
                error_code = int(code)
            except:
                pass
            error_message = result.get('errorMessage') or 'Unknown error'
            return {
                'success': False,
                'code': error_code or code,
                'message': error_message
            }

    def _parse_error(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Parse API error and return user-friendly info"""
        code = result.get('code')
        message = result.get('message', 'Unknown error')

        if code in SKILLS_ERROR_CODES:
            status, hint = SKILLS_ERROR_CODES[code]
            return {'status': status, 'code': code, 'message': message, 'hint': hint}

        return {'status': 'ERROR', 'code': code, 'message': message, 'hint': 'Please try again later'}

    def make_parsed_request(self, endpoint: str, params: Dict[str, Any], response_cls, method: str = 'POST', use_body: bool = False) -> Dict[str, Any]:
        """Make API request and parse response with given class.

        Used by extensions to call APIs with their own response models.

        Args:
            endpoint: API path
            params: Request parameters
            response_cls: Class to wrap the response data (e.g. C2cParseQrResponse)
            method: HTTP method
            use_body: Send params as JSON body

        Returns:
            {'success': True, 'order_info': <response_cls instance>} on success
            {'success': False, 'status': ..., 'message': ..., ...} on error
        """
        result = self._make_request(endpoint, params, method=method, use_body=use_body)
        if result['success'] and result.get('data'):
            return {'success': True, 'order_info': response_cls(result['data'])}
        error_info = self._parse_error(result)
        return {'success': False, **error_info}

    def confirm_payment(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call confirmPayment endpoint (shared response format)."""
        result = self._make_request(endpoint, params, use_body=True)
        if result['success'] and result.get('data'):
            return {'success': True, 'payment_info': ConfirmPaymentResponse(result['data'])}
        error_info = self._parse_error(result)
        return {'success': False, **error_info}

    def query_payment_status(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call queryPaymentStatus endpoint (shared response format)."""
        result = self._make_request(endpoint, params, method='POST', use_body=True)
        if result['success'] and result.get('data'):
            return {'success': True, 'status_info': PaymentStatusResponse(result['data'])}
        error_info = self._parse_error(result)
        return {'success': False, **error_info}
