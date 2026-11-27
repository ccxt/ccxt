#!/usr/bin/env bash
# Zero-downtime deploy of the hosted CCXT MCP server on the docs.ccxt.com machine.
#
# Run as root on the machine (the deploy-mcp-hosted.yml workflow runs it over SSH; it can
# also be run by hand). It never builds: the image must be in the registry (or already
# local). Blue/green, like the docs site's own deploy (docs-fumadocs.yml):
#
#   1. start the new build as a second compose project on the spare loopback port
#      (8098 / 8099), next to the live one;
#   2. smoke-test it there: /readyz turns 200 (markets warm), MCP initialize, tools/list,
#      one tool call;
#   3. install the release's nginx files with the upstream pointing at the new port,
#      nginx -t, graceful reload (in-flight requests finish on the old container);
#   4. stop the old container (SIGTERM: it drains its in-flight calls, then exits).
#
# Any failure before step 3 removes the new container and leaves the live one untouched;
# a failed nginx test restores the previous nginx files.
#
# Inputs (environment):
#   IMAGE        image repository, e.g. ghcr.io/ccxt/ccxt-mcp-hosted (local images work too)
#   BUILD_ID     the tag to deploy (the short commit sha)
#   RELEASE_DIR  this release's docker-compose.yml and deploy/ files, unpacked on the machine
#   DEPLOY_DIR   default /srv/ccxt-mcp-hosted; holds the .env (secrets, never in git)
#   GHCR_USER / GHCR_TOKEN  optional: registry login for the pull. With GHCR_TOKEN_STDIN=1 the
#                token is read from the first line of stdin instead (the workflow does this, so
#                the token never sits in a process's argv or environment on this machine)
#   PUBLIC_HOST  default docs.ccxt.com; the Host header the smoke test sends
set -euo pipefail

: "${IMAGE:?IMAGE is required}"
: "${BUILD_ID:?BUILD_ID is required}"
: "${RELEASE_DIR:?RELEASE_DIR is required}"
DEPLOY_DIR="${DEPLOY_DIR:-/srv/ccxt-mcp-hosted}"
PUBLIC_HOST="${PUBLIC_HOST:-docs.ccxt.com}"
ENV_FILE="$DEPLOY_DIR/.env"
NGINX_HTTP=/etc/nginx/conf.d/ccxt-mcp-http.conf
NGINX_LOCATIONS=/etc/nginx/snippets/ccxt-mcp-locations.conf
PORTS=(8099 8098)
READY_TIMEOUT_S="${READY_TIMEOUT_S:-240}"

log () { echo "[deploy $(date -u +%H:%M:%S)] $*"; }
fail () { echo "::error::$*"; exit 1; }

[[ "$BUILD_ID" =~ ^[0-9a-zA-Z._-]{1,64}$ ]] || fail "BUILD_ID has unexpected characters: $BUILD_ID"
[ -f "$ENV_FILE" ] || fail "$ENV_FILE is missing (one-time setup: README, Deploy)"
[ -f "$RELEASE_DIR/docker-compose.yml" ] || fail "$RELEASE_DIR/docker-compose.yml is missing"
chmod 600 "$ENV_FILE"
# compose reads .env from the project directory, both for interpolation and for the
# container's env_file: point the release at the machine's one
ln -sfn "$ENV_FILE" "$RELEASE_DIR/.env"

# ---- which port is live ------------------------------------------------------------------
CUR_PORT=""
if [ -f "$NGINX_HTTP" ]; then
    CUR_PORT=$(grep -oE 'server 127\.0\.0\.1:[0-9]+;' "$NGINX_HTTP" | grep -oE '[0-9]+;' | tr -d ';' | head -1 || true)
fi
NEW_PORT="${PORTS[0]}"
[ "$CUR_PORT" = "${PORTS[0]}" ] && NEW_PORT="${PORTS[1]}"
NEW_PROJECT="ccxt-mcp-$NEW_PORT"
log "live port ${CUR_PORT:-none}, deploying $IMAGE:$BUILD_ID on $NEW_PORT (project $NEW_PROJECT)"

