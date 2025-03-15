"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const metrics_1 = require("./metrics");
const benchmark_1 = require("./benchmark");
const app = (0, express_1.default)();
app.get('/metrics', async (_, res) => {
    res.set('Content-Type', metrics_1.register.contentType);
    res.end(await metrics_1.register.metrics());
});
app.listen(3000, () => {
    console.log('Metrics server running on port 3000');
});
let previousCpuUsage = process.cpuUsage();
setInterval(() => {
    const currentCpuUsage = process.cpuUsage(previousCpuUsage);
    previousCpuUsage = process.cpuUsage();
    const cpuPercentage = ((currentCpuUsage.user + currentCpuUsage.system) / 1e6) * 100;
    metrics_1.processCpuUsageGauge.set(cpuPercentage);
    metrics_1.processMemoryUsageGauge.set(process.memoryUsage().rss);
}, 1000);
(0, benchmark_1.startBenchmarks)();
