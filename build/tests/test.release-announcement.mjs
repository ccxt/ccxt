import assert from 'node:assert/strict';
import test from 'node:test';

const { createReleaseAnnouncement } = await import('../utils/release-announcement.ts');

function section (tag, date, body) {
    return `<a id="${tag}"></a>\n# [${tag}](https://github.com/ccxt/ccxt/releases/tag/${tag}) - ${date}\n\n${body}\n\n[Changes][${tag}]\n\n\n`;
}

function change (title, author, number) {
    return `* ${title} by [@${author}](https://github.com/${author}) in [#${number}](https://github.com/ccxt/ccxt/pull/${number})`;
}

// The 2023 4.0.3 release lost its tag to cleanup-old-tags, GitHub demoted it to a draft, and
// the GitHub API returns drafts first - so it leads CHANGELOG.md despite being the oldest
// release in the file, and its body is prose with no pull request lines at all.
const staleDraft = section('4.0.3', '2023-07-01', 'We are happy to announce the release of CCXT version 4!\n\n* the merge of CCXT Pro Websocket APIs with the master repository of CCXT');
const newest = section('v4.5.82', '2026-09-21', [
    "## What's Changed",
    change('fix(bingx): preserve public swap trade fill IDs', 'AresArtemius', 30554),
    change('feat(krakenfutures): add fetchPositionsHistory', 'rayBastard', 30503),
    change('chore: update gitattributes', 'carlosmiei', 30549),
].join('\n'));
const previous = section('v4.5.81', '2026-09-19', [
    "## What's Changed",
    change('fix(gate): sort the signed query string', 'joe-alphafox', 30562),
].join('\n'));

test('announces the requested release, not whatever section leads the file', () => {
    const message = createReleaseAnnouncement(staleDraft + newest + previous, '4.5.82');
    assert.match(message, /^📘 4\.5\.82 released!/);
    assert.match(message, /Upgrade to v4\.5\.82 and enhance/);
    assert.doesNotMatch(message, /4\.0\.3/);
    assert.match(message, /bingx: preserve public swap trade fill IDs by @AresArtemius/);
    assert.match(message, /krakenfutures: add fetchPositionsHistory by @rayBastard/);
    // chore: entries stay out of the announcement
    assert.doesNotMatch(message, /gitattributes/);
});

test('without a version, falls back to the newest release by date rather than file order', () => {
    const message = createReleaseAnnouncement(staleDraft + newest + previous);
    assert.match(message, /^📘 4\.5\.82 released!/);
    assert.doesNotMatch(message, /4\.0\.3/);
});

test('same-date releases fall back to file order, which is newest first', () => {
    const sameDay = section('v4.5.80', '2026-09-19', "## What's Changed\n" + change('fix(okx): parse funding rate', 'someone', 1));
    const message = createReleaseAnnouncement(staleDraft + previous + sameDay);
    assert.match(message, /^📘 4\.5\.81 released!/);
});

test('selects an older release when explicitly asked for one', () => {
    const message = createReleaseAnnouncement(staleDraft + newest + previous, 'v4.5.81');
    assert.match(message, /^📘 4\.5\.81 released!/);
    assert.match(message, /gate: sort the signed query string/);
});

test('matches the tag with or without the v prefix', () => {
    assert.match(createReleaseAnnouncement(newest, 'v4.5.82'), /^📘 4\.5\.82 released!/);
    assert.match(createReleaseAnnouncement(staleDraft, '4.0.3'), /^📘 4\.0\.3 released!/);
});

test('refuses to announce a different release when the requested one is missing', () => {
    assert.throws(
        () => createReleaseAnnouncement(staleDraft + newest, '4.5.99'),
        /no section for release 4\.5\.99/,
    );
});

test('throws when the changelog holds no release sections', () => {
    assert.throws(() => createReleaseAnnouncement('# Changelog\n\nnothing here\n'), /Could not find any CCXT release heading/);
});

test('a release with nothing announcement-worthy links the notes instead of an empty list', () => {
    const choreOnly = section('v4.5.81', '2026-09-19', "## What's Changed\n" + change('ci(release): publish to PyPI without Docker', 'carlotestor', 30542));
    const message = createReleaseAnnouncement(choreOnly, '4.5.81');
    assert.match(message, /^📘 4\.5\.81 released!/);
    assert.match(message, /Maintenance release, see the full release notes: https:\/\/github\.com\/ccxt\/ccxt\/releases\/tag\/v4\.5\.81/);
    assert.doesNotMatch(message, /Fixes:\n\n\n/);
});

test('keeps the message inside the Telegram and Discord length limit', () => {
    const many = [ "## What's Changed" ];
    for (let i = 0; i < 120; i++) {
        many.push(change(`fix(exchange${i}): correct a very long description of the parsing problem`, 'contributor', 30000 + i));
    }
    const message = createReleaseAnnouncement(section('v4.5.82', '2026-09-21', many.join('\n')), '4.5.82');
    assert.ok(message.length <= 1900, `message length ${message.length}`);
    assert.match(message, /and \d+ more updates: https:\/\/github\.com\/ccxt\/ccxt\/releases\/tag\/v4\.5\.82/);
});
