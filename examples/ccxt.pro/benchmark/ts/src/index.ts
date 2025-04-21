import express from 'express';
import { register, processCpuUsageGauge, processMemoryUsageGauge } from './metrics';
import { startBenchmarks } from './benchmark';

const app = express();

app.get('/metrics', async (_, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log('Metrics server running on port 3000');
});

let previousCpuUsage = process.cpuUsage();
setInterval(() => {
  const currentCpuUsage = process.cpuUsage(previousCpuUsage);
  previousCpuUsage = process.cpuUsage();
  const cpuPercentage = ((currentCpuUsage.user + currentCpuUsage.system) / 1e6) * 100;
  processCpuUsageGauge.set(cpuPercentage);
  processMemoryUsageGauge.set(process.memoryUsage().rss);
}, 1000);

startBenchmarks();
