"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.processMemoryUsageGauge = exports.processCpuUsageGauge = exports.wsSessionDuration = exports.wsDisconnects = exports.wsProcessing = exports.wsMsgsReceived = exports.wsConnecting = void 0;
const prom_client_1 = require("prom-client");
Object.defineProperty(exports, "register", { enumerable: true, get: function () { return prom_client_1.register; } });
// WebSocket Metrics
exports.wsConnecting = new prom_client_1.Histogram({
    name: 'ws_connecting_duration_seconds',
    help: 'Duration for initial WebSocket connection request (seconds)',
    labelNames: ['exchange', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5],
});
exports.wsMsgsReceived = new prom_client_1.Counter({
    name: 'ws_msgs_received_total',
    help: 'Total messages received from watch method',
    labelNames: ['exchange', 'method'],
});
exports.wsProcessing = new prom_client_1.Histogram({
    name: 'ws_processing_duration_seconds',
    help: 'Time taken by CCXT to process each WebSocket message',
    labelNames: ['exchange', 'method'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});
exports.wsDisconnects = new prom_client_1.Counter({
    name: 'ws_disconnects_total',
    help: 'Total disconnect events or exceptions during watch method',
    labelNames: ['exchange', 'method'],
});
exports.wsSessionDuration = new prom_client_1.Histogram({
    name: 'ws_session_duration_seconds',
    help: 'Total duration of WebSocket session (seconds)',
    labelNames: ['exchange', 'method'],
    buckets: [1, 5, 10, 30, 60],
});
// System Metrics
exports.processCpuUsageGauge = new prom_client_1.Gauge({
    name: 'process_cpu_usage_percentage',
    help: 'Process CPU usage percentage',
});
exports.processMemoryUsageGauge = new prom_client_1.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Process memory usage (RSS) in bytes',
});