compose () { # project, args...
    local project="$1"; shift
    IMAGE="$IMAGE" BUILD_ID="$BUILD_ID" HOST_PORT="$NEW_PORT" \
        docker compose --project-directory "$RELEASE_DIR" -f "$RELEASE_DIR/docker-compose.yml" -p "$project" "$@"
}

# ---- reclaim disk first: a full disk would block every later deploy ----------------------
docker image prune -f >/dev/null 2>&1 || true
df -h / | tail -1

# ---- the image ---------------------------------------------------------------------------
if [ "${GHCR_TOKEN_STDIN:-}" = 1 ]; then
    # a shell variable, not exported: it reaches docker login through a pipe only
    IFS= read -r GHCR_TOKEN || true
fi
if [ -n "${GHCR_TOKEN:-}" ]; then
    echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER is required with GHCR_TOKEN}" --password-stdin >/dev/null
fi
if ! docker image inspect "$IMAGE:$BUILD_ID" >/dev/null 2>&1; then
    docker pull "$IMAGE:$BUILD_ID"
fi
[ -n "${GHCR_TOKEN:-}" ] && docker logout ghcr.io >/dev/null 2>&1 || true

# ---- start the new build next to the live one ---------------------------------------------
# remove a leftover of a failed run on the spare port
docker ps -aq --filter "label=com.docker.compose.project=$NEW_PROJECT" | xargs -r docker rm -f >/dev/null
compose "$NEW_PROJECT" up -d --no-build --no-deps --pull never hosted

discard_new () {
    echo "--- last log lines of the new container ---"
    compose "$NEW_PROJECT" logs --tail 40 hosted 2>&1 || true
    docker ps -aq --filter "label=com.docker.compose.project=$NEW_PROJECT" | xargs -r docker rm -f >/dev/null || true
}

# ---- smoke test on the new port -----------------------------------------------------------
mcp () { # json-rpc body -> response text
    curl -sS --max-time 30 -A 'ccxt-mcp-smoke/deploy' -X POST "http://127.0.0.1:$NEW_PORT/mcp" \
        -H "Host: $PUBLIC_HOST" -H 'Content-Type: application/json' \
        -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' -d "$1"
}
smoke () {
    local code out
    for _ in $(seq 1 "$READY_TIMEOUT_S"); do
        code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$NEW_PORT/readyz" || true)
        [ "$code" = 200 ] && break
        sleep 1
    done
    [ "$code" = 200 ] || { echo "smoke: /readyz not 200 after ${READY_TIMEOUT_S}s (last $code)"; return 1; }
    out=$(mcp '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"deploy-smoke","version":"1"}}}') || return 1
    echo "$out" | grep -q '"protocolVersion"' || { echo "smoke: initialize failed: ${out:0:300}"; return 1; }
    out=$(mcp '{"jsonrpc":"2.0","id":2,"method":"tools/list"}') || return 1
    for tool in list_exchanges get_tickers show_chart live_update get_balance; do
        echo "$out" | grep -q "\"name\":\"$tool\"" || { echo "smoke: tools/list lacks $tool"; return 1; }
    done
    out=$(mcp '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_exchanges","arguments":{}}}') || return 1
    echo "$out" | grep -q '\\"ok\\":true' || { echo "smoke: list_exchanges failed: ${out:0:300}"; return 1; }
    echo "smoke: OK"
}
if ! smoke; then
    discard_new
    fail "smoke test failed: NOT switching; live stays on ${CUR_PORT:-none}"
fi

