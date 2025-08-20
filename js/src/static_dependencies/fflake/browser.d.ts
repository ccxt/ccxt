export function deflate(data: any, opts: any, cb: any): () => void;
/**
 * Compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @returns The deflated version of the data
 */
export function deflateSync(data: any, opts: any): Uint8Array | Uint16Array | Uint32Array;
export function inflate(data: any, opts: any, cb: any): () => void;
/**
 * Expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
export function inflateSync(data: any, out?: any): any;
export function gzip(data: any, opts: any, cb: any): () => void;
/**
 * Compresses data with GZIP
 * @param data The data to compress
 * @param opts The compression options
 * @returns The gzipped version of the data
 */
export function gzipSync(data: any, opts: any): Uint8Array | Uint16Array | Uint32Array;
export function gunzip(data: any, opts: any, cb: any): () => void;
/**
 * Expands GZIP data
 * @param data The data to decompress
 * @param out Where to write the data. GZIP already encodes the output size, so providing this doesn't save memory.
 * @returns The decompressed version of the data
 */
export function gunzipSync(data: any, out?: any): any;
export function zlib(data: any, opts: any, cb: any): () => void;
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
export function zlibSync(data: any, opts: any): Uint8Array | Uint16Array | Uint32Array;
export function unzlib(data: any, opts: any, cb: any): () => void;
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
export function unzlibSync(data: any, out: any): any;
export function decompress(data: any, opts: any, cb: any): () => void;
/**
 * Expands compressed GZIP, Zlib, or raw DEFLATE data, automatically detecting the format
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
export function decompressSync(data: any, out: any): any;
/**
 * Converts a string into a Uint8Array for use with compression/decompression methods
 * @param str The string to encode
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless decoding a binary string.
 * @returns The string encoded in UTF-8/Latin-1 binary
 */
export function strToU8(str: any, latin1: any): Uint8Array | Uint16Array | Uint32Array;
/**
 * Converts a Uint8Array to a string
 * @param dat The data to decode to string
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless encoding to binary string.
 * @returns The original UTF-8/Latin-1 string
 */
export function strFromU8(dat: any, latin1: any): string | Uint8Array | Uint16Array | Uint32Array;
export function zip(data: any, opts: any, cb: any): () => void;
/**
 * Synchronously creates a ZIP file. Prefer using `zip` for better performance
 * with more than one file.
 * @param data The directory structure for the ZIP archive
 * @param opts The main options, merged with per-file options
 * @returns The generated ZIP archive
 */
export function zipSync(data: any, opts: any): Uint8Array;
export function unzip(data: any, opts: any, cb: any): () => void;
/**
 * Synchronously decompresses a ZIP archive. Prefer using `unzip` for better
 * performance with more than one file.
 * @param data The raw compressed ZIP file
 * @param opts The ZIP extraction options
 * @returns The decompressed files
 */
export function unzipSync(data: any, opts: any): {};
export namespace FlateErrorCode {
    const UnexpectedEOF: number;
    const InvalidBlockType: number;
    const InvalidLengthLiteral: number;
    const InvalidDistance: number;
    const StreamFinished: number;
    const NoStreamHandler: number;
    const InvalidHeader: number;
    const NoCallback: number;
    const InvalidUTF8: number;
    const ExtraFieldTooLong: number;
    const InvalidDate: number;
    const FilenameTooLong: number;
    const StreamFinishing: number;
    const InvalidZipData: number;
    const UnknownCompressionMethod: number;
}
/**
 * Streaming DEFLATE compression
 * @type Class
 */
export var Deflate: Class;
/**
 * Asynchronous streaming DEFLATE compression
 * @type Class
 */
export var AsyncDeflate: Class;
/**
 * Streaming DEFLATE decompression
 * @type Class
 */
export var Inflate: Class;
/**
 * @type Class
 * Asynchronous streaming DEFLATE decompression
 */
export var AsyncInflate: Class;
/**
 * Streaming GZIP compression
 * @type Class
 */
export var Gzip: Class;
export function AsyncGzip(opts: any, cb: any): void;
/**
 * Streaming GZIP decompression
 * @type Class
 */
export var Gunzip: Class;
/**
 * @type Class
 * Asynchronous streaming GZIP decompression
 */
export var AsyncGunzip: Class;
/**
 * @type Class
 * Streaming Zlib compression
 */
export var Zlib: Class;
export function AsyncZlib(opts: any, cb: any): void;
/**
 * Streaming Zlib decompression
 * @type Class
 */
export var Unzlib: Class;
/**
 * @type Class
 * Asynchronous streaming Zlib decompression
 */
export var AsyncUnzlib: Class;
/**
 * @type Class
 * Streaming GZIP, Zlib, or raw DEFLATE decompression
 */
export var Decompress: Class;
/**
 * Asynchronous streaming GZIP, Zlib, or raw DEFLATE decompression
 * @type Class
 */
export var AsyncDecompress: Class;
/**
 * @type Class
 * Streaming UTF-8 decoding
 */
export var DecodeUTF8: Class;
/**
 * Streaming UTF-8 encoding
 * @type Class
 */
export var EncodeUTF8: Class;
/**
 * A pass-through stream to keep data uncompressed in a ZIP archive.
 * @type Class
 */
export var ZipPassThrough: Class;
/**
 * Streaming DEFLATE compression for ZIP archives. Prefer using AsyncZipDeflate
 * for better performance
 * @type Class
 */
export var ZipDeflate: Class;
/**
 * Asynchronous streaming DEFLATE compression for ZIP archives
 * @type Class
 */
export var AsyncZipDeflate: Class;
/**
 * A zippable archive to which files can incrementally be added
 * @type Class
 */
export var Zip: Class;
/**
 * Streaming pass-through decompression for ZIP archives
 * @type Class
 */
export var UnzipPassThrough: Class;
/**
 * Streaming DEFLATE decompression for ZIP archives. Prefer AsyncZipInflate for
 * better performance.
 * @type Class
 */
export var UnzipInflate: Class;
/**
 * @type Class
 * Asynchronous streaming DEFLATE decompression for ZIP archives
 */
export var AsyncUnzipInflate: Class;
/**
 * A ZIP archive decompression stream that emits files as they are discovered
 * @type Class
 */
export var Unzip: Class;
export { gzip as compress, AsyncGzip as AsyncCompress, gzipSync as compressSync, Gzip as Compress };
