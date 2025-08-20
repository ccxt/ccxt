# coincurve static dependency
# This provides a fallback when the actual coincurve library is not available

try:
    import coincurve
except ImportError:
    coincurve = None

# Provide a mock class for when coincurve is not available
if coincurve is None:
    class MockPrivateKey:
        def __init__(self, *args, **kwargs):
            raise ImportError("coincurve library is required for SECP256K1 operations. Please install it with: pip install coincurve")
        
        def sign(self, *args, **kwargs):
            raise ImportError("coincurve library is required for SECP256K1 operations. Please install it with: pip install coincurve")
    
    # Create a mock module
    class MockCoincurve:
        PrivateKey = MockPrivateKey
    
    coincurve = MockCoincurve()

# Make sure PrivateKey is available at module level
__all__ = ['PrivateKey']
PrivateKey = coincurve.PrivateKey
