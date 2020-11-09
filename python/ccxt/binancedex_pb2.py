import hashlib
import math
import binascii
import json
import array
from google.protobuf import descriptor, message, reflection, symbol_database
from collections import OrderedDict
from ecdsa import SECP256k1, SigningKey
from ecdsa.util import sigencode_string


def encode_latin1(s):
    return s.encode('latin1')


sym_db_default = symbol_database.Default()

DESCRIPTOR = descriptor.FileDescriptor(
    name='dex.proto',
    package='transaction',
    syntax='proto3',
    serialized_options=encode_latin1('\n\031com.binance.dex.api.protoB\013TransactionP\001'),
    serialized_pb=encode_latin1('\n\tdex.proto\x12\x0btransaction\"U\n\x05StdTx\x12\x0c\n\x04msgs\x18\x01 \x03(\x0c\x12\x12\n\nsignatures\x18\x02 \x03(\x0c\x12\x0c\n\x04memo\x18\x03 \x01(\t\x12\x0e\n\x06source\x18\x04 \x01(\x03\x12\x0c\n\x04\x64\x61ta\x18\x05 \x01(\x0c\"f\n\x0cStdSignature\x12\x0f\n\x07pub_key\x18\x01 \x01(\x0c\x12\x11\n\tsignature\x18\x02 \x01(\x0c\x12\x16\n\x0e\x61\x63\x63ount_number\x18\x03 \x01(\x03\x12\x10\n\x08sequence\x18\x04 \x01(\x03\x1a\x08\n\x06PubKey\"\x8d\x01\n\x08NewOrder\x12\x0e\n\x06sender\x18\x01 \x01(\x0c\x12\n\n\x02id\x18\x02 \x01(\t\x12\x0e\n\x06symbol\x18\x03 \x01(\t\x12\x11\n\tordertype\x18\x04 \x01(\x03\x12\x0c\n\x04side\x18\x05 \x01(\x03\x12\r\n\x05price\x18\x06 \x01(\x03\x12\x10\n\x08quantity\x18\x07 \x01(\x03\x12\x13\n\x0btimeinforce\x18\x08 \x01(\x03\"<\n\x0b\x43\x61ncelOrder\x12\x0e\n\x06sender\x18\x01 \x01(\x0c\x12\x0e\n\x06symbol\x18\x02 \x01(\t\x12\r\n\x05refid\x18\x03 \x01(\t\";\n\x0bTokenFreeze\x12\x0c\n\x04\x66rom\x18\x01 \x01(\x0c\x12\x0e\n\x06symbol\x18\x02 \x01(\t\x12\x0e\n\x06\x61mount\x18\x03 \x01(\x03\"=\n\rTokenUnfreeze\x12\x0c\n\x04\x66rom\x18\x01 \x01(\x0c\x12\x0e\n\x06symbol\x18\x02 \x01(\t\x12\x0e\n\x06\x61mount\x18\x03 \x01(\x03\"&\n\x05Token\x12\r\n\x05\x64\x65nom\x18\x01 \x01(\t\x12\x0e\n\x06\x61mount\x18\x02 \x01(\x03\";\n\x05Input\x12\x0f\n\x07\x61\x64\x64ress\x18\x01 \x01(\x0c\x12!\n\x05\x63oins\x18\x02 \x03(\x0b\x32\x12.transaction.Token\"<\n\x06Output\x12\x0f\n\x07\x61\x64\x64ress\x18\x01 \x01(\x0c\x12!\n\x05\x63oins\x18\x02 \x03(\x0b\x32\x12.transaction.Token\"P\n\x04Send\x12\"\n\x06inputs\x18\x01 \x03(\x0b\x32\x12.transaction.Input\x12$\n\x07outputs\x18\x02 \x03(\x0b\x32\x13.transaction.Output\":\n\x04Vote\x12\x13\n\x0bproposal_id\x18\x01 \x01(\x03\x12\r\n\x05voter\x18\x02 \x01(\x0c\x12\x0e\n\x06option\x18\x03 \x01(\x03\x42*\n\x19\x63om.binance.dex.api.protoB\x0bTransactionP\x01\x62\x06proto3')
)

