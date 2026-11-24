import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOM_SKIP, openPage, plain, press } from '../helpers/dom.js';
import type { Page } from '../helpers/dom.js';
import { renderPage } from '../../ts/setup/pages.js';

// The two account pages EXECUTED: the documents are the ones the page server sends (template,
// shared include, boot block), the server behind them is a recorded fetch. What the server
// itself enforces is tested against the real one in test/integration/setup.*.test.ts — this
// file is about what the page does before it ever sends anything.

const TOKEN = 'a'.repeat (32);
const BASE = '/setup/' + TOKEN;
const KEY = 'Kq7Zx9Lm2Vb4Np8Rt6Wy';
const SECRET = 'Hd3Gf5Js1Ka9Lo7Pi2Uy';
const INFO = {
    'ok': true, 'exchange': 'fakex', 'prediction': false, 'predictionVariant': false, 'name': 'FakeX', 'website': 'https://fakex.example',
    'fields': [ { 'name': 'apiKey', 'label': 'API key' }, { 'name': 'secret', 'label': 'API secret' } ],
    'configFileOnly': false, 'walletKey': false, 'environments': { 'sandbox': true, 'demo': false, 'live': true }, 'sandboxIsDemo': false,
};

interface Call {
    method: string;
    path: string;
    headers: Record<string, string>;
    body: any;
}

interface Form extends Page {
    calls: Call[];
    posts: (path: string) => Call[];
    heading: () => string;
    slot: () => string;
    click: (selector: string) => Promise<void>;
    type: (selector: string, value: string) => void;
    choose: (name: string, value: string) => void;
    enter: (selector: string) => Promise<any>;
}

type Answers = Record<string, (call: Call) => [ number, Record<string, any> ]>;

async function open (file: 'setup.html' | 'accounts.html', boot: Record<string, any>, answers: Answers = {}, path = BASE): Promise<Form> {
    const calls: Call[] = [];
    const page = await openPage (renderPage (file, 'testnonce', boot), {
        'url': 'http://127.0.0.1:4010' + path,
        'before': (window) => {
            // the page's only way out: recorded, and answered from `answers` by endpoint name
            window.fetch = async (url: string, options: any = {}) => {
                const endpoint = url.slice (BASE.length).split ('?')[0];
                const call = { 'method': options.method, 'path': url.slice (BASE.length), 'headers': plain (options.headers ?? {}), 'body': (options.body === undefined) ? undefined : JSON.parse (options.body) };
                calls.push (call);
                assert.ok (url.startsWith (BASE + '/'), 'every request goes to the session\'s own path: ' + url);
                assert.equal (options.credentials, 'same-origin');
                const answer = answers[endpoint] ?? (() => [ 200, (endpoint === '/credentials') ? INFO : { 'ok': true } ]);
                const [ status, body ] = answer (call);
                return { status, 'json': async () => plain (body) };
            };
            // no layout, nothing to scroll
            window.scrollTo = () => {};
        },
    });
    const document = page.document;
    const shown = () => document.querySelector ('section.step:not([hidden])');
    return {
        ...page,
        calls,
        'posts': (endpoint) => calls.filter ((call) => call.method === 'POST' && call.path === endpoint),
        'heading': () => shown ()?.querySelector ('h1').textContent,
        'slot': () => shown ()?.querySelector ('.slot').textContent,
        'click': async (selector) => {
            const node = (shown () ?? document).querySelector (selector) ?? document.querySelector (selector);
            assert.ok (node, 'nothing matches ' + selector);
            node.click ();
            await page.settle ();
        },
        'type': (selector, value) => {
            const node = document.querySelector (selector);
            node.value = value;
            node.dispatchEvent (new page.window.Event ('input', { 'bubbles': true }));
        },
        'choose': (name, value) => {
            const node = document.querySelector ('input[name="' + name + '"][value="' + value + '"]');
            node.checked = true;
            node.dispatchEvent (new page.window.Event ('change', { 'bubbles': true }));
        },
        'enter': async (selector) => {
            const event = press (page.window, document.querySelector (selector), 'Enter');
            await page.settle ();
            return event;
        },
    };
}

function wizardBoot (overrides: Record<string, any> = {}): Record<string, any> {
    return {
        'csrf': 'c'.repeat (32),
        'exchanges': [ 'fakex', 'otherx' ],
        'prefill': { 'exchange': 'fakex', 'account': 'practice', 'environment': 'sandbox' },
        'configPath': '/home/someone/.config/ccxt-mcp/config.json',
        'expiresInMs': 600000,
        'page': 'setup',
        ...overrides,
    };
}

