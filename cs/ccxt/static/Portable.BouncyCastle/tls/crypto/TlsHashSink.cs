using System;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls.Crypto
{
    public class TlsHashSink
        : BaseOutputStream
    {
        private readonly TlsHash m_hash;

        public TlsHashSink(TlsHash hash)
        {
            this.m_hash = hash;
        }

        public virtual TlsHash Hash
        {
            get { return m_hash; }
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (count > 0)
            {
                m_hash.Update(buffer, offset, count);
            }
        }

        public override void WriteByte(byte value)
        {
            m_hash.Update(new byte[]{ value }, 0, 1);
        }
    }
}
