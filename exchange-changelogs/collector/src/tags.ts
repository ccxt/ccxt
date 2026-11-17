// Deterministic rule tags. Each tag fires when any of its patterns matches the entry
// title or body (case-insensitive). Keep the list short and obvious; it drives the impact
// chips on docs.ccxt.com and is not meant to be a classifier. spec/tags-golden.spec.ts holds
// judged entries with a precision floor for 'breaking' and 'deprecation'.
//
// Rules:
//   - one regex per tag in TAG_RULES, tested against "title\nbody";
//   - 'breaking', 'deprecation' and 'auth' are tested after their NEGATIONS are blanked out, so
//     "No removed endpoints", "no breaking changes", "non-breaking", "is not removed",
//     "will not be deprecated", "no signature required", "without an API key" do not fire them
//     (a later un-negated "X was removed" still does);
//   - label lines answered "No" ("Breaking Changes: No", "Deprecations: No") are blanked out too;
//   - 'no longer' is not a negation, and it is breaking only next to a verb that takes something
//     away ("no longer supported/accepted/returned/available/works/pushes ..."): "no longer
//     required/necessary/mandatory" is a relaxation, "no longer sits at the top level" or "no
//     longer counts toward depth" describe behaviour;
//   - removals are breaking when they name an API object ("removed the `foo` field", "Remove
//     Launch APIs ... endpoints", "`bar` was removed", a "### Removed" section): "that statement was
//     incorrect and is removed" or "Removed API Key permission requirements from the docs" are not;
//   - removals whose sentence names a requirement, restriction or limit ("the rate limit on X
//     has been removed") relax something and are not breaking (RELAXED);
//   - WEAK_BREAKING signals ("will be changed", "no longer supported", "will fail") are dropped
//     when the entry says the change is harmless ("No action required", "will not affect your
//     existing API calls", "Breaking Changes: No"), or when the same sentence does ("backward
//     compatible", "No action needed to stay on v1"); an explicit "breaking change" or a named
//     removal is not.

