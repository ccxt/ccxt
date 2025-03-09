import { Counter, Gauge, Histogram, register } from 'prom-client';

// WebSocket Metrics
export const wsConnecting = new Histogram({
  name: 'ws_connecting_duration_seconds',
  help: 'Duration for initial WebSocket connection request (seconds)',
  labelNames: ['exchange', 'method', 'language'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const wsMsgsReceived = new Counter({
  name: 'ws_msgs_received_total',
  help: 'Total messages received from watch method',
  labelNames: ['exchange', 'method', 'language'],
});

export const wsProcessing = new Histogram({
  name: 'ws_processing_duration_seconds',
  help: 'Time taken by CCXT to process each WebSocket message',
  labelNames: ['exchange', 'method', 'language'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const wsDisconnects = new Counter({
  name: 'ws_disconnects_total',
  help: 'Total disconnect events or exceptions during watch method',
  labelNames: ['exchange', 'method', 'language'],
});

export const wsSessionDuration = new Histogram({
  name: 'ws_session_duration_seconds',
  help: 'Total duration of WebSocket session (seconds)',
  labelNames: ['exchange', 'method', 'language'],
  buckets: [1, 5, 10, 30, 60],
});

// System Metrics
export const processCpuUsageGauge = new Gauge({
  name: 'process_cpu_usage_percentage',
  help: 'Process CPU usage percentage',
});

export const processMemoryUsageGauge = new Gauge({
  name: 'process_memory_usage_bytes',
  help: 'Process memory usage (RSS) in bytes',
});

export { register };
