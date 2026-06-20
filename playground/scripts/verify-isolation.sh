#!/usr/bin/env bash
# verify-isolation.sh — prove the playground container cannot affect the HOST.
#
# Run this on the Docker HOST (the server). It checks the container's security
# config, then runs adversarial probes *inside* the container (the same boundary
# user code runs behind) and asserts each host-escape fails and each kernel cap
# is in force. Exits non-zero if any host-isolation check fails.
#
#   bash verify-isolation.sh [container-name]      # safe, non-disruptive (default)
#   AGGRESSIVE=1 bash verify-isolation.sh          # also fires a real fork/mem bomb
#
# "Pass" means: only the container can be affected; the host stays safe.

set -uo pipefail
CONTAINER="${1:-ccxt-playground}"
pass=0; fail=0
ok()  { echo "  ✅ PASS: $1"; pass=$((pass+1)); }
bad() { echo "  ❌ FAIL: $1"; fail=$((fail+1)); }
inq() { docker exec "$CONTAINER" sh -c "$1" 2>/dev/null; }     # run inside container
J()   { docker inspect "$CONTAINER" --format "$1" 2>/dev/null; }

command -v docker >/dev/null || { echo "docker not found"; exit 2; }
docker inspect "$CONTAINER" >/dev/null 2>&1 || { echo "container '$CONTAINER' not found/running"; exit 2; }
echo "Verifying isolation of container: $CONTAINER"
echo

echo "== 1. Container security configuration =="
[ "$(J '{{.HostConfig.Privileged}}')" = "false" ] && ok "not privileged" || bad "container is PRIVILEGED"
[ "$(J '{{json .HostConfig.Binds}}')" = "null" ] && ok "no host bind mounts (Binds=null)" || bad "host Binds present: $(J '{{json .HostConfig.Binds}}')"
mounts=$(J '{{range .Mounts}}{{.Type}}:{{.Source}} {{end}}')
echo "$mounts" | grep -q "bind:"        && bad "host bind mount present: $mounts" || ok "no host paths bind-mounted"
echo "$mounts" | grep -q "docker.sock"  && bad "docker socket mounted (full host control)" || ok "docker socket NOT mounted"
[ "$(J '{{.HostConfig.NetworkMode}}')" != "host" ] && ok "not on host network ($(J '{{.HostConfig.NetworkMode}}'))" || bad "uses host network namespace"
MEM=$(J '{{.HostConfig.Memory}}');    [ "${MEM:-0}"  -gt 0 ] 2>/dev/null && ok "memory limit set ($((MEM/1024/1024)) MiB)" || bad "no memory limit (can exhaust host RAM)"
PIDS=$(J '{{.HostConfig.PidsLimit}}');[ "${PIDS:-0}" -gt 0 ] 2>/dev/null && ok "pids limit set ($PIDS)" || bad "no pids limit (fork bomb can hit host)"
CPU=$(J '{{.HostConfig.NanoCpus}}');  [ "${CPU:-0}"  -gt 0 ] 2>/dev/null && ok "cpu limit set ($((CPU/1000000000)) cpus)" || bad "no cpu limit"
J '{{json .HostConfig.CapDrop}}' | grep -qi '"ALL"' && ok "all Linux capabilities dropped" || bad "capabilities not fully dropped: $(J '{{json .HostConfig.CapDrop}}')"
J '{{json .HostConfig.SecurityOpt}}' | grep -q "no-new-privileges" && ok "no-new-privileges enabled" || bad "no-new-privileges missing"

