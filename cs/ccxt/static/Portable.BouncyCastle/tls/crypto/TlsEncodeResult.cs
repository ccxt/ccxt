using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    public sealed class TlsEncodeResult
    {
        public readonly byte[] buf;
        public readonly int off, len;
        public readonly short recordType;

        public TlsEncodeResult(byte[] buf, int off, int len, short recordType)
        {
            this.buf = buf;
            this.off = off;
            this.len = len;
            this.recordType = recordType;
        }
    }
}
