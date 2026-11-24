import zlib from 'zlib';

// A minimal tar WRITER for the bootstrap tests: enough of ustar / pax / GNU to craft the
// archives the plugin's bootstrap has to read or refuse (it deliberately shares no code with
// the reader under test in plugin/scripts/bootstrap.mjs).
export interface TarEntry {
    name: string;
    data?: Buffer | string;
    type?: string; // '0' regular file (default), '2' symlink, 'x' pax header, 'L' GNU long name, …
    prefix?: string;
    linkname?: string;
}

function header (entry: TarEntry, size: number): Buffer {
    const block = Buffer.alloc (512);
    block.write (entry.name, 0, 100, 'utf8');
    block.write ('0000644\0', 100, 8, 'ascii');
    block.write ('0000000\0', 108, 8, 'ascii');
    block.write ('0000000\0', 116, 8, 'ascii');
    block.write (size.toString (8).padStart (11, '0') + '\0', 124, 12, 'ascii');
    block.write ('00000000000\0', 136, 12, 'ascii');
    block.write ('        ', 148, 8, 'ascii'); // checksum is computed over spaces
    block.write (entry.type ?? '0', 156, 1, 'ascii');
    block.write (entry.linkname ?? '', 157, 100, 'utf8');
    block.write ('ustar\0' + '00', 257, 8, 'ascii');
    block.write (entry.prefix ?? '', 345, 155, 'utf8');
    let sum = 0;
    for (const byte of block) {
        sum += byte;
    }
    block.write (sum.toString (8).padStart (6, '0') + '\0 ', 148, 8, 'ascii');
    return block;
}

export function tar (entries: TarEntry[]): Buffer {
    const blocks: Buffer[] = [];
    for (const entry of entries) {
        const data = Buffer.from (entry.data ?? '');
        blocks.push (header (entry, data.length), data, Buffer.alloc ((512 - (data.length % 512)) % 512));
    }
    blocks.push (Buffer.alloc (1024));
    return Buffer.concat (blocks);
}

export function tgz (entries: TarEntry[]): Buffer {
    return zlib.gzipSync (tar (entries));
}

// a pax extended header naming the NEXT entry, as npm / bsdtar write for names over 100 bytes
export function paxPath (name: string): TarEntry {
    const body = ' path=' + name + '\n';
    let length = body.length + 1;
    while (String (length).length + body.length !== length) {
        length = String (length).length + body.length;
    }
    return { 'name': 'PaxHeader/entry', 'type': 'x', 'data': String (length) + body };
}