// steps 1 -> 3 with both keys typed
async function toKeys (form: Form): Promise<void> {
    await form.click ('[data-next]');
    await form.click ('[data-next]');
    assert.equal (form.heading (), 'Paste your key');
    form.type ('#cred-0', KEY);
    form.type ('#cred-1', SECRET);
}

test ('setup page: starts on step 1 with the prefill, the config path and a countdown; asks only for the exchange\'s fields', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        const document = form.document;
        assert.equal (form.heading (), 'Before you start');
        assert.equal (document.querySelector ('#progress [aria-current="step"]').textContent, '1Start');
        assert.equal (document.getElementById ('path-1').textContent, '/home/someone/.config/ccxt-mcp/config.json');
        assert.match (document.getElementById ('expiry').textContent, /^Closes in (10:00|9:5\d)$/);
        assert.equal (document.getElementById ('exchange').value, 'fakex');
        assert.equal (document.getElementById ('account').value, 'practice');
        assert.equal (document.querySelector ('input[name="environment"]:checked').value, 'sandbox');
        // what this exchange needs was asked of the server once, with a plain GET (no nonce, no body)
        assert.deepEqual (form.calls, [ { 'method': 'GET', 'path': '/credentials?exchange=fakex', 'headers': {}, 'body': undefined } ]);
        assert.deepEqual (Array.from (document.querySelectorAll ('#fields input')).map ((input: any) => [ input.getAttribute ('data-field'), input.type ]), [ [ 'apiKey', 'password' ], [ 'secret', 'password' ] ]);
        assert.equal (document.querySelector ('input[name="environment"][value="demo"]').disabled, true, 'an environment the exchange does not have cannot be chosen');
        assert.equal (document.getElementById ('done-view').hidden, true);
        assert.equal (document.getElementById ('gone-view').hidden, true);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: Next moves the focus to the step heading and refuses to leave an incomplete step', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ({ 'prefill': { 'exchange': '', 'account': '', 'environment': 'sandbox' } }));
    try {
        const document = form.document;
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Get your key');
        assert.equal (document.activeElement.id, 't2', 'the heading, so a screen reader announces the step');
        // no exchange chosen
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Get your key');
        assert.equal (form.slot (), 'Choose your exchange first.');
        assert.equal (document.activeElement.id, 'exchange');
        const select = document.getElementById ('exchange');
        select.value = 'fakex';
        select.dispatchEvent (new form.window.Event ('change', { 'bubbles': true }));
        await form.settle ();
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Paste your key');
        // an empty box
        form.type ('#cred-0', KEY);
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Paste your key');
        assert.equal (form.slot (), 'Paste a value into every box.');
        assert.equal (document.activeElement.id, 'cred-1', 'the focus goes to the box that is empty');
        // the message goes away as soon as the box is edited
        form.type ('#cred-1', SECRET);
        assert.equal (form.slot (), '');
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'What the assistant may do');
        assert.deepEqual (form.posts ('/save'), []);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: Back and Next keep everything that was typed and chosen', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        const document = form.document;
        await toKeys (form);
        form.choose ('environment', 'live');
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'What the assistant may do');
        form.choose ('may', 'trade');
        form.type ('#cap', '40');
        document.getElementById ('live-confirm').click ();
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Review and save');
        form.type ('#account', 'my-live');
        // all the way back to the start…
        for (const expected of [ 'What the assistant may do', 'Paste your key', 'Get your key', 'Before you start' ]) {
            await form.click ('[data-back]');
            assert.equal (form.heading (), expected);
        }
        assert.ok (document.querySelector ('section.step:not([hidden]) [data-back]') === null, 'the first step has nowhere to go back to');
        // …and forward again: nothing was lost on the way
        await form.click ('[data-next]');
        assert.equal (document.getElementById ('exchange').value, 'fakex');
        await form.click ('[data-next]');
        assert.equal (document.getElementById ('cred-0').value, KEY);
        assert.equal (document.getElementById ('cred-1').value, SECRET);
        assert.equal (document.querySelector ('input[name="environment"]:checked').value, 'live');
        await form.click ('[data-next]');
        assert.equal (document.querySelector ('input[name="may"]:checked').value, 'trade');
        assert.equal (document.getElementById ('cap').value, '40');
        assert.equal (document.getElementById ('live-confirm').checked, true);
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Review and save');
        assert.equal (document.getElementById ('account').value, 'my-live');
        // going back and forth sent nothing anywhere
        assert.deepEqual (form.calls.map ((call) => call.method + ' ' + call.path), [ 'GET /credentials?exchange=fakex' ]);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: Enter moves on like the step\'s main button and never saves — not even on the last step', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        const document = form.document;
        await form.click ('[data-next]');
        // step 2: Enter in the exchange list
        assert.equal ((await form.enter ('#exchange')).defaultPrevented, true);
        assert.equal (form.heading (), 'Paste your key');
        // step 3: Enter with an empty box is refused like the button would
        await form.enter ('#cred-0');
        assert.equal (form.heading (), 'Paste your key');
        assert.equal (form.slot (), 'Paste a value into every box.');
        form.type ('#cred-0', KEY);
        form.type ('#cred-1', SECRET);
        await form.enter ('#cred-1');
        assert.equal (form.heading (), 'What the assistant may do');
        // step 4: Enter on a choice
        await form.enter ('input[name="may"][value="view"]');
        assert.equal (form.heading (), 'Review and save');
        assert.deepEqual (form.calls.filter ((call) => call.method === 'POST'), [], 'four Enters and nothing was sent');
        // step 5: Enter in the name box moves to the Save button; pressing THAT is the user's decision
        const event = await form.enter ('#account');
        assert.equal (event.defaultPrevented, true);
        assert.equal (form.heading (), 'Review and save');
        assert.equal (document.activeElement.id, 'save');
        assert.deepEqual (form.calls.filter ((call) => call.method === 'POST'), [], 'Enter in the name box must not save the account');
        // Enter on a button or a tick box is the browser's own business (it activates it)
        assert.equal ((await form.enter ('#save')).defaultPrevented, false);
        assert.equal ((await form.enter ('#live-confirm')).defaultPrevented, false);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: live trading does not pass without a cap above zero and the confirmation tick', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        const document = form.document;
        await toKeys (form);
        form.choose ('environment', 'live');
        await form.click ('[data-next]');
        assert.equal (document.getElementById ('livebox').hidden, true, 'view only: nothing about real money to agree to');
        form.choose ('may', 'trade');
        assert.equal (document.getElementById ('livebox').hidden, false);
        assert.equal (document.getElementById ('may-badge').textContent, 'Real money');
        // the tick is missing
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'What the assistant may do');
        assert.equal (form.slot (), 'Tick the box confirming that orders will use real money.');
        assert.equal (document.activeElement.id, 'live-confirm');
        // ticked, but no usable cap
        document.getElementById ('live-confirm').click ();
        for (const cap of [ '', '0', '-5', 'abc' ]) {
            form.type ('#cap', cap);
            await form.click ('[data-next]');
            assert.equal (form.heading (), 'What the assistant may do', 'a cap of "' + cap + '" must not pass');
            assert.equal (form.slot (), 'Enter the largest single order in USD (a number above 0).');
            assert.equal (document.activeElement.id, 'cap');
        }
        form.type ('#cap', '25');
        // switching to view only and back takes the tick away again: it is given per decision
        form.choose ('may', 'view');
        form.choose ('may', 'trade');
        assert.equal (document.getElementById ('live-confirm').checked, false);
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'What the assistant may do');
        document.getElementById ('live-confirm').click ();
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Review and save');
        assert.equal (document.getElementById ('r-may').textContent, 'View, and place orders with REAL money — up to 25 USD each, asking you every time');
        // the Save button re-checks the earlier steps too: untick, and it sends nothing
        document.getElementById ('live-confirm').checked = false;
        await form.click ('#save');
        assert.equal (form.heading (), 'What the assistant may do', 'Save goes back to the step that is not in order');
        assert.deepEqual (form.calls.filter ((call) => call.method === 'POST'), []);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: practice trading needs no cap and no tick', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        await toKeys (form);
        await form.click ('[data-next]');
        form.choose ('may', 'trade');
        assert.equal (form.document.getElementById ('livebox').hidden, true);
        assert.equal (form.document.getElementById ('may-badge').textContent, 'Practice money');
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'Review and save');
        assert.equal (form.document.getElementById ('r-may').textContent, 'View, and place orders with practice money');
    } finally {
        await form.close ();
    }
});

