# Deployment artifacts

Status: **installed by hand, not by the deploy.** Every file here matches what runs on the box, and
none of it is applied automatically yet — see "The gap this does not close" below.

Everything that makes the box work used to live only on the box: three systemd units, a shared env
file, an nginx snippet, a logrotate config. None of it was in git, which meant a rollback restored
code and nothing else, and a rebuild-from-scratch was an archaeology exercise against a running
machine. These are those files.

| File | Installs to | What breaks without it |
|---|---|---|
| [`systemd/order-router.service`](./systemd/order-router.service) | `/etc/systemd/system/` | The API. Without `Restart=`, the first unhandled rejection ends the service permanently |
| [`systemd/order-router-web.service`](./systemd/order-router-web.service) | `/etc/systemd/system/` | The console at `/router` — signup, login, key minting, the admin page |
| [`systemd/order-router-ingest.service`](./systemd/order-router-ingest.service) | `/etc/systemd/system/` | Key projection. Without it the router answers 401 to every caller minted after the last hand-written `keys.json`, with nothing in the logs to explain it |
| [`env.example`](./env.example) | `/opt/order-router/env` (filled in) | All three. Every state path defaults to somewhere inside the release dir, which the next deploy discards |
| [`nginx/docs.ccxt.com-router.conf`](./nginx/docs.ccxt.com-router.conf) | `/etc/nginx/snippets/` | Public access, TLS, and the WS timeout the app's heartbeat is calibrated against |
| [`logrotate/order-router`](./logrotate/order-router) | `/etc/logrotate.d/` | Disk, eventually — on a 7.5 GB box shared with two other production deploys |
| [`prometheus/scrape.yml`](./prometheus/scrape.yml) | merge into `prometheus.yml` | Nothing scrapes `/metrics`; every alert below is unreachable |
| [`prometheus/order-router.rules.yml`](./prometheus/order-router.rules.yml) | `/etc/prometheus/rules/` | Alerting. A dead exchange subscription is currently found by a customer, not by us |

The README's § "One-time setup on the box" quotes the load-bearing lines of the three units inline,
because an operator pasting a unit onto a box should not have to open a second file to find out
which lines matter and why. When the two disagree, **this directory is the source of truth** — and
`src/docs.test.ts` asserts that the README's copy still carries `Restart=` and an `ExecReload=`
whose signal `src/index.ts` handles, so the quote cannot silently rot into decoration.

## The gap this does not close

The release tarball is code only:

```
tar czf /tmp/order-router.tgz dist node_modules scripts package.json package-lock.json
```

Nothing in that list is a config file, and the activate step does not install one. So committing
these files versions them and makes them reviewable — a config change now gets a diff and a
reviewer — but it does **not** make a rollback restore config. Rolling back to a release whose unit
files differed from today's still leaves today's units in `/etc/systemd/system`, and a config change
made directly on the box still drifts silently from what is here.

Closing that needs two changes to files this directory does not own:

1. **`.github/workflows/order-router.yml`** — add `docs/deploy` to the `tar czf` list, and in the
   activate step, after the symlink swap and before the restart:
   ```bash
   $SUDO install -m 0644 "$BASE/current/docs/deploy/systemd/"*.service /etc/systemd/system/
   $SUDO install -m 0644 "$BASE/current/docs/deploy/logrotate/order-router" /etc/logrotate.d/
   $SUDO install -m 0644 "$BASE/current/docs/deploy/nginx/docs.ccxt.com-router.conf" \
       /etc/nginx/snippets/order-router.conf
   $SUDO nginx -t && $SUDO systemctl reload nginx
   $SUDO systemctl daemon-reload
   ```
   The `nginx -t` gate is not optional: that config is shared with two other deploy pipelines, so
   an unvalidated reload from this deploy takes them down too. `env.example` is deliberately NOT
   installed — the real env file holds credentials and must never be overwritten by a release.
2. **`src/index.ts` and `src/web/index.ts`** — a boot-time assertion that refuses to start when
   `ORDER_ROUTER_KEYS_FILE` or `ORDER_ROUTER_AUDIT_LOG_FILE` resolves inside the release directory
   (i.e. under `/opt/order-router/releases/` or relative to `process.cwd()`). Today that
   misconfiguration is silent until the next deploy deletes the file.

## Known gap: log reopen

`logrotate/order-router` uses `create` rather than `copytruncate`, because the ingest runner follows
the rotated file by inode and `copytruncate` would strand its cursor past the end of a truncated
file — silently, forever. But pino opens the audit destination once at process start and holds the
fd, so after a `create` rotation the writers keep appending to the renamed inode and the fresh
`audit.log` stays empty.

There is no reopen signal to send. `SIGHUP` is already taken by the key reload, so wiring rotation
to it would make `systemctl reload` ambiguous and a rotation that "succeeded" while doing nothing.
The postrotate block therefore restarts the units, which for the router costs a full book-cache
rebuild — which is why the rotation schedule is monthly-with-a-size-guard rather than daily.

The fix is small and lives in a file this directory does not own: in `src/logger.ts`, keep a
reference to the `pino.destination` handle, and in `src/index.ts` / `src/web/index.ts` add

```ts
process.on('SIGUSR2', () => auditDestination.reopen());
```

then replace the two `systemctl restart` lines in the postrotate block with
`systemctl kill -s SIGUSR2 order-router order-router-web`. Until that lands, the restart is the
honest option: a rotation that leaves the writer on the old inode is worse than a rare restart.
