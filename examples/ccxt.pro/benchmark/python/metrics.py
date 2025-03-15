from prometheus_client import Counter, Gauge, Histogram

# WebSocket Metrics
ws_connecting = Histogram(
    'ws_connecting_duration_seconds',
    'Duration for initial WebSocket connection request (seconds)',
    ['exchange', 'method', 'language'],
    buckets=[0.1, 0.5, 1, 2, 5]
)

ws_msgs_received = Counter(
    'ws_msgs_received_total',
    'Total messages received from watch method',
    ['exchange', 'method', 'language']
)

ws_processing = Histogram(
    'ws_processing_duration_seconds',
    'Time taken by CCXT to process each WebSocket message',
    ['exchange', 'method', 'language'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
)

ws_disconnects = Counter(
    'ws_disconnects_total',
    'Total disconnect events or exceptions during watch method',
    ['exchange', 'method', 'language']
)

ws_session_duration = Histogram(
    'ws_session_duration_seconds',
    'Total duration of WebSocket session (seconds)',
    ['exchange', 'method', 'language'],
    buckets=[1, 5, 10, 30, 60]
)

# System Metrics
process_cpu_usage = Gauge(
    'process_cpu_usage_percentage',
    'Process CPU usage percentage',
    ['language']
)

process_memory_usage = Gauge(
    'process_memory_usage_bytes',
    'Process memory usage (RSS) in bytes',
    ['language']
)
