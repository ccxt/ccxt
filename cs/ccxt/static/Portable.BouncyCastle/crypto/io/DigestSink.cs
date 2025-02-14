using System;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Crypto.IO
{
    public sealed class DigestSink
        : BaseOutputStream
    {
        private readonly IDigest m_digest;

        public DigestSink(IDigest digest)
        {
            m_digest = digest;
        }

        public IDigest Digest => m_digest;

        public override void Write(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (count > 0)
            {
                m_digest.BlockUpdate(buffer, offset, count);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void Write(ReadOnlySpan<byte> buffer)
        {
            if (!buffer.IsEmpty)
            {
                m_digest.BlockUpdate(buffer);
            }
        }
#endif

        public override void WriteByte(byte value)
        {
            m_digest.Update(value);
        }
    }
}
