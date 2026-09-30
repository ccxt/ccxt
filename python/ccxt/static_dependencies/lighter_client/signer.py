import ctypes
from typing import Dict, List, Optional, Union, Tuple, Any

class ApiKeyResponse(ctypes.Structure):
    _fields_ = [('privateKey', ctypes.c_void_p), ('publicKey', ctypes.c_void_p), ('err', ctypes.c_void_p)]


class CreateOrderTxReq(ctypes.Structure):
    _fields_ = [
        ("MarketIndex", ctypes.c_int16),
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
    _fields_ = [('str', ctypes.c_void_p), ('err', ctypes.c_void_p)]


class SignedTxResponse(ctypes.Structure):
    _fields_ = [
        ('txType', ctypes.c_uint8),
        ('txInfo', ctypes.c_void_p),
        ('txHash', ctypes.c_void_p),
        ('messageToSign', ctypes.c_void_p),
        ('err', ctypes.c_void_p),
    ]

lighterSigner = None
lighterSignerPath = None

# The argument lists below target this signer interface (github.com/elliottech/lighter-go,
# sharedlib/main.go). ctypes checks the argument count against `argtypes` on the Python side but
# cannot check it against the binary, so a binary from another revision does not fail - its
# trailing arguments simply land in the wrong slots and the signer reads an arbitrary
# apiKeyIndex/accountIndex pair. Expected argument counts, for comparing against a new binary:
#   GenerateAPIKey 0, CreateClient 5, CheckClient 2, SignChangePubKey 5, SignCreateOrder 19,
#   SignCreateGroupedOrders 12, SignCancelOrder 6, SignWithdraw 7, SignCreateSubAccount 4,
#   SignCancelAllOrders 7, SignModifyOrder 15, SignTransfer 11, SignCreatePublicPool 7,
#   SignUpdatePublicPool 8, SignMintShares 6, SignBurnShares 6, SignStakeAssets 6,
#   SignUnstakeAssets 6, SignUpdateLeverage 7, CreateAuthToken 3, SignUpdateMargin 7,
#   SignApproveIntegrator 10, Free 1

# every symbol ccxt binds on the native signer, in the order they are bound below
REQUIRED_SIGNER_SYMBOLS = [
    'GenerateAPIKey', 'CreateClient', 'CheckClient', 'SignChangePubKey', 'SignCreateOrder',
    'SignCreateGroupedOrders', 'SignCancelOrder', 'SignWithdraw', 'SignCreateSubAccount',
    'SignCancelAllOrders', 'SignModifyOrder', 'SignTransfer', 'SignCreatePublicPool',
    'SignUpdatePublicPool', 'SignMintShares', 'SignBurnShares', 'SignStakeAssets',
    'SignUnstakeAssets', 'SignUpdateLeverage', 'CreateAuthToken', 'SignUpdateMargin',
    'SignApproveIntegrator', 'Free',
]

# `SwitchAPIKey` was dropped from the signer when every signing function started taking
# `api_key_index` and `account_index` on each call. A binary that still exports it predates
# that change, so the argument lists below no longer line up with it: the trailing arguments
# land in the wrong slots and the library reads an arbitrary pair of indices, failing with
# `client is not created for apiKeyIndex: <n> accountIndex: <n>` even though the credentials
# are correct. Such a binary cannot be used, so reject it while loading instead of signing
# garbage later on.
INCOMPATIBLE_SIGNER_SYMBOLS = ['SwitchAPIKey']

SIGNER_ABI_HINT = 'The signer binary has to match this version of ccxt. Its functions are called over FFI by position, so a binary built from a different revision of https://github.com/elliottech/lighter-go shifts the trailing arguments instead of failing: use the binaries ccxt is tested against, in the ccxt repository under "ts/src/test/static/binaries", or upgrade ccxt if your binary is newer than it.'


def has_signer_symbol(library, name):
    try:
        getattr(library, name)
        return True
    except AttributeError:
        return False


def check_lighter_library_abi(library, path):
    incompatible = [name for name in INCOMPATIBLE_SIGNER_SYMBOLS if has_signer_symbol(library, name)]
    if incompatible:
        raise RuntimeError('the lighter signer library at "' + str(path) + '" is too old for this version of ccxt: it still exports ' + ', '.join(incompatible) + ', which means its signing functions do not take apiKeyIndex/accountIndex on every call. Calling it would silently misalign the arguments and sign with the wrong indices. ' + SIGNER_ABI_HINT)
    missing = [name for name in REQUIRED_SIGNER_SYMBOLS if not has_signer_symbol(library, name)]
    if missing:
        raise RuntimeError('the lighter signer library at "' + str(path) + '" is not compatible with this version of ccxt: it does not export ' + ', '.join(missing) + '. ' + SIGNER_ABI_HINT)
    return library


def load_lighter_library(path):
    global lighterSigner
    global lighterSignerPath

    if lighterSigner is not None:
        if (lighterSignerPath is not None) and (path != lighterSignerPath):
            raise RuntimeError('the lighter signer library was already loaded from "' + str(lighterSignerPath) + '", it cannot be reloaded from "' + str(path) + '" in the same process. Use the same "libraryPath" for every lighter instance.')
        return lighterSigner

    lighterSigner = check_lighter_library_abi(ctypes.CDLL(path), path)
    lighterSignerPath = path
    lighterSigner.GenerateAPIKey.argtypes = []
    lighterSigner.GenerateAPIKey.restype = ApiKeyResponse

    lighterSigner.CreateClient.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_int, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CreateClient.restype = ctypes.c_void_p

    lighterSigner.CheckClient.argtypes = [ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CheckClient.restype = ctypes.c_void_p

    lighterSigner.SignChangePubKey.argtypes = [ctypes.c_char_p, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignChangePubKey.restype = SignedTxResponse

    lighterSigner.SignCreateOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_int,
                                            ctypes.c_int, ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_int, ctypes.c_uint8, ctypes.c_uint8,
                                            ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateOrder.restype = SignedTxResponse

    lighterSigner.SignCreateGroupedOrders.argtypes = [ctypes.c_uint8, ctypes.POINTER(CreateOrderTxReq), ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_int, ctypes.c_uint8, ctypes.c_uint8, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateGroupedOrders.restype = SignedTxResponse

    lighterSigner.SignCancelOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCancelOrder.restype = SignedTxResponse

    lighterSigner.SignWithdraw.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_ulonglong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignWithdraw.restype = SignedTxResponse

    lighterSigner.SignCreateSubAccount.argtypes = [ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreateSubAccount.restype = SignedTxResponse

    lighterSigner.SignCancelAllOrders.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCancelAllOrders.restype = SignedTxResponse

    lighterSigner.SignModifyOrder.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_int,
                                            ctypes.c_uint8, ctypes.c_uint8, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignModifyOrder.restype = SignedTxResponse

    lighterSigner.SignTransfer.argtypes = [ctypes.c_longlong, ctypes.c_int16, ctypes.c_int8, ctypes.c_int8, ctypes.c_longlong, ctypes.c_longlong, ctypes.c_char_p, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignTransfer.restype = SignedTxResponse

    lighterSigner.SignCreatePublicPool.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignCreatePublicPool.restype = SignedTxResponse

    lighterSigner.SignUpdatePublicPool.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdatePublicPool.restype = SignedTxResponse

    lighterSigner.SignMintShares.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignMintShares.restype = SignedTxResponse

    lighterSigner.SignBurnShares.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignBurnShares.restype = SignedTxResponse

    lighterSigner.SignStakeAssets.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignStakeAssets.restype = SignedTxResponse

    lighterSigner.SignUnstakeAssets.argtypes = [ctypes.c_longlong, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUnstakeAssets.restype = SignedTxResponse

    lighterSigner.SignUpdateLeverage.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdateLeverage.restype = SignedTxResponse

    lighterSigner.CreateAuthToken.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.CreateAuthToken.restype = StrOrErr

    lighterSigner.SignUpdateMargin.argtypes = [ctypes.c_int, ctypes.c_longlong, ctypes.c_int, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignUpdateMargin.restype = SignedTxResponse

    lighterSigner.SignApproveIntegrator.argtypes = [ctypes.c_longlong, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_longlong, ctypes.c_uint8, ctypes.c_longlong, ctypes.c_int, ctypes.c_longlong]
    lighterSigner.SignApproveIntegrator.restype = SignedTxResponse

    lighterSigner.Free.argtypes = [ctypes.c_void_p]
    lighterSigner.Free.restype = None
    return lighterSigner

def decode_and_free(ptr: Any) -> Optional[str]:
    if not ptr:
        return None
    try:
        # Read the string from the pointer
        c_str = ctypes.cast(ptr, ctypes.c_char_p).value
        if c_str is not None:
            return c_str.decode('utf-8')
        return None
    finally:
        # Free the memory using the signer's own Free function to ensure
        # the same C runtime that allocated the memory also frees it.
        # This is critical on Windows where different CRTs have separate heaps.
        lighterSigner.Free(ptr)

def decode_api_key(result: ApiKeyResponse) -> Union[Tuple[str, str, None], Tuple[None, None, str]]:
    private_key_str = decode_and_free(result.privateKey)
    public_key_str = decode_and_free(result.publicKey)
    error = decode_and_free(result.err)
    return private_key_str, public_key_str, error

def decode_tx_info(result: SignedTxResponse) -> Union[Tuple[str, str, str, None], Tuple[None, None, None, str]]:    
    tx_type = result.txType
    tx_info_str = decode_and_free(result.txInfo)
    tx_hash_str = decode_and_free(result.txHash)
    message_to_sign = decode_and_free(result.messageToSign)
    error = decode_and_free(result.err)

    return tx_type, tx_info_str, tx_hash_str, message_to_sign, error

def decode_auth(result: StrOrErr) -> Union[Tuple[str, None], Tuple[None, str]]:
    token = decode_and_free(result.str)
    error = decode_and_free(result.err)
    return token, error
