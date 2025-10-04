from google.protobuf.json_format import ParseDict
from google.protobuf.any_pb2 import Any
from .dydxprotocol.sending.transfer_pb2 import (
    MsgDepositToSubaccount,
    MsgWithdrawFromSubaccount,
)
from .dydxprotocol.sending.tx_pb2 import MsgCreateTransfer
from .dydxprotocol.clob.tx_pb2 import (
    MsgPlaceOrder,
    MsgCancelOrder,
    MsgBatchCancel,
)
from .dydxprotocol.accountplus.tx_pb2 import TxExtension
from .cosmos.crypto.secp256k1.keys_pb2 import PubKey

registry = {
  '/dydxprotocol.clob.MsgPlaceOrder': MsgPlaceOrder,
  '/dydxprotocol.clob.MsgCancelOrder': MsgCancelOrder,
  '/dydxprotocol.clob.MsgBatchCancel': MsgBatchCancel,


  '/dydxprotocol.sending.MsgCreateTransfer': MsgCreateTransfer,
  '/dydxprotocol.sending.MsgWithdrawFromSubaccount': MsgWithdrawFromSubaccount,
  '/dydxprotocol.sending.MsgDepositToSubaccount': MsgDepositToSubaccount,
  '/dydxprotocol.accountplus.TxExtension': TxExtension,
  '/cosmos.crypto.secp256k1.PubKey': PubKey,
}

def encode_as_any(encodeObject):
    typeUrl = encodeObject['typeUrl']
    value = encodeObject['value']
    t = registry[typeUrl]
    message = ParseDict(value, t())
    packed = Any(
        type_url=typeUrl,
        value=message.SerializeToString()
    )
    return packed
