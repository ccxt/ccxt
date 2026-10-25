import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { bootstrapImplicitApiAbstracts } from '../bootstrap-implicit-api.mjs';

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ccxt-implicit-bootstrap-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const write = (name, source) => {
        const file = path.join(root, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, source);
    };
    write('package.json', '{"type":"module"}');
    write('ts/src/base/Exchange.ts', 'export class Exchange {}');
    write('ts/src/base/PredictionExchange.ts', 'export default class PredictionExchange {}');
    return { root, write };
}

function inferredParent(root, name) {
    const source = pathToFileURL(path.join(root, 'ts/src', name + '.ts')).href;
    const script = `const { default: Venue } = await import(${JSON.stringify(source)}); console.log(Object.getPrototypeOf(Object.getPrototypeOf(new Venue())).constructor.name);`;
    return execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', script], { encoding: 'utf8' }).trim();
}

test('a clean root exchange loads and retains the emitter parent identity', t => {
    const { root, write } = fixture(t);
    write('ts/src/newvenue.ts', "import Exchange from './abstract/newvenue.js'; export default class newvenue extends Exchange {}");
    bootstrapImplicitApiAbstracts(root, { ids: ['newvenue'] });
    assert.equal(inferredParent(root, 'newvenue'), 'Exchange');
});

test('derived REST, detached WebSocket and prediction parents are preserved', t => {
    const { root, write } = fixture(t);
    write('ts/src/venuebase.ts', 'export default class venuebase {}');
    write('ts/src/derived.ts', "import venuebase from './abstract/derived.js'; export default class derived extends venuebase {}");
    write('ts/src/pro/venuebase.ts', 'export default class venuebase {}');
    write('ts/src/pro/derived.ts', "import venuebase from '../abstract/pro/derived.js'; export default class derived extends venuebase {}");
    write('ts/src/prediction/eventvenue.ts', "import Exchange from '../abstract/prediction/eventvenue.js'; export default class eventvenue extends Exchange {}");
    bootstrapImplicitApiAbstracts(root, { ids: ['derived'], ws: ['derived'], prediction: ['eventvenue'] });
    assert.equal(inferredParent(root, 'derived'), 'venuebase');
    assert.equal(inferredParent(root, 'pro/derived'), 'venuebase');
    assert.equal(inferredParent(root, 'prediction/eventvenue'), 'Exchange');
});

test('existing abstracts are untouched and ordinary WebSocket inheritance needs no stub', t => {
    const { root, write } = fixture(t);
    const existing = '/* existing generated endpoints must be preserved byte for byte */\n';
    write('ts/src/newvenue.ts', "import Exchange from './abstract/newvenue.js'; export default class newvenue extends Exchange {}");
    write('ts/src/abstract/newvenue.ts', existing);
    write('ts/src/pro/newvenue.ts', "import newvenueRest from '../newvenue.js'; export default class newvenue extends newvenueRest {}");
    bootstrapImplicitApiAbstracts(root, { ids: ['newvenue'], ws: ['newvenue'] });
    assert.equal(fs.readFileSync(path.join(root, 'ts/src/abstract/newvenue.ts'), 'utf8'), existing);
    assert.equal(fs.existsSync(path.join(root, 'ts/src/abstract/pro/newvenue.ts')), false);
});

test('unknown bindings fail before writing any stubs', t => {
    const { root, write } = fixture(t);
    write('ts/src/newvenue.ts', "import Exchange from './abstract/newvenue.js'; export default class newvenue extends Exchange {}");
    write('ts/src/broken.ts', "import Other from './abstract/broken.js'; export default class broken extends Missing {}");
    assert.throws(() => bootstrapImplicitApiAbstracts(root, { ids: ['newvenue', 'broken'] }), /parent binding/);
    assert.equal(fs.existsSync(path.join(root, 'ts/src/abstract/newvenue.ts')), false);
    assert.equal(fs.existsSync(path.join(root, 'ts/src/abstract/broken.ts')), false);
});

test('unknown and self-referential parents fail without inventing a base class', t => {
    const { root, write } = fixture(t);
    write('ts/src/unknown.ts', "import Missing from './abstract/unknown.js'; export default class unknown extends Missing {}");
    write('ts/src/cycle.ts', "import cycle from './abstract/cycle.js'; export default class cycle extends cycle {}");
    assert.throws(() => bootstrapImplicitApiAbstracts(root, { ids: ['unknown'] }), /parent Missing/);
    assert.throws(() => bootstrapImplicitApiAbstracts(root, { ids: ['cycle'] }), /parent cycle/);
});
