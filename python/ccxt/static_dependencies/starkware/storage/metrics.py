import prometheus_client

CACHED_STORAGE_GET_TOTAL = prometheus_client.Counter(
    name="starkware_cached_storage_get_total_count",
    documentation="Count of total get_value() calls to CachedStorage",
    labelnames=(),
)

CACHED_STORAGE_GET_CACHE = prometheus_client.Counter(
    name="starkware_cached_storage_get_cache_count",
    documentation="Count of get_value() calls to CachedStorage that got the value from the cache",
    labelnames=(),
)

# Metric names may diverge on client argument.
CACHED_STORAGE_GET_TOTAL_NAME = getattr(CACHED_STORAGE_GET_TOTAL, "_name")
CACHED_STORAGE_GET_CACHE_NAME = getattr(CACHED_STORAGE_GET_CACHE, "_name")
