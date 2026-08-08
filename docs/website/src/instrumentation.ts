// Next.js instrumentation hook: register() runs once per server boot (dev and the
// standalone production server). It schedules the exchange health monitor in-process
// rather than spawning a child process — the standalone Docker bundle only ships
// statically-traced imports, so an in-process import is what guarantees the monitor
// code (and its deps) actually exist in the image. The work itself is a handful of
// parallel fetches every 30 minutes, so it doesn't need process isolation.

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

// dev HMR / multiple workers can call register() again — keep one schedule per process
declare global {
  // eslint-disable-next-line no-var
  var __ccxtHealthMonitorStarted: boolean | undefined;
}

export async function register() {
  // nodejs runtime only: the edge/browser bundles also load this file but have no fs
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.HEALTH_MONITOR === '0') return; // opt-out (e.g. CI, offline dev)
  if (globalThis.__ccxtHealthMonitorStarted) return;
  globalThis.__ccxtHealthMonitorStarted = true;
  // dynamic import keeps node:fs out of the non-node bundles that load this file
  const { runHealthMonitorCheck } = await import('./lib/health-monitor');
  const run = async () => {
    try {
      const entries = await runHealthMonitorCheck();
      console.log(`[health-monitor] checked ${entries.length} exchanges, ${entries.filter((e) => !e.ok).length} down`);
    } catch (err) {
      // a failed sweep keeps the previous snapshot on disk; never crash the server
      console.error('[health-monitor] sweep failed:', err);
    }
  };
  void run(); // first snapshot immediately, but don't block server boot on it
  // unref: a pending timer must not keep the process alive on shutdown
  setInterval(run, CHECK_INTERVAL_MS).unref();
}
