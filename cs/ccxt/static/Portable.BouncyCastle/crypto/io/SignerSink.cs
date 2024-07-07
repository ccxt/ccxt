using System;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Crypto.IO
{
    public sealed class SignerSink
		: BaseOutputStream
	{
		private readonly ISigner m_signer;

        public SignerSink(ISigner signer)
		{
            m_signer = signer;
		}

		public ISigner Signer => m_signer;

		public override void Write(byte[] buffer, int offset, int count)
		{
			Streams.ValidateBufferArguments(buffer, offset, count);

			if (count > 0)
			{
				m_signer.BlockUpdate(buffer, offset, count);
			}
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
		public override void Write(ReadOnlySpan<byte> buffer)
		{
			if (!buffer.IsEmpty)
			{
				m_signer.BlockUpdate(buffer);
			}
		}
#endif

		public override void WriteByte(byte value)
		{
			m_signer.Update(value);
		}
	}
}
