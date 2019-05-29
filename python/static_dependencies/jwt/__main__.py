#!/usr/bin/env python

from __future__ import absolute_import, print_function

import argparse
import json
import sys
import time

from . import DecodeError, __version__, decode, encode


def encode_payload(args):
    # Try to encode
    if args.key is None:
        raise ValueError('Key is required when encoding. See --help for usage.')

    # Build payload object to encode
    payload = {}

    for arg in args.payload:
        k, v = arg.split('=', 1)

        # exp +offset special case?
        if k == 'exp' and v[0] == '+' and len(v) > 1:
            v = str(int(time.time()+int(v[1:])))

        # Cast to integer?
        if v.isdigit():
            v = int(v)
        else:
            # Cast to float?
            try:
                v = float(v)
            except ValueError:
                pass

        # Cast to true, false, or null?
        constants = {'true': True, 'false': False, 'null': None}

        if v in constants:
            v = constants[v]

        payload[k] = v

    token = encode(
        payload,
        key=args.key,
        algorithm=args.algorithm
    )

    return token.decode('utf-8')


def decode_payload(args):
    try:
        if args.token:
            token = args.token
        else:
            if sys.stdin.isatty():
                token = sys.stdin.readline().strip()
            else:
                raise IOError('Cannot read from stdin: terminal not a TTY')

        token = token.encode('utf-8')
        data = decode(token, key=args.key, verify=args.verify)

        return json.dumps(data)

    except DecodeError as e:
        raise DecodeError('There was an error decoding the token: %s' % e)


def build_argparser():

    usage = '''
    Encodes or decodes JSON Web Tokens based on input.

    %(prog)s [options] <command> [options] input

    Decoding examples:

    %(prog)s --key=secret decode json.web.token
    %(prog)s decode --no-verify json.web.token

    Encoding requires the key option and takes space separated key/value pairs
    separated by equals (=) as input. Examples:

    %(prog)s --key=secret encode iss=me exp=1302049071
    %(prog)s --key=secret encode foo=bar exp=+10

    The exp key is special and can take an offset to current Unix time.
    '''

    arg_parser = argparse.ArgumentParser(
        prog='pyjwt',
        usage=usage
    )

    arg_parser.add_argument(
        '-v', '--version',
        action='version',
        version='%(prog)s ' + __version__
    )

    arg_parser.add_argument(
        '--key',
        dest='key',
        metavar='KEY',
        default=None,
        help='set the secret key to sign with'
    )

    arg_parser.add_argument(
        '--alg',
        dest='algorithm',
        metavar='ALG',
        default='HS256',
        help='set crypto algorithm to sign with. default=HS256'
    )

    subparsers = arg_parser.add_subparsers(
        title='PyJWT subcommands',
        description='valid subcommands',
        help='additional help'
    )

    # Encode subcommand
    encode_parser = subparsers.add_parser('encode', help='use to encode a supplied payload')

    payload_help = """Payload to encode. Must be a space separated list of key/value
    pairs separated by equals (=) sign."""

    encode_parser.add_argument('payload', nargs='+', help=payload_help)
    encode_parser.set_defaults(func=encode_payload)

    # Decode subcommand
    decode_parser = subparsers.add_parser('decode', help='use to decode a supplied JSON web token')
    decode_parser.add_argument(
        'token',
        help='JSON web token to decode.',
        nargs='?')

    decode_parser.add_argument(
        '-n', '--no-verify',
        action='store_false',
        dest='verify',
        default=True,
        help='ignore signature and claims verification on decode'
    )

    decode_parser.set_defaults(func=decode_payload)

    return arg_parser


def main():
    arg_parser = build_argparser()

    try:
        arguments = arg_parser.parse_args(sys.argv[1:])

        output = arguments.func(arguments)

        print(output)
    except Exception as e:
        print('There was an unforseen error: ', e)
        arg_parser.print_help()