test ('setup page: the review shows the last four characters of the API key and nothing else of any credential', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        await toKeys (form);
        await form.click ('[data-next]');
        await form.click ('[data-next]');
        const review = form.document.querySelector ('section.step:not([hidden])').textContent;
        assert.ok (review.includes ('API key: ends in ••••' + KEY.slice (-4)));
        assert.ok (review.includes ('API secret: entered (hidden)'));
        assert.ok (!review.includes (KEY) && !review.includes (SECRET) && !review.includes (SECRET.slice (-4)));
        assert.equal (form.document.getElementById ('r-exchange').textContent, 'FakeX');
        assert.equal (form.document.getElementById ('r-env').textContent, 'Testnet Practice money');
    } finally {
        await form.close ();
    }
});

test ('setup page: Save tests the keys first, then posts exactly what the review showed, with the session nonce', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot (), {
        '/test': () => [ 200, { 'ok': true, 'tested': true } ],
        '/save': () => [ 200, { 'ok': true, 'account': 'practice', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': true, 'replaced': false, 'stoppedStreams': 0, 'toolsAdded': false, 'restartForTools': false } ],
    });
    try {
        const document = form.document;
        await toKeys (form);
        await form.click ('[data-next]');
        form.choose ('may', 'trade');
        await form.click ('[data-next]');
        await form.click ('#save');
        const headers = { 'Content-Type': 'application/json', 'X-Setup-Nonce': 'c'.repeat (32) };
        assert.deepEqual (form.calls.slice (1), [
            { 'method': 'POST', 'path': '/test', headers, 'body': { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' } },
            { 'method': 'POST', 'path': '/save', headers, 'body': { 'name': 'practice', 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox', 'trading': true } },
        ]);
        assert.equal (document.getElementById ('form-view').hidden, true);
        assert.equal (document.getElementById ('done-view').hidden, false);
        assert.equal (document.activeElement.id, 'done-title');
        assert.equal (document.getElementById ('done-summary').textContent, 'Account “practice” on FakeX · Testnet · can place practice orders');
        // typed keys do not sit in the page after it has served its purpose
        assert.deepEqual (Array.from (document.querySelectorAll ('#fields input')).map ((input: any) => input.value), [ '', '' ]);
        assert.equal (document.getElementById ('expiry').textContent, '');
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: a failed connection test is never silent — the save waits for an explicit "Save anyway"', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot (), {
        '/test': () => [ 200, { 'ok': false, 'tested': true, 'code': 'TEST_FAILED', 'kind': 'AuthenticationError', 'error': '<b>bad key</b>' } ],
        '/save': () => [ 200, { 'ok': true, 'account': 'practice', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': false } ],
    });
    try {
        const document = form.document;
        await toKeys (form);
        await form.click ('[data-next]');
        await form.click ('[data-next]');
        await form.click ('#save');
        assert.equal (form.posts ('/test').length, 1);
        assert.deepEqual (form.posts ('/save'), [], 'nothing is saved behind a failed test');
        assert.match (form.slot (), /The connection test failed — this account will probably not work\./);
        assert.ok (form.slot ().includes ('(<b>bad key</b>)'), 'the exchange\'s words are shown as text');
        assert.ok (document.querySelector ('section.step:not([hidden]) .slot b') === null);
        const buttons: any[] = Array.from (document.querySelectorAll ('section.step:not([hidden]) .slot button'));
        assert.deepEqual (buttons.map ((button) => button.textContent), [ 'Go back and fix the key', 'Save anyway' ]);
        buttons[1].click ();
        await form.settle ();
        assert.equal (form.posts ('/save').length, 1);
        assert.equal (document.getElementById ('done-view').hidden, false);
    } finally {
        await form.close ();
    }
});

test ('setup page: an existing account is only replaced after "Replace it"; a refused save says why', { 'skip': DOM_SKIP }, async () => {
    let refuse: [ number, Record<string, any> ] = [ 409, { 'ok': false, 'code': 'ACCOUNT_EXISTS', 'error': 'an account named "practice" already exists' } ];
    const form = await open ('setup.html', wizardBoot (), {
        '/save': (call) => (call.body.replace === true) ? [ 200, { 'ok': true, 'account': 'practice', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': false, 'replaced': true } ] : refuse,
    });
    try {
        const document = form.document;
        await toKeys (form);
        await form.click ('[data-next]');
        await form.click ('[data-next]');
        await form.click ('#save');
        assert.equal (form.posts ('/save').length, 1);
        assert.equal (form.posts ('/save')[0].body.replace, undefined, 'the first save never asks to replace');
        assert.match (form.slot (), /An account named “practice” already exists\./);
        assert.equal (document.getElementById ('done-view').hidden, true);
        refuse = [ 400, { 'ok': false, 'code': 'INVALID_ACCOUNT', 'error': 'the keys look wrong' } ];
        const choices: any[] = Array.from (document.querySelectorAll ('section.step:not([hidden]) .slot button'));
        assert.deepEqual (choices.map ((button) => button.textContent), [ 'Replace it', 'Choose another name' ]);
        choices[0].click ();
        await form.settle ();
        assert.equal (form.posts ('/save').length, 2);
        assert.equal (form.posts ('/save')[1].body.replace, true);
        assert.equal (document.getElementById ('done-view').hidden, false);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: a name the settings file cannot hold is refused before anything is sent', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ());
    try {
        await toKeys (form);
        await form.click ('[data-next]');
        await form.click ('[data-next]');
        for (const [ name, message ] of [ [ '__proto__', '“__proto__” cannot be used as an account name. Choose a different one.' ], [ 'has space', 'Give the account a short name: letters, digits, “-” and “_” only.' ], [ '', 'Give the account a short name: letters, digits, “-” and “_” only.' ] ]) {
            form.type ('#account', name);
            await form.click ('#save');
            assert.equal (form.slot (), message);
            assert.equal (form.document.activeElement.id, 'account');
        }
        assert.deepEqual (form.calls.filter ((call) => call.method === 'POST'), []);
    } finally {
        await form.close ();
    }
});

test ('setup page: a 404 from the server (session over) ends the form and wipes the typed keys', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot (), { '/test': () => [ 404, {} ] });
    try {
        const document = form.document;
        await toKeys (form);
        await form.click ('[data-next]');
        await form.click ('[data-next]');
        await form.click ('#test');
        assert.equal (document.getElementById ('gone-view').hidden, false);
        assert.equal (document.getElementById ('form-view').hidden, true);
        assert.equal (document.getElementById ('done-view').hidden, true);
        assert.equal (document.activeElement.id, 'gone-title');
        assert.deepEqual (Array.from (document.querySelectorAll ('#fields input')).map ((input: any) => input.value), [ '', '' ]);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('setup page: replacing a key — the name is fixed, the save says replace, and the way back is the accounts page', { 'skip': DOM_SKIP }, async () => {
    const boot = wizardBoot ({ 'page': 'accounts', 'prefill': { 'exchange': 'fakex', 'account': 'savings', 'environment': 'live' }, 'replace': { 'prediction': false, 'trading': true, 'maxOrderValue': 40 } });
    const form = await open ('setup.html', boot, {
        '/save': () => [ 200, { 'ok': true, 'returnTo': 'accounts', 'account': 'savings', 'exchange': 'fakex', 'environment': 'live', 'trading': 'live', 'replaced': true } ],
    }, BASE + '/wizard');
    try {
        const document = form.document;
        assert.equal (form.heading (), 'Replace the key of “savings”');
        assert.equal (document.getElementById ('account').readOnly, true);
        assert.equal (document.getElementById ('cap').value, '40');
        assert.equal (document.querySelector ('input[name="may"]:checked').value, 'trade');
        assert.equal (document.querySelector ('section.step:not([hidden]) a.back').getAttribute ('href'), BASE, 'Cancel goes back to the list');
        await toKeys (form);
        await form.click ('[data-next]');
        // the permission carried over, the confirmation never does
        assert.equal (document.getElementById ('live-confirm').checked, false);
        await form.click ('[data-next]');
        assert.equal (form.heading (), 'What the assistant may do');
        document.getElementById ('live-confirm').click ();
        await form.click ('[data-next]');
        await form.click ('#save');
        assert.deepEqual (form.posts ('/save')[0].body, { 'name': 'savings', 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'live', 'trading': true, 'maxOrderValue': 40, 'liveConfirmed': true, 'replace': true });
        assert.equal (document.getElementById ('done-title').textContent, 'Saved');
        assert.equal (document.getElementById ('done-back').getAttribute ('href'), BASE);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

const HOSTILE = '<img src=x onerror="window.pwned=1">';

function accountsBoot (accounts: Record<string, any>[]): Record<string, any> {
    return { 'csrf': 'c'.repeat (32), 'configPath': '/home/someone/.config/ccxt-mcp/config.json', 'expiresInMs': 600000, accounts, 'fileProblem': undefined };
}

function account (overrides: Record<string, any> = {}): Record<string, any> {
    return {
        'name': 'savings', 'exchange': 'fakex', 'exchangeName': 'FakeX', 'prediction': false, 'environment': 'live', 'sandboxIsDemo': false, 'trading': false,
        'funds': false, 'implicitWrites': false, 'credentials': [ 'API key', 'API secret' ], 'keyEnding': '7Q2x', 'source': 'file', 'loaded': true,
        'canRemove': true, 'canEditPermissions': true, 'canReplace': true,
        ...overrides,
    };
}

const cardOf = (form: Form, name: string): any => Array.from (form.document.querySelectorAll ('section.card')).find ((card: any) => card.querySelector ('h2').textContent === name);
const buttonIn = (node: any, label: string): any => Array.from (node.querySelectorAll ('button, a')).find ((button: any) => button.textContent === label);

test ('accounts page: lists the accounts as text, with only the actions each one allows', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('accounts.html', accountsBoot ([
        account (),
        account ({ 'name': HOSTILE, 'exchangeName': HOSTILE, 'environment': 'sandbox', 'keyEnding': undefined }),
        account ({ 'name': 'from-env', 'source': 'environment', 'environment': 'sandbox', 'trading': true, 'canRemove': false, 'canEditPermissions': false, 'canReplace': false }),
    ]));
    try {
        const document = form.document;
        assert.equal (document.querySelector ('h1').textContent, 'Your accounts');
        assert.equal (document.querySelectorAll ('section.card').length, 3);
        assert.equal (form.window.pwned, undefined);
        assert.ok (document.querySelector ('img') === null, 'an account name is text, whatever it contains');
        assert.ok (cardOf (form, HOSTILE), 'and is shown as it is');
        const savings = cardOf (form, 'savings');
        assert.ok (savings.textContent.includes ('••••7Q2x'));
        assert.ok (savings.textContent.includes ('LIVE'));
        assert.ok (buttonIn (savings, 'Change permissions') && buttonIn (savings, 'Remove'));
        assert.equal (buttonIn (savings, 'Replace key').getAttribute ('href'), BASE + '/wizard?account=savings');
        const fromEnv = cardOf (form, 'from-env');
        assert.ok (fromEnv.textContent.includes ('TESTNET'));
        assert.equal (fromEnv.querySelectorAll ('button').length, 0, 'an account from the environment cannot be changed here');
        assert.equal (document.getElementById ('add').getAttribute ('href'), BASE + '/wizard');
        assert.equal (form.calls.length, 0, 'showing the list asks the server nothing');
        assert.doesNotMatch (document.getElementById ('cards').textContent, /undefined|NaN|\[object /);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('accounts page: Remove asks first; nothing is sent before "Yes, remove it"', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('accounts.html', accountsBoot ([ account (), account ({ 'name': 'other' }) ]), {
        '/remove': () => [ 200, { 'ok': true, 'removed': 'savings', 'stoppedStreams': 1, 'returnsOnRestart': false, 'accounts': [ account ({ 'name': 'other' }) ] } ],
    });
    try {
        const document = form.document;
        buttonIn (cardOf (form, 'savings'), 'Remove').click ();
        await form.settle ();
        assert.equal (document.activeElement.textContent, 'Remove “savings”?');
        assert.equal (form.calls.length, 0);
        // the harmless answer closes the panel and sends nothing
        buttonIn (cardOf (form, 'savings'), 'Keep it').click ();
        await form.settle ();
        assert.ok (document.querySelector ('.panel') === null);
        assert.equal (form.calls.length, 0);
        buttonIn (cardOf (form, 'savings'), 'Remove').click ();
        await form.settle ();
        buttonIn (cardOf (form, 'savings'), 'Yes, remove it').click ();
        await form.settle ();
        assert.deepEqual (form.calls, [ { 'method': 'POST', 'path': '/remove', 'headers': { 'Content-Type': 'application/json', 'X-Setup-Nonce': 'c'.repeat (32) }, 'body': { 'name': 'savings', 'confirm': true } } ]);
        assert.deepEqual (Array.from (document.querySelectorAll ('section.card h2')).map ((heading: any) => heading.textContent), [ 'other' ]);
        assert.match (document.getElementById ('message').textContent, /^Removed “savings”\./);
        assert.match (document.getElementById ('message').textContent, /One live data stream that used it was stopped\./);
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('accounts page: allowing orders on a live account needs the cap and the tick; switching off needs neither', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('accounts.html', accountsBoot ([ account () ]), {
        '/permissions': (call) => [ 200, { 'ok': true, 'account': 'savings', 'trading': call.body.trading ? 'live' : false, 'toolsAdded': false, 'restartForTools': false, 'accounts': [ account ({ 'trading': call.body.trading ? 'live' : false, 'maxOrderValue': call.body.maxOrderValue }) ] } ],
    });
    try {
        const openPanel = async () => {
            buttonIn (cardOf (form, 'savings'), 'Change permissions').click ();
            await form.settle ();
            return cardOf (form, 'savings');
        };
        const pick = (card: any, label: string) => {
            const option: any = Array.from (card.querySelectorAll ('label')).find ((node: any) => node.textContent.includes (label));
            const input = option.querySelector ('input');
            input.checked = true;
            input.dispatchEvent (new form.window.Event ('change', { 'bubbles': true }));
            input.dispatchEvent (new form.window.Event ('input', { 'bubbles': true }));
        };
        let card = await openPanel ();
        pick (card, 'Allow placing orders');
        buttonIn (card, 'Save this change').click ();
        await form.settle ();
        assert.match (card.textContent, /Tick the box/);
        assert.equal (form.calls.length, 0, 'no tick, no request');
        card.querySelector ('input[type="checkbox"]').click ();
        const cap = card.querySelector ('#cap-input');
        cap.value = '0';
        buttonIn (card, 'Save this change').click ();
        await form.settle ();
        assert.equal (form.calls.length, 0, 'no cap above zero, no request');
        cap.value = '40';
        buttonIn (card, 'Save this change').click ();
        await form.settle ();
        assert.deepEqual (form.calls.map ((call) => call.body), [ { 'name': 'savings', 'trading': true, 'maxOrderValue': 40, 'liveConfirmed': true } ]);
        assert.match (cardOf (form, 'savings').textContent, /up to 40 USD each/);
        // and off again: one press, no confirmation
        card = await openPanel ();
        pick (card, 'View only');
        buttonIn (card, 'Save this change').click ();
        await form.settle ();
        assert.deepEqual (form.calls[1].body, { 'name': 'savings', 'trading': false });
        assert.deepEqual (form.errors, []);
    } finally {
        await form.close ();
    }
});

test ('accounts page: Done closes the session; a session that is over shows the "no longer active" view', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('accounts.html', accountsBoot ([ account () ]));
    try {
        form.document.getElementById ('done').click ();
        await form.settle ();
        assert.deepEqual (form.calls.map ((call) => [ call.method, call.path, call.body ]), [ [ 'POST', '/close', {} ] ]);
        assert.equal (form.document.getElementById ('done-view').hidden, false);
        assert.equal (form.document.getElementById ('list-view').hidden, true);
        assert.equal (form.document.activeElement.id, 'done-title');
    } finally {
        await form.close ();
    }
    const gone = await open ('accounts.html', accountsBoot ([ account () ]), { '/close': () => [ 404, {} ] });
    try {
        gone.document.getElementById ('done').click ();
        await gone.settle ();
        assert.equal (gone.document.getElementById ('gone-view').hidden, false);
        assert.equal (gone.document.getElementById ('done-view').hidden, true);
        assert.deepEqual (gone.errors, []);
    } finally {
        await gone.close ();
    }
});

test ('account pages: the countdown ends the page when the session\'s time is up', { 'skip': DOM_SKIP }, async () => {
    const form = await open ('setup.html', wizardBoot ({ 'expiresInMs': 0 }));
    try {
        assert.equal (form.document.getElementById ('gone-view').hidden, false);
        assert.equal (form.document.getElementById ('form-view').hidden, true);
    } finally {
        await form.close ();
    }
    const list = await open ('accounts.html', { ...accountsBoot ([ account () ]), 'expiresInMs': 0 });
    try {
        assert.equal (list.document.getElementById ('gone-view').hidden, false);
        assert.equal (list.document.getElementById ('list-view').hidden, true);
    } finally {
        await list.close ();
    }
});