// "no longer" + up to two words + a verb that takes something away
const NO_LONGER = String.raw`\bno\s+longer\s+(?:[\w-]+\s+){0,2}?(?:supported|support(?:s|ing)?|accept(?:ed|s|ing)?|return(?:ed|s|ing)?|available|accessible|work(?:s|ing)?|function(?:s|al|ing)?|valid|usable|processed|push(?:ed|es)?|emit(?:s|ted)?|sen(?:d|ds|t)|include[ds]?|provide[ds]?|expose[ds]?|allow(?:ed|s)?|offered|served|maintained|populated|exists?|appears?|possible|able|contain(?:s|ed)?|default(?:s|ed)?|carr(?:y|ies|ied))\b`;
// API objects a removal must name to count as breaking ("api" but not "API key", "support for" but
// not "reaching out to support", "field" but not "field description")
const API_OBJECT = String.raw`(?:(?:endpoints?|fields?|flags?|channels?|parameters?|params?|interfaces?|apis?(?![\s-]*keys?)|methods?|routes?|paths?|urls?|topics?|streams?|propert(?:y|ies)|enums?|values?|subscriptions?|responses?|requests?|payloads?|messages?|versions?|types?|intervals?|statuses|status|attributes?|headers?|filters?|options?|events?|actions?|modes?|websockets?|sdk)(?!\s+descriptions?)|support\s+for)`;
// ... and, in front of "removed", "cookie-based authentication removed"
const REMOVED_OBJECT = String.raw`(?:\b${API_OBJECT}\b|\bauthentication\b|\x60[^\x60\n]{1,80}\x60|"[^"\n]{1,80}"|\b[a-z]\w*[/_]\w[\w/.]*)`;
// A removal whose sentence names a requirement, restriction or limit relaxes it ("The rate limit on
// the /orders endpoint has been removed", "The IP whitelist requirement for sub_account keys has been
// removed", "The 3 concurrent report restriction was removed for the reports endpoint").
const RELAXED = String.raw`(?<!\b(?:requirements?|restrictions?|constraints?|limitations?|whitelist(?:ing)?|allowlist(?:ing)?|(?:rate|request|order|position|concurrency)[\s-]+limits?|limits?\s+(?:on|of|for)|caps?\s+(?:on|of))\b[^.;\n]*)`;
const REMOVAL = [
    // "Removed the `foo` field", "Remove Launch APIs ... endpoints", "removal of the v1 channel"; not
    // the removal of a requirement, restriction or note ("remove authentication requirement from
    // public data endpoints" relaxes)
    String.raw`${RELAXED}\bremov(?:e|ed|es|als?(?:\s+of)?)\b(?:(?!requirements?\b|restrictions?\b|constraints?\b|limitations?\b|notes?\b|mentions?\b|statements?\b|wording\b|descriptions?\b)[^.;\n]){0,80}?\b${API_OBJECT}\b`,
    // "Removed `foo`", "- Remove `GET /api/v1/x`"
    String.raw`\bremov(?:e|ed|es)\b:?\s+(?:the\s+)?(?:deprecated\s+|legacy\s+|old\s+|undocumented\s+|unused\s+)?[\x60"]`,
    // "`foo` was removed", "the v1 endpoint has been removed", "subscription removed",
    // "public/get_assets is removed", "is set to be removed", "was deprecated and removed"
    String.raw`${REMOVED_OBJECT}[^.;]{0,50}?\b(?:be|been|was|were|is|are|being|gets?)\s+(?:[\w-]+\s+){0,2}?${RELAXED}removed\b`,
    String.raw`${REMOVED_OBJECT}\s+${RELAXED}removed\b`,
    // "We are removing travel rule fields from ..." (an object within three words)
    String.raw`\b(?:removing|deleting)\s+(?:the\s+)?(?:[\w\x60-]+\s+){0,3}?(?:fields?|endpoints?|parameters?|channels?|interfaces?)\b`,
    // "Removed: USDT-M Perp Futures" (a title label, like "New:" / "Update:")
    String.raw`^\s*(?:removed?|deleted?)\s*:`,
    // "### Removed", "## Removals", "**Removed:**"
    String.raw`^\s*(?:#{1,6}\s*|(?:\*\*|__))?(?:removed|removals?|deleted)(?:\*\*|__)?\s*:?\s*(?:\*\*|__)?\s*$`,
    String.raw`\[(?:remove|delete)d?\]`,
    // OKX "Offlined endpoints"
    String.raw`\bofflined\b|\boffline\s+(?:the\s+)?(?:following\s+)?(?:endpoints?|apis?|interfaces?)\b`,
].join ('|');

// Breaking signals that a "no action required" statement overrides.
export const WEAK_BREAKING = new RegExp ([
    NO_LONGER,
    String.raw`will\s+be\s+changed`,
    String.raw`\b(?:will|now)\s+fail\b`,
    String.raw`\b(?:will\s+be|are\s+now|is\s+now)\s+rejected\b`,
    String.raw`will\s+result\s+in\s+(?:an?\s+)?errors?\b`,
    String.raw`\bstop(?:s|ped)?\s+supporting\b`,
].join ('|'), 'im');

// "breaking", a named removal, "incompatible": not overridden by a reassurance.
export const STRONG_BREAKING = new RegExp ([
    String.raw`breaking`,
    REMOVAL,
    String.raw`incompatib`,
    // Korean / Japanese / Chinese: "removed", "abolished"
    String.raw`삭제(?:됩니다|될\s*예정|되었습니다)|폐지|廃止|删除(?:了)?(?:接口|字段|参数)`,
].join ('|'), 'im');

