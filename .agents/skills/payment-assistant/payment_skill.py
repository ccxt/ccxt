#!/usr/bin/env python3
"""
Payment Assistant Skill - Entry Point
QR Code Payment - Funding Wallet Auto-deduction (C2C + PIX) + Receive

This is the CLI entry point. Business logic lives in:
  - common.py:  Shared infrastructure (config, state, API client)
  - send.py:    Send/pay actions + QR handling
  - receive.py: Receive actions
"""
import argparse

from common import load_config, update_state

# Import send actions
from send import (
    action_config,
    action_purchase,
    action_set_amount,
    action_pay_confirm,
    action_poll,
    action_status,
    action_reset,
    action_resume,
    action_help,
    action_decode_qr,
)

# Import receive actions
from receive import action_receive


def main():
    parser = argparse.ArgumentParser(description='Payment Assistant Skill (C2C + PIX + Receive)')

    available_actions = [
        'purchase', 'set_amount', 'pay_confirm', 'poll', 'query',
        'status', 'resume', 'reset', 'config', 'help', 'decode_qr',
        'receive',
    ]

    parser.add_argument('--action', type=str, required=True, choices=available_actions)
    parser.add_argument('--raw_qr', type=str, help='Raw QR code data (C2C URL or PIX EMV string)')
    parser.add_argument('--amount', type=float, help='Payment amount')
    parser.add_argument('--currency', type=str, help='Payment currency (e.g., USDT, BRL, BTC)')
    parser.add_argument('--image', type=str, help='Image file path for decode_qr')
    parser.add_argument('--base64', type=str, help='Base64 encoded image data for decode_qr')
    parser.add_argument('--clipboard', action='store_true', help='Explicitly read from system clipboard')
    parser.add_argument('--note', type=str, help='Note/description for receive')

    args = parser.parse_args()

    config = load_config()

    # Dispatch
    if args.action == 'help':
        action_help()
    elif args.action == 'config':
        action_config()
    elif args.action == 'status':
        action_status()
    elif args.action == 'reset':
        action_reset()
    elif args.action == 'resume':
        action_resume(config)
    elif args.action == 'decode_qr':
        action_decode_qr(image_path=args.image, base64_data=args.base64, use_clipboard=args.clipboard)
    elif args.action == 'purchase':
        action_purchase(config, args.raw_qr)
    elif args.action == 'set_amount':
        if args.amount is None:
            print("❌ --amount required")
            return
        action_set_amount(args.amount, args.currency)
    elif args.action == 'pay_confirm':
        action_pay_confirm(config, args.amount, args.currency)
    elif args.action == 'poll':
        action_poll(config)
    elif args.action == 'query':
        action_poll(config)
    elif args.action == 'receive':
        action_receive(config, currency=args.currency, amount=args.amount, note=args.note)


if __name__ == '__main__':
    main()
