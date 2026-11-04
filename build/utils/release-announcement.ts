import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const releaseHeadingPattern = /^# \[([^\]]+)\]\((https:\/\/github\.com\/ccxt\/ccxt\/releases\/tag\/[^)]+)\) - (.+)$/gm;
const releaseDatePattern = /\d{4}-\d{2}-\d{2}/;
const changePattern = /^[*-]\s+(.+?) by \[@([^\]]+)\]\([^)]+\) in \[#\d+\]\((https:\/\/github\.com\/ccxt\/ccxt\/pull\/\d+)\)$/;
const relevantChangePattern = /^(feat|fix)(?:\(([^)]+)\)|\s+([^:]+))?!?:\s*(.+)$/i;
// housekeeping commits are never announcement-worthy — excluded explicitly so they stay
// out even if the relevant-change whitelist above is ever widened
const excludedChangePattern = /^(chore|docs)(?:\([^)]*\))?!?:/i;
const discordSuppressEmbeds = 1 << 2;

export interface HttpRequestOptions {
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
}

interface HttpResponse {
    ok: boolean;
    status: number;
}

type FetchImplementation = (url: string, options: HttpRequestOptions) => Promise<HttpResponse>;

type AnnouncementEnvironment = Record<string, string | undefined>;

interface PublishOptions {
    env?: AnnouncementEnvironment;
    fetchImpl?: FetchImplementation;
}

interface Highlight {
    text: string;
    priority: boolean;
    order: number;
}

interface ReleaseSection {
    tag: string;
    url: string;
    date: string;
    body: string;
    order: number;
}

function parseReleaseSections (changelog: string): ReleaseSection[] {
    const sections: ReleaseSection[] = [];
    releaseHeadingPattern.lastIndex = 0;
    for (const heading of changelog.matchAll(releaseHeadingPattern)) {
        const bodyStart = (heading.index ?? 0) + heading[0].length;
        const nextReleaseIndex = changelog.indexOf('\n<a id="', bodyStart);
        sections.push({
            tag: heading[1],
            url: heading[2],
            date: releaseDatePattern.exec(heading[3])?.[0] ?? '',
            body: changelog.slice(bodyStart, (nextReleaseIndex === -1) ? undefined : nextReleaseIndex),
            order: sections.length,
        });
    }
    return sections;
}

function normalizeVersion (value: string): string {
    return value.trim().replace(/^v/i, '');
}

// CHANGELOG.md is NOT reliably ordered newest-first. changelog-from-release renders releases
// in GitHub API order and includes drafts (its -d flag defaults to true), and the API returns
// drafts ahead of published releases. cleanup-old-tags prunes old version tags, and GitHub
// turns a release whose tag disappeared into a draft - which is how the 2023 4.0.3 release
// ended up at the top of the file and got announced as if it were the latest release.
// Never trust file position: announce the release we were asked to announce.
function selectRelease (sections: ReleaseSection[], version?: string): ReleaseSection {
    if (sections.length === 0) {
        throw new Error('Could not find any CCXT release heading in CHANGELOG.md');
    }
    if (version !== undefined) {
        const wanted = normalizeVersion(version);
        const requested = sections.find(section => normalizeVersion(section.tag) === wanted);
        if (requested === undefined) {
            throw new Error(`CHANGELOG.md has no section for release ${version}, refusing to announce a different release`);
        }
        return requested;
    }
    // Dates are ISO, so a plain string compare orders them. A section whose date we could not
    // read sorts last rather than winning by accident, and file order breaks ties: within one
    // date changelog-from-release still emits the newest release first.
    return [ ...sections ].sort((first, second) => {
        if (first.date !== second.date) {
            return (first.date < second.date) ? 1 : -1;
        }
        return first.order - second.order;
    })[0];
}

export function createReleaseAnnouncement (changelog: string, version?: string): string {
    const normalizedChangelog = changelog.replaceAll('\r\n', '\n');
    const release = selectRelease(parseReleaseSections(normalizedChangelog), version);
    const updates: Highlight[] = [];
    for (const line of release.body.split('\n')) {
        const change = changePattern.exec(line);
        if (change === null) {
            continue;
        }
        if (/\bdelist(?:ed|ing)?\b/i.test(change[1])) {
            continue;
        }
        if (excludedChangePattern.test(change[1])) {
            continue;
        }
        const relevantChange = relevantChangePattern.exec(change[1]);
        const isNewExchange = /^New exchange:/i.test(change[1]);
        if (relevantChange === null && !isNewExchange) {
            continue;
        }
        const scope = relevantChange?.[2] ?? relevantChange?.[3];
        const body = relevantChange?.[4];
        const title = isNewExchange ? change[1] : ((scope === undefined) ? body : `${scope}: ${body}`);
        updates.push({
            text: `- ${title} by @${change[2]} in ${change[3]}`,
            priority: /\b(add|fix|new)\b/i.test(change[1]),
            order: updates.length,
        });
    }
    const tag = release.tag;
    const releaseUrl = release.url;
    const releasedVersion = normalizeVersion(tag);
    const introduction = `📘 ${releasedVersion} released!

Upgrade now to take advantage of:

🔧 Updates & Fixes:`;
    const conclusion = `Upgrade to ${tag} and enhance your trading experience today!`;
    const selectedUpdates = [ ...updates ]
        .sort((first, second) => Number(second.priority) - Number(first.priority) || first.order - second.order)
        .slice(0, 20)
        .map(update => update.text);
    // A release can legitimately carry nothing announcement-worthy (a CI-only or chore-only
    // release). Point readers at the release notes rather than posting an empty bullet list.
    if (selectedUpdates.length === 0) {
        return `${introduction}\n\n- Maintenance release, see the full release notes: ${releaseUrl}\n\n${conclusion}`;
    }
    let omitted = updates.length - selectedUpdates.length;
    let message = '';
    do {
        const omission = (omitted === 0) ? '' : `\n- … and ${omitted} more updates: ${releaseUrl}`;
        message = `${introduction}\n\n${selectedUpdates.join('\n')}${omission}\n\n${conclusion}`;
        if (message.length <= 1900) {
            return message;
        }
        selectedUpdates.pop();
        omitted++;
    } while (selectedUpdates.length > 0);
    throw new Error('Could not fit the CCXT release announcement within the message limit');
}