// Entry-wide reassurances: "No action required", "will not affect your existing API calls", "no
// behaviour change", "existing integrations keep working". A qualified "No action needed to stay on
// v1" is about one option, so it is LOCAL_REASSURANCE.
export const REASSURANCE = /\bno\s+action\s+(?:is\s+)?(?:required|needed)\b(?!\s+(?:to|for|if|when|unless|until)\b)|\b(?:will|does|do|should)\s+not\s+(?:be\s+)?affect(?:ed)?\s+(?:your\s+|any\s+)?existing|\bno\s+(?:api\s+)?behaviou?r\s+changes?\b|\bexisting\s+(?:consumers|clients|integrations)\s+keep\s+working\b/i;
// Reassurances about one statement: "Schema 2:1 is a backward compatible update", "No action needed
// to stay on v1". They cancel weak signals in the same sentence only.
export const LOCAL_REASSURANCE = /\bbackwards?[\s-]+compatible\b|\bno\s+action\s+(?:is\s+)?(?:required|needed)\b/i;
// "**Breaking Changes:** No": the author says so for the whole entry
const NO_BREAKING_LABEL = /\bbreaking(?:[\s-]+changes?)?\s*(?:\*\*|__)?\s*:\s*(?:\*\*|__)?\s*(?:no|none|n\/a)\b/i;

