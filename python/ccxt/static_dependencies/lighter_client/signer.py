import ctypes
from typing import Dict, List, Optional, Union, Tuple

class ApiKeyResponse(ctypes.Structure):
    _fields_ = [("privateKey", ctypes.c_char_p), ("publicKey", ctypes.c_char_p), ("err", ctypes.c_char_p)]


class CreateOrderTxReq(ctypes.Structure):
    _fields_ = [
        ("MarketIndex", ctypes.c_uint8),
        ("ClientOrderIndex", ctypes.c_longlong),
        ("BaseAmount", ctypes.c_longlong),
        ("Price", ctypes.c_uint32),
        ("IsAsk", ctypes.c_uint8),
        ("Type", ctypes.c_uint8),
        ("TimeInForce", ctypes.c_uint8),
        ("ReduceOnly", ctypes.c_uint8),
        ("TriggerPrice", ctypes.c_uint32),
        ("OrderExpiry", ctypes.c_longlong),
    ]


class StrOrErr(ctypes.Structure):
    _fields_ = [("str", ctypes.c_char_p), ("err", ctypes.c_char_p)]


class SignedTxResponse(ctypes.Structure):
    _fields_ = [
        ("txType", ctypes.c_uint8),
        ("txInfo", ctypes.c_char_p),
        ("txHash", ctypes.c_char_p),
        ("messageToSign", ctypes.c_char_p),
        ("err", ctypes.c_char_p),
    ]

lighterSigner = None

def load_lighter_library(path):
    global lighterSigner

    if lighterSigner is not None:
        return lighterSigner

    lighterSigner = ctypes.CDLL(path)
    lighterSigner.GenerateAPIKey.argtypes = [ctypes.c_char_p]
    lighterSigner.GenerateAPIKey.restype = ApiKeyResponse

    lighterSigner.CreateClient.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CreateClient.restype = ctypes.c_char_p

    lighterSigner.CheckClient.argtypes = [ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CheckClient.restype = ctypes.c_char_p

    lighterSigner.SignChangePubKey.argtypes = [ctypes.c_char_p, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignChangePubKey.restype = SignedTxResponse

    lighterSigner.SignCreateOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int,
                                            ctypes.c_int, ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateOrder.restype = SignedTxResponse

    lighterSigner.SignCreateGroupedOrders.argtypes = [ctypes.c_uint8, ctypes.POINTER(CreateOrderTxReq), ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateGroupedOrders.restype = SignedTxResponse

    lighterSigner.SignCancelOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCancelOrder.restype = SignedTxResponse

    lighterSigner.SignWithdraw.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignWithdraw.restype = SignedTxResponse

    lighterSigner.SignCreateSubAccount.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateSubAccount.restype = SignedTxResponse

    lighterSigner.SignCancelAllOrders.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCancelAllOrders.restype = SignedTxResponse

    lighterSigner.SignModifyOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignModifyOrder.restype = SignedTxResponse

    lighterSigner.SignTransfer.argtypes = [ctypes.c_longlong, ctypes.c_int16, ctypes.c_int8, ctypes.c_int8, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_char_p, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignTransfer.restype = SignedTxResponse

    lighterSigner.SignCreatePublicPool.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreatePublicPool.restype = SignedTxResponse

    lighterSigner.SignUpdatePublicPool.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdatePublicPool.restype = SignedTxResponse

    lighterSigner.SignMintShares.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignMintShares.restype = SignedTxResponse

    lighterSigner.SignBurnShares.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignBurnShares.restype = SignedTxResponse

    lighterSigner.SignUpdateLeverage.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdateLeverage.restype = SignedTxResponse

    lighterSigner.CreateAuthToken.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CreateAuthToken.restype = StrOrErr

    # Note: SwitchAPIKey is no longer exported in the new binary
    # All functions now take api_key_index directly, so switching is handled via parameters

    lighterSigner.SignUpdateMargin.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdateMargin.restype = SignedTxResponse
    return lighterSigner

def decode_tx_info(result: SignedTxResponse) -> Union[Tuple[str, str, str, None], Tuple[None, None, None, str]]:
    if result.err:
        error = result.err.decode("utf-8")
        return None, None, None, error
    
    # Use txType from response if available, otherwise use the provided type
    tx_type = result.txType
    tx_info_str = result.txInfo.decode("utf-8") if result.txInfo else None
    tx_hash_str = result.txHash.decode("utf-8") if result.txHash else None

    return tx_type, tx_info_str, tx_hash_str, None

def decode_auth(result: StrOrErr) -> Union[Tuple[str, None], Tuple[None, str]]:
    if result.err:
        error = result.err.decode("utf-8")
        return None, error

    token = result.str.decode('utf-8') if result.str else None
    return token, None