PROTOBUF_TX = descriptor.Descriptor(
    name='StdTx',
    full_name='transaction.StdTx',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        descriptor.FieldDescriptor(
            name='msgs', full_name='transaction.StdTx.msgs', index=0,
            number=1, type=12, cpp_type=9, label=3,
            has_default_value=False, default_value=[],
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='signatures', full_name='transaction.StdTx.signatures', index=1,
            number=2, type=12, cpp_type=9, label=3,
            has_default_value=False, default_value=[],
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='memo', full_name='transaction.StdTx.memo', index=2,
            number=3, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='source', full_name='transaction.StdTx.source', index=3,
            number=4, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='data', full_name='transaction.StdTx.data', index=4,
            number=5, type=12, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1(""),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=26,
    serialized_end=111,
)

PROTOBUF_SIGNATURE_PUBKEY = descriptor.Descriptor(
    name='PubKey',
    full_name='transaction.StdSignature.PubKey',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=207,
    serialized_end=215,
)

PROTOBUF_SIGNATURE = descriptor.Descriptor(
    name='StdSignature',
    full_name='transaction.StdSignature',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        descriptor.FieldDescriptor(
            name='pub_key', full_name='transaction.StdSignature.pub_key', index=0,
            number=1, type=12, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1(""),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='signature', full_name='transaction.StdSignature.signature', index=1,
            number=2, type=12, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1(""),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='account_number', full_name='transaction.StdSignature.account_number', index=2,
            number=3, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='sequence', full_name='transaction.StdSignature.sequence', index=3,
            number=4, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[PROTOBUF_SIGNATURE_PUBKEY, ],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=113,
    serialized_end=215,
)

_NEWORDER = descriptor.Descriptor(
    name='NewOrder',
    full_name='transaction.NewOrder',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        descriptor.FieldDescriptor(
            name='sender', full_name='transaction.NewOrder.sender', index=0,
            number=1, type=12, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1(""),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='id', full_name='transaction.NewOrder.id', index=1,
            number=2, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='symbol', full_name='transaction.NewOrder.symbol', index=2,
            number=3, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='ordertype', full_name='transaction.NewOrder.ordertype', index=3,
            number=4, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='side', full_name='transaction.NewOrder.side', index=4,
            number=5, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='price', full_name='transaction.NewOrder.price', index=5,
            number=6, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='quantity', full_name='transaction.NewOrder.quantity', index=6,
            number=7, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='timeinforce', full_name='transaction.NewOrder.timeinforce', index=7,
            number=8, type=3, cpp_type=2, label=1,
            has_default_value=False, default_value=0,
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=218,
    serialized_end=359,
)

_CANCELORDER = descriptor.Descriptor(
    name='CancelOrder',
    full_name='transaction.CancelOrder',
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        descriptor.FieldDescriptor(
            name='sender', full_name='transaction.CancelOrder.sender', index=0,
            number=1, type=12, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1(""),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='symbol', full_name='transaction.CancelOrder.symbol', index=1,
            number=2, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
        descriptor.FieldDescriptor(
            name='refid', full_name='transaction.CancelOrder.refid', index=2,
            number=3, type=9, cpp_type=9, label=1,
            has_default_value=False, default_value=encode_latin1("").decode('utf-8'),
            message_type=None, enum_type=None, containing_type=None,
            is_extension=False, extension_scope=None,
            serialized_options=None, file=DESCRIPTOR),
    ],
    extensions=[
    ],
    nested_types=[],
    enum_types=[
    ],
    serialized_options=None,
    is_extendable=False,
    syntax='proto3',
    extension_ranges=[],
    oneofs=[
    ],
    serialized_start=361,
    serialized_end=421,
)

PROTOBUF_SIGNATURE_PUBKEY.containing_type = PROTOBUF_SIGNATURE
DESCRIPTOR.message_types_by_name['StdTx'] = PROTOBUF_TX
DESCRIPTOR.message_types_by_name['StdSignature'] = PROTOBUF_SIGNATURE
DESCRIPTOR.message_types_by_name['NewOrder'] = _NEWORDER
DESCRIPTOR.message_types_by_name['CancelOrder'] = _CANCELORDER
sym_db_default.RegisterFileDescriptor(DESCRIPTOR)

StdTx = reflection.GeneratedProtocolMessageType('StdTx', (message.Message,), dict(
    DESCRIPTOR=PROTOBUF_TX,
    __module__='dex_pb2'
))
sym_db_default.RegisterMessage(StdTx)

StdSignature = reflection.GeneratedProtocolMessageType('StdSignature', (message.Message,), dict(
    PubKey=reflection.GeneratedProtocolMessageType('PubKey', (message.Message,), dict(
        DESCRIPTOR=PROTOBUF_SIGNATURE_PUBKEY,
        __module__='dex_pb2'
    )),
    DESCRIPTOR=PROTOBUF_SIGNATURE,
    __module__='dex_pb2'
))
sym_db_default.RegisterMessage(StdSignature)
sym_db_default.RegisterMessage(StdSignature.PubKey)

NewOrder = reflection.GeneratedProtocolMessageType('NewOrder', (message.Message,), dict(
    DESCRIPTOR=_NEWORDER,
    __module__='dex_pb2'
))
sym_db_default.RegisterMessage(NewOrder)

CancelOrder = reflection.GeneratedProtocolMessageType('CancelOrder', (message.Message,), dict(
    DESCRIPTOR=_CANCELORDER,
    __module__='dex_pb2'
))
sym_db_default.RegisterMessage(CancelOrder)

DESCRIPTOR._options = None


def encode_number(num):
    return int(num * math.pow(10, 8))


class Msg:

    AMINO_MESSAGE_TYPE = ""
    INCLUDE_AMINO_LENGTH_PREFIX = False

    def __init__(self, wallet, memo=''):
        self._wallet = wallet
        self._memo = memo

    def to_amino(self):
        proto = self.to_protobuf()
        if type(proto) != bytes:
            proto = proto.SerializeToString()

        # wrap with type
        type_bytes = b""
        if self.AMINO_MESSAGE_TYPE:
            type_bytes = binascii.unhexlify(self.AMINO_MESSAGE_TYPE)
            varint_length = varint_encode(len(proto) + len(type_bytes))
        else:
            varint_length = varint_encode(len(proto))

        msg = b""
        if self.INCLUDE_AMINO_LENGTH_PREFIX:
            msg += varint_length
        msg += type_bytes + proto

        return msg

    def wallet(self):
        return self._wallet

    @property
    def memo(self):
        return self._memo


class CancelOrderMsg(Msg):

    AMINO_MESSAGE_TYPE = b"166E681B"

    def __init__(self, symbol, order_id, wallet):
        super().__init__(wallet)
        self._symbol = symbol
        self._order_id = order_id

    def to_dict(self):
        return OrderedDict([
            ('refid', self._order_id),
            ('sender', self._wallet.address()),
            ('symbol', self._symbol),
        ])

    def to_protobuf(self):
        pb = CancelOrder()
        pb.sender = self._wallet.address_decoded()
        pb.refid = self._order_id
        pb.symbol = self._symbol.encode()
        return pb


class NewOrderMsg(Msg):

    AMINO_MESSAGE_TYPE = b"CE6DC043"

    def __init__(self, symbol, time_in_force, order_type, side,
                 price, quantity,
                 wallet):
        super().__init__(wallet)
        self._symbol = symbol
        self._time_in_force = time_in_force
        self._order_type = order_type
        self._side = side
        self._price = price
        self._price_encoded = encode_number(price)
        self._quantity = quantity
        self._quantity_encoded = encode_number(quantity)

    def to_dict(self):
        return OrderedDict([
            ('id', self._wallet.generate_order_id()),
            ('ordertype', self._order_type),
            ('price', self._price_encoded),
            ('quantity', self._quantity_encoded),
            ('sender', self._wallet.address()),
            ('side', self._side),
            ('symbol', self._symbol),
            ('timeinforce', self._time_in_force),
        ])

    def to_protobuf(self):
        pb = NewOrder()
        pb.sender = self._wallet.address_decoded()
        pb.id = self._wallet.generate_order_id()
        pb.symbol = self._symbol.encode()
        pb.timeinforce = self._time_in_force
        pb.ordertype = self._order_type
        pb.side = self._side
        pb.price = self._price_encoded
        pb.quantity = self._quantity_encoded
        return pb


BROADCAST_SOURCE = 0


def varint_encode(num):
    buf = b''
    while True:
        towrite = num & 0x7f
        num >>= 7
        if num:
            buf += bytes(((towrite | 0x80), ))
        else:
            buf += bytes((towrite, ))
            break
    return buf


class PubKeyMsg(Msg):

    AMINO_MESSAGE_TYPE = b"EB5AE987"

    def __init__(self, wallet):
        super().__init__(wallet)

    def to_protobuf(self):
        return self._wallet.public_key()

    def to_amino(self):
        proto = self.to_protobuf()

        type_bytes = binascii.unhexlify(self.AMINO_MESSAGE_TYPE)

        varint_length = varint_encode(len(proto))

        msg = type_bytes + varint_length + proto

        return msg


class Signature:

    def __init__(self, msg, data=None):
        self._msg = msg
        self._chain_id = msg.wallet().chain_id()
        self._data = data
        self._source = BROADCAST_SOURCE

    def to_json(self):
        return json.dumps(OrderedDict([
            ('account_number', str(self._msg.wallet().account_number())),
            ('chain_id', self._chain_id),
            ('data', self._data),
            ('memo', self._msg.memo),
            ('msgs', [self._msg.to_dict()]),
            ('sequence', str(self._msg.wallet().sequence())),
            ('source', str(self._source))
        ]), ensure_ascii=False, separators=(',', ':'))

    def to_bytes_json(self):
        return self.to_json().encode()

    def sign(self):
        wallet = self._msg.wallet()
        json_bytes = self.to_bytes_json()
        signed = wallet.sign_message(json_bytes)
        return signed[-64:]


class SignatureMsg(Msg):

    AMINO_MESSAGE_TYPE = None

    def __init__(self, msg):
        super().__init__(msg.wallet())
        self._signature = Signature(msg)

    def to_protobuf(self):
        pub_key_msg = PubKeyMsg(self._wallet)
        std_sig = StdSignature()
        std_sig.sequence = self._wallet.sequence()
        std_sig.account_number = self._wallet.account_number()
        std_sig.pub_key = pub_key_msg.to_amino()
        std_sig.signature = self._signature.sign()
        return std_sig


class StdTxMsg(Msg):

    AMINO_MESSAGE_TYPE = b"F0625DEE"
    INCLUDE_AMINO_LENGTH_PREFIX = True

    def __init__(self, msg, data=''):
        super().__init__(msg.wallet())

        self._msg = msg
        self._signature = SignatureMsg(msg)
        self._data = data
        self._source = BROADCAST_SOURCE

    def to_protobuf(self):
        stdtx = StdTx()
        stdtx.msgs.extend([self._msg.to_amino()])
        stdtx.signatures.extend([self._signature.to_amino()])
        stdtx.data = self._data.encode()
        stdtx.memo = self._msg.memo
        stdtx.source = self._source
        return stdtx


def convertbits(data, frombits, tobits):
    acc = 0
    bits = 0
    ret = []
    maxv = (1 << tobits) - 1
    max_acc = (1 << (frombits + tobits - 1)) - 1
    for value in data:
        if value < 0 or (value >> frombits):
            return None
        acc = ((acc << frombits) | value) & max_acc
        bits += frombits
        while bits >= tobits:
            bits -= tobits
            ret.append((acc >> bits) & maxv)
    if bits >= frombits or ((acc << (tobits - bits)) & maxv):
        return None
    return ret


def bech32_decode(bech):
    CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
    bech = bech.lower()
    pos = bech.rfind('1')
    data = [CHARSET.find(x) for x in bech[pos + 1:]]
    bits = convertbits(data[:-6], 5, 8)
    return array.array('B', bits).tobytes()


class Wallet:

    def __init__(self, private_key, account_number, address, sequence):
        self._address = address
        self._signing_key = SigningKey.from_string(bytes.fromhex(private_key),
                                                   curve=SECP256k1)
        self._public_key = self._signing_key.verifying_key.to_string()
        self._sequence = sequence
        self._address = address
        self._account_number = account_number

    def sign_message(self, message):
        return self._signing_key.sign(message, hashfunc=hashlib.sha256, sigencode=sigencode_string)

    def address(self):
        return self._address

    def address_decoded(self):
        return bech32_decode(self._address)

    def public_key(self):
        return bytes(b'\x03') + self._public_key[:32]

    def account_number(self):
        return self._account_number

    def increment_sequence(self):
        self._sequence += 1

    def sequence(self):
        return self._sequence

    def chain_id(self):
        # node-info: node_info network
        return 'Binance-Chain-Tigris'

    def generate_order_id(self):
        return "{}-{}".format(
            binascii.hexlify(self.address_decoded()).decode().upper(),
            self._sequence + 1)


def create_order_msg(wallet, symbol, type, side, amount, price):
    good_till_expire = 1
    newordermsg = NewOrderMsg(symbol=symbol, time_in_force=good_till_expire, order_type=type, side=side, price=price, quantity=amount, wallet=wallet)
    return StdTxMsg(newordermsg).to_amino().hex()


def cancel_order_msg(wallet, id, symbol):
    msg = CancelOrderMsg(symbol=symbol, order_id=id, wallet=wallet)
    return StdTxMsg(msg).to_amino().hex()
