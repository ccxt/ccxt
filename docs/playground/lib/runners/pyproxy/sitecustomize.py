# Auto-imported by Python at startup when this dir is on PYTHONPATH. ccxt-python's
# requests session doesn't pick up the proxy env vars, so point its built-in
# httpsProxy (class attribute, inherited by every exchange) at the egress proxy —
# all exchange calls then tunnel through the allowlist. No-op without a proxy set.
import os

_proxy = (
    os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    or os.environ.get("HTTP_PROXY") or os.environ.get("http_proxy")
)
if _proxy:
    # Sync ccxt (REST).
    try:
        import ccxt
        ccxt.Exchange.httpsProxy = _proxy
    except Exception:
        # ccxt unavailable — the internal network still blocks any non-proxy egress
        pass
    # Async base used by ccxt.pro (WebSockets / watch*).
    try:
        import ccxt.async_support as _accxt
        _accxt.Exchange.httpsProxy = _proxy
        _accxt.Exchange.wssProxy = _proxy
    except Exception:
        pass
