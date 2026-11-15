#!/usr/bin/env python3
"""
Payment Assistant - Receive Actions

Generate receive QR code / payment link via C2C createReceive API.
"""
import json
from typing import Dict, Any, Optional

from common import (
    is_config_ready, show_config_guide,
    PaymentAPI,
)

# Receive API endpoint
RECEIVE_ENDPOINT = '/binancepay/openapi/user/c2c/createReceive'


def action_receive(config: Dict[str, Any], currency: str = None, amount: float = None, note: str = None):
    """
    Generate a receive QR code / payment link.

    Args:
        config: Loaded config dict
        currency: Currency code (e.g. 'USDT', 'BTC'). Conditionally required when amount or note is set.
        amount: Optional receive amount
        note: Optional description/note
    """
    is_ready, reason, missing_fields = is_config_ready(config)
    if not is_ready:
        show_config_guide(config, reason, missing_fields)
        return

    # Validate: currency is required when amount or note is provided
    if (amount is not None or note is not None) and not currency:
        print(json.dumps({
            'success': False,
            'error': 'CURRENCY_REQUIRED',
            'message': 'Currency is required when amount or note is specified.',
            'hint': 'Add --currency USDT (or BTC, BRL, etc.)'
        }))
        return

    # Build request body
    body = {}
    if currency:
        body['currency'] = currency
    if amount is not None:
        body['amount'] = str(amount)
    if note:
        body['description'] = note

    api = PaymentAPI(config)

    print()
    print("════════════════════════════════════════════════════")
    print("💰 Generating Receive QR Code")
    print("════════════════════════════════════════════════════")
    if currency:
        print(f"   Currency: {currency}")
    if amount is not None:
        print(f"   Amount:   {amount}")
    if note:
        print(f"   Note:     {note}")
    print()

    result = api._make_request(RECEIVE_ENDPOINT, body if body else {})

    if not result['success']:
        error_info = api._parse_error(result)
        print(f"❌ {error_info.get('message', 'Failed to generate receive code')}")
        if error_info.get('hint'):
            print(f"💡 {error_info['hint']}")
        print(json.dumps({
            'success': False,
            'status': error_info.get('status', 'ERROR'),
            'code': error_info.get('code'),
            'message': error_info.get('message'),
            'hint': error_info.get('hint')
        }))
        return

    data = result.get('data', {})
    share_link = data.get('shareLink', '')
    qr_image_url = data.get('qrImageUrl')
    receive_currency = data.get('currency', currency or '')
    receive_amount = data.get('amount')

    print("✅ Receive Code Generated!")
    print()
    print(f"   🔗 Share Link: {share_link}")
    if qr_image_url:
        print(f"   🖼️  QR Image:  {qr_image_url}")
    if receive_currency:
        print(f"   💱 Currency:  {receive_currency}")
    if receive_amount:
        print(f"   💰 Amount:    {receive_amount}")
    print()
    print("════════════════════════════════════════════════════")
    print("💡 Share the link above with the payer")
    print("════════════════════════════════════════════════════")

    print(json.dumps({
        'success': True,
        'shareLink': share_link,
        'qrImageUrl': qr_image_url,
        'currency': receive_currency,
        'amount': receive_amount,
    }))
