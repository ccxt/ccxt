using System;
using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	internal sealed class WrappedGeneratorStream
		: FilterStream
	{
		private IStreamGenerator m_generator;

		internal WrappedGeneratorStream(IStreamGenerator generator, Stream s)
			: base(s)
		{
			if (generator == null)
				throw new ArgumentNullException(nameof(generator));

			m_generator = generator;
		}

        protected override void Dispose(bool disposing)
        {
			if (m_generator != null)
			{
				if (disposing)
				{
					m_generator.Close();
				}

				m_generator = null;
			}

			Detach(disposing);
		}
	}
}