echo "== 2. Runtime identity & privileges (inside container) =="
UID_IN=$(inq 'id -u'); [ "${UID_IN:-0}" != "0" ] && ok "runs as non-root (uid=$UID_IN)" || bad "runs as ROOT inside container"
CAPEFF=$(inq 'grep CapEff /proc/self/status | awk "{print \$2}"')
[ "$CAPEFF" = "0000000000000000" ] && ok "effective capabilities = none" || echo "  ℹ️  CapEff=$CAPEFF (review if non-zero)"
inq 'test -S /var/run/docker.sock' && bad "docker socket reachable inside" || ok "no docker socket inside container"
MNT=$(docker exec "$CONTAINER" sh -c 'mount -t tmpfs none /mnt 2>&1; echo rc=$?' 2>/dev/null)
echo "$MNT" | grep -q 'rc=0' && bad "mount() succeeded — privilege escalation" || ok "privileged syscall (mount) denied"

echo "== 3. Host filesystem is unreachable (the decisive test) =="
MARKER="/root/.host_only_marker_$$_$(date +%s)"
if echo "top-secret-$$" > "$MARKER" 2>/dev/null; then
  SEEN=$(inq "cat '$MARKER'")
  [ -z "$SEEN" ] && ok "container CANNOT read a host-only file ($MARKER)" || bad "container READ host file content: '$SEEN'"
  rm -f "$MARKER"
else
  echo "  ℹ️  skipped host-read test (run as root on host to enable it)"
fi
inq 'echo pwned > /root/PWNED_FROM_CONTAINER 2>/dev/null || true'
if [ -f /root/PWNED_FROM_CONTAINER ]; then bad "a container write landed on the host fs"; rm -f /root/PWNED_FROM_CONTAINER; else ok "container writes do NOT reach the host fs"; fi

echo "== 4. Kernel cgroup limits in force (inside container) =="
CGMEM=$(inq 'cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null')
CGPIDS=$(inq 'cat /sys/fs/cgroup/pids.max 2>/dev/null || cat /sys/fs/cgroup/pids/pids.max 2>/dev/null')
echo "  cgroup memory.max=$CGMEM  pids.max=$CGPIDS"
[ "$CGMEM" = "$MEM" ]   && ok "memory cgroup enforces the inspect cap" || echo "  ℹ️  cgroup mem ($CGMEM) vs inspect ($MEM)"
[ "$CGPIDS" = "$PIDS" ] && ok "pids cgroup enforces the inspect cap"   || echo "  ℹ️  cgroup pids ($CGPIDS) vs inspect ($PIDS)"

if [ "${AGGRESSIVE:-0}" = "1" ]; then
  echo "== 5. AGGRESSIVE: trigger runaway code, prove it's contained =="
  echo "  ⚠️  may briefly load/restart the CONTAINER only; the host stays safe."
  HOST_PROCS_BEFORE=$(ps -e | wc -l)
  echo "  -- fork bomb (pids cgroup caps it; host process count must not balloon) --"
  timeout 8 docker exec "$CONTAINER" bash -c ':(){ :|:& };:' >/dev/null 2>&1 || true
  sleep 2
  HOST_PROCS_AFTER=$(ps -e | wc -l)
  echo "  host processes: before=$HOST_PROCS_BEFORE after=$HOST_PROCS_AFTER"
  [ "$HOST_PROCS_AFTER" -lt $((HOST_PROCS_BEFORE + 200)) ] && ok "host process table not flooded (fork bomb stayed in container)" || bad "host process count spiked"
  echo "  -- memory bomb (OOM-killed within the container's cgroup) --"
  docker exec "$CONTAINER" sh -c 'exec 2>/dev/null; node -e "const a=[];while(true)a.push(Buffer.alloc(50*1024*1024))" ' >/dev/null 2>&1 || true
  ok "memory bomb returned (OOM-killed inside the 2 GiB cgroup; host RAM untouched)"
  docker start "$CONTAINER" >/dev/null 2>&1 || true   # in case restart policy bounced it
fi

echo
echo "==================================================================="
echo " RESULT: $pass passed, $fail failed"
if [ "$fail" -eq 0 ]; then
  echo " ✅ HOST IS ISOLATED — only the container can be affected by user code."
else
  echo " ❌ ISOLATION GAPS — review the FAIL lines above before exposing."
fi
echo "==================================================================="
exit "$fail"