# ---- switch nginx --------------------------------------------------------------------------
BACKUP=$(mktemp -d)
[ -f "$NGINX_HTTP" ] && cp -a "$NGINX_HTTP" "$BACKUP/http.conf"
[ -f "$NGINX_LOCATIONS" ] && cp -a "$NGINX_LOCATIONS" "$BACKUP/locations.conf"
sed -E "s/server 127\.0\.0\.1:[0-9]+;/server 127.0.0.1:$NEW_PORT;/" "$RELEASE_DIR/deploy/nginx/ccxt-mcp-http.conf" > "$NGINX_HTTP.tmp"
grep -q "server 127.0.0.1:$NEW_PORT;" "$NGINX_HTTP.tmp" || { rm -f "$NGINX_HTTP.tmp"; discard_new; fail "the release's nginx upstream has no server line to point at $NEW_PORT"; }
mv "$NGINX_HTTP.tmp" "$NGINX_HTTP"
install -m 644 "$RELEASE_DIR/deploy/nginx/ccxt-mcp-locations.conf" "$NGINX_LOCATIONS"
if nginx -t 2>/dev/null; then
    nginx -s reload
    log "nginx: upstream ${CUR_PORT:-none} -> $NEW_PORT"
else
    nginx -t || true
    [ -f "$BACKUP/http.conf" ] && cp -a "$BACKUP/http.conf" "$NGINX_HTTP" || rm -f "$NGINX_HTTP"
    [ -f "$BACKUP/locations.conf" ] && cp -a "$BACKUP/locations.conf" "$NGINX_LOCATIONS" || rm -f "$NGINX_LOCATIONS"
    discard_new
    fail "nginx config invalid with this release: previous nginx files restored; live stays on ${CUR_PORT:-none}"
fi
rm -rf "$BACKUP"
grep -Rqs 'snippets/ccxt-mcp-locations.conf' /etc/nginx/sites-enabled/ || echo "::warning::no enabled nginx site includes snippets/ccxt-mcp-locations.conf: /mcp is not public (README, Deploy)"

# ---- stop the old build ----------------------------------------------------------------------
# give nginx's old workers a moment to hand their last requests over, then SIGTERM: the app
# answers 503 to anything new, finishes in-flight calls (DRAIN_TIMEOUT_MS) and exits.
# "ccxt-mcp" is the project name of a manual `docker compose up` (README, before automation)
sleep 3
for project in "ccxt-mcp-$CUR_PORT" ccxt-mcp; do
    [ "$project" = "$NEW_PROJECT" ] && continue
    ids=$(docker ps -aq --filter "label=com.docker.compose.project=$project" --filter "label=com.docker.compose.service=hosted")
    if [ -n "$ids" ]; then
        log "stopping $project"
        echo "$ids" | xargs -r docker stop -t 30 >/dev/null
        echo "$ids" | xargs -r docker rm >/dev/null
    fi
done

# ---- autoheal (one instance for every color) --------------------------------------------------
if ! docker ps -q --filter "label=com.docker.compose.service=autoheal" | grep -q .; then
    compose ccxt-mcp-autoheal up -d --no-deps autoheal
fi
# a manual-era project may still own one; keep exactly one running
mapfile -t healers < <(docker ps -q --filter "label=com.docker.compose.service=autoheal")
if [ "${#healers[@]}" -gt 1 ]; then
    docker ps -q --filter "label=com.docker.compose.service=autoheal" --filter "label=com.docker.compose.project=ccxt-mcp" | xargs -r docker rm -f >/dev/null
fi

# ---- record and clean up -----------------------------------------------------------------------
sed -i "s/^BUILD_ID=.*/BUILD_ID=$BUILD_ID/" "$ENV_FILE"
echo "$NEW_PORT" > "$DEPLOY_DIR/active-port"
ln -sfn "$RELEASE_DIR" "$DEPLOY_DIR/current"
# keep the last 5 releases and the last 3 images (rollback = re-run with an older BUILD_ID)
if [ -d "$DEPLOY_DIR/releases" ]; then
    ls -1dt "$DEPLOY_DIR"/releases/*/ 2>/dev/null | tail -n +6 | xargs -r rm -rf
fi
docker images "$IMAGE" --format '{{.Tag}}' | grep -vx "$BUILD_ID" | grep -v '^<none>$' | tail -n +3 \
    | xargs -r -I{} docker rmi "$IMAGE:{}" >/dev/null 2>&1 || true
log "deployed $IMAGE:$BUILD_ID on 127.0.0.1:$NEW_PORT"
