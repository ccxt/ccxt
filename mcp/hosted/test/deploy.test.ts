import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// The pieces deploy/remote-deploy.sh and .github/workflows/deploy-mcp-hosted.yml rely on.
// The workflow itself only runs in ccxt/ccxt against the real machine; this pins its
// contract with the files in this folder.

const here = path.dirname (fileURLToPath (import.meta.url));
const hosted = path.join (here, '..');
const repo = path.join (hosted, '..', '..');
const read = (file: string) => fs.readFileSync (path.join (hosted, file), 'utf8');
const script = read ('deploy/remote-deploy.sh');
const workflow = fs.readFileSync (path.join (repo, '.github', 'workflows', 'deploy-mcp-hosted.yml'), 'utf8');

test ('deploy: remote-deploy.sh is valid bash and executable', () => {
    execFileSync ('bash', [ '-n', path.join (hosted, 'deploy', 'remote-deploy.sh') ]);
    assert.ok ((fs.statSync (path.join (hosted, 'deploy', 'remote-deploy.sh')).mode & 0o111) !== 0, 'executable bit');
});

test ('deploy: the nginx upstream has exactly one server line for the script to repoint', () => {
    const http = read ('deploy/nginx/ccxt-mcp-http.conf');
    const lines = http.match (/server 127\.0\.0\.1:[0-9]+;/g) ?? [];
    assert.equal (lines.length, 1, 'remote-deploy.sh rewrites the single upstream server line');
    const swapped = http.replace (/server 127\.0\.0\.1:[0-9]+;/, 'server 127.0.0.1:8098;');
    assert.match (swapped, /upstream ccxt_mcp_hosted \{\s*(#[^\n]*\n\s*)*server 127\.0\.0\.1:8098;/);
});

test ('deploy: compose takes the image repository, tag and loopback port from the deploy', () => {
    const compose = read ('docker-compose.yml');
    assert.match (compose, /image: \$\{IMAGE:-ccxt-mcp-hosted\}:\$\{BUILD_ID:\?/);
    assert.match (compose, /"127\.0\.0\.1:\$\{HOST_PORT:-8080\}:8080"/);
    assert.match (compose, /^  hosted:$/m);
    assert.match (compose, /^  autoheal:$/m);
    // autoheal gets the Docker socket: its image is pinned by digest, not only by tag
    assert.match (compose, /image: willfarrell\/autoheal:[\w.-]+@sha256:[0-9a-f]{64}$/m);
    // the script starts, filters and stops containers by these service names
    assert.match (script, /up -d --no-build --no-deps --pull never hosted/);
    assert.match (script, /com\.docker\.compose\.service=hosted/);
    assert.match (script, /com\.docker\.compose\.service=autoheal/);
});

test ('deploy: the workflow uses the docs deploy secrets and ships what the script reads', () => {
    for (const secret of [ 'DOCS_DEPLOY_SSH_KEY', 'DOCS_DEPLOY_KNOWN_HOSTS', 'DOCS_DEPLOY_HOST', 'DOCS_DEPLOY_USER' ]) {
        assert.ok (workflow.includes ('secrets.' + secret), secret);
    }
    // no server secret is read from GitHub: they live in the machine's .env
    for (const secret of [ 'POSTHOG', 'CLIENT_HASH_SECRET', 'OPENAI_APPS_CHALLENGE' ]) {
        assert.ok (!new RegExp ('secrets\\.' + secret).test (workflow), secret + ' must stay on the machine');
    }
    assert.ok (workflow.includes ('tar -cz -C mcp/hosted docker-compose.yml deploy'));
    assert.ok (workflow.includes ('deploy/remote-deploy.sh'));
    assert.ok (workflow.includes ('file: mcp/hosted/Dockerfile'));
    assert.ok (workflow.includes ("github.repository == 'ccxt/ccxt'"));
    // runs only after the MCP workflow (tests) passed on a push
    assert.match (workflow, /workflows: \[ MCP \]/);
    assert.ok (workflow.includes ("github.event.workflow_run.conclusion == 'success'"));
    const mcpWorkflow = fs.readFileSync (path.join (repo, '.github', 'workflows', 'mcp.yml'), 'utf8');
    assert.match (mcpWorkflow, /^name: MCP$/m, 'the workflow_run trigger names this workflow');
    // the script's inputs are the ones the workflow passes
    // the registry token travels over stdin, never as a VAR=value on the ssh command line
    assert.ok (!/GHCR_TOKEN="\$\{GHCR_TOKEN\}"/.test (workflow), 'no GHCR_TOKEN on the remote command line');
    assert.match (workflow, /printf '%s\\n' "\$GHCR_TOKEN" \| ssh /);
    assert.ok (workflow.includes ('GHCR_TOKEN_STDIN=1'));
    assert.match (script, /if \[ "\$\{GHCR_TOKEN_STDIN:-\}" = 1 \]; then\n\s+# [^\n]*\n\s+IFS= read -r GHCR_TOKEN/);
    for (const input of [ 'IMAGE', 'BUILD_ID', 'RELEASE_DIR', 'DEPLOY_DIR', 'GHCR_USER', 'GHCR_TOKEN_STDIN' ]) {
        assert.ok (workflow.includes (input + '='), 'workflow passes ' + input);
        assert.ok (script.includes (input), 'script reads ' + input);
    }
});

test ('deploy: mcp.ccxt.com serves the MCP locations, and only them, under its own certificate', () => {
    const site = read ('deploy/nginx/mcp.ccxt.com.conf');
    assert.match (site, /server_name mcp\.ccxt\.com;/);
    assert.match (site, /include snippets\/ccxt-mcp-locations\.conf;/);
    assert.match (site, /ssl_certificate \/etc\/letsencrypt\/live\/mcp\.ccxt\.com\/fullchain\.pem;/);
    assert.match (site, /client_header_timeout 10s;/);
    // the bare host is the endpoint for POSTs; nothing else reaches the app
    assert.match (site, /location = \/ \{\s*if \(\$request_method = POST\) \{ rewrite \^ \/mcp last; \}/);
    assert.doesNotMatch (site, /proxy_pass/);
    // the ACME webroot is served on port 80 only
    assert.equal ((site.match (/acme-challenge/g) ?? []).length, 1);
});

test ('deploy: the smoke test checks tools this server actually lists', async () => {
    const { HOSTED_TOOLS } = await import ('../src/profile.js');
    const checked = [ ...script.matchAll (/for tool in ([a-z_ ]+); do/g) ].flatMap ((m) => m[1].trim ().split (/\s+/));
    assert.ok (checked.length >= 3);
    for (const tool of checked) {
        assert.ok (Object.prototype.hasOwnProperty.call (HOSTED_TOOLS, tool), tool + ' is a hosted tool');
    }
});