export const TAG_RULES: Record<string, RegExp> = {
    'deprecation': /deprecat|sunset|decommission|discontinu|\bretire|will be removed|end of support|end-of-life|\beol\b|(?<!거래\s?)지원\s*종료|(?:서비스|API)\s*종료|폐지|廃止|(?:提供|サポート|サービス|配信)\s*(?:を)?終了|下线|停止(?:支持|服务|提供|使用|更新)|废弃|弃用/i,
    'breaking': STRONG_BREAKING,    // + WEAK_BREAKING unless REASSURANCE (see ruleTags)
    'new-endpoint': /new endpoints?|added? (?:a |an |the )?(?:new )?[\w /-]{0,40}endpoints?|new api|new interface|launch(?:ed)? .{0,40}\bapi\b|\badd(?:ed|s)? `?(?:get|post|put|delete|patch)\b.{0,10}\//i,
    'rate-limit': /rate.?limit|\bweight\b|frequency limit|request limit|requests per (?:second|minute)/i,
    'websocket': /websocket|\bws\b|\bwss:|\bstreams?\b|\bchannels?\b|\btopics?\b|subscri(?:be|ption)/i,
    // "(authenticated)" next to an endpoint only says it is private
    'auth': /signature|\bsign(?:ing|ed)?\b|api.?keys?|authenticat(?!ed\))|\bhmac\b|ed25519|\brsa\b|oauth|permission/i,
    'maintenance': /\bmaintenance\b(?! (?:margin|rate|ratio|requirement)s?\b)|upgrade window|\bdowntime\b|system upgrade|(?:시스템|서버|정기|긴급|임시)\s*점검|점검\s*(?:시간|일정|예정|진행)|メンテナンス|维护(?:时间|公告|期间|通知)|系统维护|停机维护/i,
    'param-change': /new (?:optional |required )?(?:request |response |push )?(?:parameters?|fields?)|add(?:ed|s)? (?:a |an |the )?(?:new )?(?:optional |required )?(?:request |response |push )?(?:parameter|field)s?|\badd(?:ed|s)? (?:the |a |an )?(?:new )?(?:optional |required )?`?[\w.[\]{}]+`? (?:request |response )?(?:field|parameter)s?\b|response .{0,30}fields?|request parameters?|\benum\b/i,
    // new or removed markets only: "perpetual", "contract" or "market data" alone describe the
    // product an endpoint belongs to, not a listing change; "listed" alone ("the endpoints listed
    // below") says nothing.
    'market': /\bnew (?:spot |futures |perpetual |options? |margin |prediction )?(?:markets?|trading pairs?|contracts?|perpetuals?|symbols?|instruments?)\b(?! (?:fields?|types?|status|parameters?|data)\b)|(?<!\b(?:for|by) )\blisting\b(?! (?:the|a|an|all|of|each|every|its|their|your)\b)|\bdelist|\blaunch(?:es|ed)? (?:new )?(?:[\w-]+ ){0,3}(?:perpetuals?|futures|contracts?|markets?|trading pairs?)\b|\boptions? (?:trading|markets?) (?:launch|is now|are now|now)/i,
};

// "no|not|non|without|zero|nothing" + up to eight words + a word from `targets`.
// The words in between may not end a sentence ("." or ";"), start a contrast ("but", "however")
// or be "longer" ("no longer ... removed" stays affirmative); up to eight words, so "no existing
// FIX Market Data fields are modified or removed" is negated.
function negations (targets: string): RegExp {
    return new RegExp (String.raw`\b(?:no(?![\s-]+longer\b)|not|non|without|zero|nothing)\b[\s-]+(?:(?!(?:but|however|while|whereas|although|except|yet)\b)[\w\x60/'()]+(?:\.[\w\x60/()]+)*,?[\s-]+){0,8}?(?:${targets})\b`, 'gi');
}

export const NEGATIONS = negations (String.raw`breaking|removed|removals?|deprecat\w*|retired|incompatib\w*`);
// "no signature required", "without an API key", "does not require authentication", "not signed"
// Shorter than NEGATIONS (three words), ends at "requires"/"must"/"need"/"and", and "non-" counts
// only on the auth word itself ("non-authenticated"): "Withdrawal of non-tradable assets requires
// that the API Key ..." and "(no `/0` prefix) and requires permission ..." keep 'auth'.
const AUTH_TARGETS = String.raw`signatures?|sign(?:ing|ed)?|api.?keys?|authenticat\w*|hmac|permissions?|oauth`;
// "No breaking changes to order placement, authentication, or market data" lists what did not change.
export const AUTH_NEGATIONS = new RegExp (String.raw`\bno\s+(?:[\w-]+\s+){0,2}?changes?\s+(?:to|in|for)\b[^.;\n]{0,120}|\bnon-?(?:${AUTH_TARGETS})\b|\b(?:no(?![\s-]+longer\b)|not|without|zero|nothing)\b\s+(?:(?!(?:but|however|while|whereas|although|except|yet|and|requires|required|must|needs)\b)[\w\x60/'()]+,?\s+){0,3}?(?:${AUTH_TARGETS})\b`, 'gi');

// Label lines answered with "No" ("**Breaking Changes:** No", "Deprecations: None", "Breaking: N/A").
export const NEGATED_LABELS = /\b(?:breaking(?:[\s-]+changes?)?|deprecat\w*|removals?)\s*(?:\*\*|__)?\s*:\s*(?:\*\*|__)?\s*(?:no|none|n\/a)\b/gi;

// Sentences: a local reassurance only cancels the weak signals next to it ("Schema 2:1 is a backward
// compatible update" says nothing about "the parameter will be rejected" two bullets down).
function sentences (text: string): string[] {
    return text.split (/\n[ \t]*\n|\n(?=[ \t]*(?:[-*+\u2022]|\d+[.)])[ \t])|(?<=[.!?])\s+(?=\S)/);
}

function breaking (text: string, affirmative: string): boolean {
    if (STRONG_BREAKING.test (affirmative)) {
        return true;
    }
    if (REASSURANCE.test (affirmative) || NO_BREAKING_LABEL.test (text)) {
        return false;
    }
    return sentences (affirmative).some ((b) => WEAK_BREAKING.test (b) && !LOCAL_REASSURANCE.test (b));
}

export function ruleTags (title: string, body: string): string[] {
    const text = title + '\n' + body;
    const affirmative = text.replace (NEGATED_LABELS, ' ').replace (NEGATIONS, ' ');
    const authText = text.replace (AUTH_NEGATIONS, ' ');
    return Object.keys (TAG_RULES).filter ((tag) => {
        if (tag === 'breaking') {
            return breaking (text, affirmative);
        }
        if (tag === 'deprecation') {
            return TAG_RULES[tag].test (affirmative);
        }
        if (tag === 'auth') {
            return TAG_RULES[tag].test (authText);
        }
        return TAG_RULES[tag].test (text);
    });
}
