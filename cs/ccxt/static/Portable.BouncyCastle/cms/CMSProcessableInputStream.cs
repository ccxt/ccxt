using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Cms
{
	public class CmsProcessableInputStream
		: CmsProcessable, CmsReadable
	{
		private readonly Stream input;

        private bool used = false;

        public CmsProcessableInputStream(Stream input)
		{
			this.input = input;
		}

        public virtual Stream GetInputStream()
		{
			CheckSingleUsage();

            return input;
		}

        public virtual void Write(Stream output)
		{
			CheckSingleUsage();

			Streams.PipeAll(input, output);
            Platform.Dispose(input);
		}

        protected virtual void CheckSingleUsage()
		{
			lock (this)
			{
				if (used)
					throw new InvalidOperationException("CmsProcessableInputStream can only be used once");

                used = true;
			}
		}
	}
}