async function postJson (platform: string, url: string, body: object, fetchImpl: FetchImplementation): Promise<void> {
    const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`${platform} rejected the release announcement with HTTP ${response.status}`);
    }
}

async function validateCredential (platform: string, url: string, fetchImpl: FetchImplementation): Promise<void> {
    let response: HttpResponse;
    try {
        response = await fetchImpl(url, { method: 'GET' });
    } catch {
        throw new Error(`${platform} credential validation request failed`);
    }
    if (!response.ok) {
        throw new Error(`${platform} credential validation failed with HTTP ${response.status}`);
    }
}

function escapeTelegramMarkdown (text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function formatTelegramMessage (message: string): string {
    const boldSegments: string[] = [];
    const withPlaceholders = message.replace(/\*\*([^*\n]+)\*\*/g, (_match, text: string) => {
        boldSegments.push(text);
        return `TELEGRAMBOLD${boldSegments.length - 1}TOKEN`;
    });
    let formattedMessage = escapeTelegramMarkdown(withPlaceholders);
    for (let index = 0; index < boldSegments.length; index++) {
        formattedMessage = formattedMessage.replaceAll(`TELEGRAMBOLD${index}TOKEN`, `*${escapeTelegramMarkdown(boldSegments[index])}*`);
    }
    return formattedMessage;
}

export async function publishReleaseAnnouncement (message: string, options: PublishOptions = {}): Promise<void> {
    const env = options.env ?? process.env;
    const fetchImpl: FetchImplementation = options.fetchImpl ?? (async (url, requestOptions) => fetch(url, requestOptions));
    const requiredVariables = [ 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'DISCORD_WEBHOOK_URL' ];
    const missingVariables = requiredVariables.filter(variable => !env[variable]);
    if (missingVariables.length > 0) {
        throw new Error(`Missing release announcement environment variables: ${missingVariables.join(', ')}`);
    }
    const validationResults = await Promise.allSettled([
        validateCredential('Telegram', `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getMe`, fetchImpl),
        validateCredential('Discord', env.DISCORD_WEBHOOK_URL as string, fetchImpl),
    ]);
    const validationErrors = validationResults
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => (result.reason instanceof Error) ? result.reason.message : String(result.reason));
    if (validationErrors.length > 0) {
        throw new Error(`Release announcement credential validation failed: ${validationErrors.join('; ')}`);
    }
    const results = await Promise.allSettled([
        postJson('Telegram', `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: env.TELEGRAM_CHAT_ID,
            link_preview_options: {
                is_disabled: true,
            },
            parse_mode: 'MarkdownV2',
            text: formatTelegramMessage(message),
        }, fetchImpl),
        postJson('Discord', env.DISCORD_WEBHOOK_URL as string, {
            content: message,
            flags: discordSuppressEmbeds,
        }, fetchImpl),
    ]);
    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => (result.reason instanceof Error) ? result.reason.message : String(result.reason));
    if (errors.length > 0) {
        throw new Error(`Release announcement delivery failed: ${errors.join('; ')}`);
    }
}

function readOption (name: string): string | undefined {
    const index = process.argv.indexOf(name);
    if (index === -1) {
        return undefined;
    }
    const value = process.argv[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`The ${name} option requires a value`);
    }
    return value;
}

async function main (): Promise<void> {
    const changelogPath = readOption('--changelog') ?? 'CHANGELOG.md';
    // The release workflow passes the version it just published. Without it we fall back to the
    // newest-dated section, which is still safer than trusting the order of the file.
    const version = readOption('--version');
    const changelog = await readFile(changelogPath, 'utf8');
    const message = createReleaseAnnouncement(changelog, version);
    console.log(message);
    const dryRun = process.argv.includes('--dry') || process.argv.includes('--dry-run');
    if (!dryRun) {
        await publishReleaseAnnouncement(message);
        console.log('Release announcement posted to Telegram and Discord.');
    }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    main().catch((error: Error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
