using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    public sealed class TlsDecodeResult
    {
        public readonly byte[] buf;
        public readonly int off, len;
        public readonly short contentType;

        public TlsDecodeResult(byte[] buf, int off, int len, short contentType)
        {
            this.buf = buf;
            this.off = off;
            this.len = len;
            this.contentType = contentType;
        }
    }
}
