import test from 'node:test';
import assert from 'node:assert/strict';
import { readWidgetHtml, readWidgetPage, widgetFile } from '../../ts/widget-files.js';

const EXTERNAL_ASSET = /<link rel="stylesheet"|<script src="(?!\/)/;

test ('a widget is served as one self-contained document', async () => {
    for (const name of [ 'market-data.html', 'order-launcher.html' ]) {
        const html = await readWidgetHtml (widgetFile (name));
        assert.doesNotMatch (html, EXTERNAL_ASSET, name);
        assert.match (html, /const Dom = \{/, name);
        assert.match (html, /const HostBridge = /, name);
        assert.match (html, /--background: #030e16/, name);
    }
    assert.match (await readWidgetHtml (widgetFile ('order-launcher.html')), /const SigningSteps = /);
    assert.match (await readWidgetHtml (widgetFile ('market-data.html')), /function drawChart/);
});

test ('the signing page keeps its scripts in one same-origin bundle', async () => {
    const { html, script } = await readWidgetPage (widgetFile ('order-signing.html'), '/order-signing/app.js');
    assert.doesNotMatch (html, EXTERNAL_ASSET);
    assert.doesNotMatch (html, /<script>/);
    assert.equal (html.match (/<script src="\/order-signing\/app\.js" defer><\/script>/g)?.length, 1);
    assert.ok (html.indexOf ('/order-signing/ccxt.js') < html.indexOf ('/order-signing/app.js'));
    const order = [ 'const Dom = {', 'const CredentialVault = {', 'const SigningRequest = {', 'const RelayExchange = ', 'start();' ].map ((marker) => script.indexOf (marker));
    assert.ok (order.every ((position, index) => position >= 0 && (index === 0 || position > order[index - 1])), String (order));
});
