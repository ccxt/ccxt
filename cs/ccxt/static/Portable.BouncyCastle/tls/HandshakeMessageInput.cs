using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    // TODO Rewrite without MemoryStream
    public sealed class HandshakeMessageInput
        : MemoryStream
    {
        private readonly int m_offset;

        internal HandshakeMessageInput(byte[] buf, int offset, int length)
            : base(buf, offset, length, false, true)
        {
            m_offset = offset;
        }

        public void UpdateHash(TlsHash hash)
        {
            WriteTo(new TlsHashSink(hash));
        }

        internal void UpdateHashPrefix(TlsHash hash, int bindersSize)
        {
            byte[] buf = GetBuffer();
            int count = Convert.ToInt32(Length);

            hash.Update(buf, m_offset, count - bindersSize);
        }

        internal void UpdateHashSuffix(TlsHash hash, int bindersSize)
        {
            byte[] buf = GetBuffer();
            int count = Convert.ToInt32(Length);

            hash.Update(buf, m_offset + count - bindersSize, bindersSize);
        }
    }
}
