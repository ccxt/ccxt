"""
Payment Extension Registry.

Extensions are checked in order — first match wins.
PIX is checked before C2C because C2C is the catch-all fallback.
"""
from .base import PaymentExtension
from .c2c import C2cExtension
from .pix import PixExtension

# Ordered list: specific detectors first, fallback last
EXTENSIONS = [PixExtension(), C2cExtension()]


def detect_extension(raw_qr: str) -> PaymentExtension:
    """Find the matching extension for a given QR code string."""
    for ext in EXTENSIONS:
        if ext.detect(raw_qr):
            return ext
    # Should never reach here since C2C is catch-all, but just in case
    return C2cExtension()


def get_extension_by_type(payment_type: str) -> PaymentExtension:
    """Look up extension by payment_type string (e.g. 'C2C', 'PIX')."""
    for ext in EXTENSIONS:
        if ext.payment_type == payment_type:
            return ext
    return C2cExtension()


def get_all_endpoints() -> dict:
    """Merge endpoints from all extensions into one dict.

    Keys are prefixed with payment_type to avoid collisions.
    e.g. 'c2c_parse_qr', 'pix_parse_qr'
    """
    merged = {}
    for ext in EXTENSIONS:
        prefix = ext.payment_type.lower()
        for key, path in ext.endpoints.items():
            merged[f"{prefix}_{key}"] = path
    return merged
