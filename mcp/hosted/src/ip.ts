import net from 'node:net';

// Address helpers for the client-IP and rate-limit middleware. node:net's BlockList does
// the CIDR matching; this module only normalises what reaches it.

// "::ffff:1.2.3.4" (how a dual-stack socket reports an IPv4 peer) -> "1.2.3.4", and
// "[::1]" -> "::1". Anything that is not an IP address afterwards is undefined
export function normaliseIp (value: string | undefined | null): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    let text = value.trim ();
    if (text.startsWith ('[') && text.endsWith (']')) {
        text = text.slice (1, -1);
    }
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec (text);
    if (mapped !== null) {
        text = mapped[1];
    }
    return (net.isIP (text) === 0) ? undefined : text;
}

export class CidrSet {
    private list = new net.BlockList ();
    readonly size: number;

    constructor (cidrs: readonly string[]) {
        for (const cidr of cidrs) {
            const [ address, bits ] = cidr.split ('/');
            const family = net.isIP (address);
            const prefix = Number (bits);
            if (family === 0 || !Number.isInteger (prefix) || prefix < 0 || prefix > ((family === 4) ? 32 : 128)) {
                throw new Error ('invalid CIDR ' + JSON.stringify (cidr));
            }
            this.list.addSubnet (address, prefix, (family === 4) ? 'ipv4' : 'ipv6');
        }
        this.size = cidrs.length;
    }

    has (ip: string | undefined): boolean {
        const address = normaliseIp (ip);
        if (address === undefined) {
            return false;
        }
        return this.list.check (address, (net.isIP (address) === 4) ? 'ipv4' : 'ipv6');
    }
}

// loopback and private ranges: the only peers whose proxy headers are believed (a reverse
// proxy on the same machine or the container network); a header from any other peer is
// client-controlled and ignored
export const PROXY_PEERS = new CidrSet ([
    '127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '169.254.0.0/16',
    '::1/128', 'fc00::/7', 'fe80::/10',
]);

// The rate-limit key for a client address. An IPv6 subscriber is normally given a whole /64
// (2^64 addresses) and can rotate its source address freely, so a per-address bucket would
// hand one client unlimited fresh bursts: IPv6 clients are keyed on their /64. IPv4 keeps
// the full address.
export function rateKeyForIp (ip: string): string {
    const address = normaliseIp (ip);
    if (address === undefined || net.isIP (address) !== 6) {
        return 'ip:' + (address ?? ip);
    }
    let text = address.split ('%')[0].toLowerCase ();
    // an embedded IPv4 tail ("64:ff9b::1.2.3.4") becomes its two hex groups
    const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec (text);
    if (v4 !== null) {
        const o = v4.slice (1).map (Number);
        text = text.slice (0, v4.index) + ((o[0] << 8) | o[1]).toString (16) + ':' + ((o[2] << 8) | o[3]).toString (16);
    }
    const halves = text.split ('::');
    const left = (halves[0].length > 0) ? halves[0].split (':') : [];
    const right = (halves.length > 1 && halves[1].length > 0) ? halves[1].split (':') : [];
    const groups = (halves.length > 1) ? [ ...left, ...new Array (Math.max (0, 8 - left.length - right.length)).fill ('0'), ...right ] : left;
    return 'ip6:' + groups.slice (0, 4).map ((group) => parseInt (group, 16).toString (16)).join (':') + '::/64';
}
