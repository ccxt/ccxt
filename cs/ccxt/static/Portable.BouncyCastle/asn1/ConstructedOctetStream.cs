using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Asn1
{
	internal class ConstructedOctetStream
		: BaseInputStream
	{
		private readonly Asn1StreamParser m_parser;

		private bool m_first = true;
		private Stream m_currentStream;

		internal ConstructedOctetStream(Asn1StreamParser parser)
		{
			m_parser = parser;
		}

		public override int Read(byte[] buffer, int offset, int count)
		{
			Streams.ValidateBufferArguments(buffer, offset, count);

			if (count < 1)
                return 0;

			if (m_currentStream == null)
			{
				if (!m_first)
					return 0;

                Asn1OctetStringParser next = GetNextParser();
                if (next == null)
                    return 0;

				m_first = false;
				m_currentStream = next.GetOctetStream();
			}

			int totalRead = 0;

			for (;;)
			{
				int numRead = m_currentStream.Read(buffer, offset + totalRead, count - totalRead);

				if (numRead > 0)
				{
					totalRead += numRead;

					if (totalRead == count)
						return totalRead;
				}
				else
				{
                    Asn1OctetStringParser next = GetNextParser();
                    if (next == null)
					{
						m_currentStream = null;
						return totalRead;
					}

					m_currentStream = next.GetOctetStream();
				}
			}
		}

		public override int ReadByte()
		{
			if (m_currentStream == null)
			{
				if (!m_first)
					return -1;

                Asn1OctetStringParser next = GetNextParser();
                if (next == null)
					return -1;

				m_first = false;
				m_currentStream = next.GetOctetStream();
			}

			for (;;)
			{
				int b = m_currentStream.ReadByte();

				if (b >= 0)
					return b;

                Asn1OctetStringParser next = GetNextParser();
                if (next == null)
				{
					m_currentStream = null;
					return -1;
				}

				m_currentStream = next.GetOctetStream();
			}
		}

        private Asn1OctetStringParser GetNextParser()
        {
            IAsn1Convertible asn1Obj = m_parser.ReadObject();
            if (asn1Obj == null)
                return null;

            if (asn1Obj is Asn1OctetStringParser)
                return (Asn1OctetStringParser)asn1Obj;

            throw new IOException("unknown object encountered: " + Platform.GetTypeName(asn1Obj));
        }
	}
}
