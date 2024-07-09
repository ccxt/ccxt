using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Utilities.IO.Pem
{
	public class PemObject
		: PemObjectGenerator
	{
		private string type;
		private IList<PemHeader> headers;
		private byte[] content;

		public PemObject(string type, byte[] content)
			: this(type, new List<PemHeader>(), content)
		{
		}

		public PemObject(string type, IList<PemHeader> headers, byte[] content)
		{
			this.type = type;
            this.headers = new List<PemHeader>(headers);
			this.content = content;
		}

		public string Type
		{
			get { return type; }
		}

		public IList<PemHeader> Headers
		{
			get { return headers; }
		}

		public byte[] Content
		{
			get { return content; }
		}

		public PemObject Generate()
		{
			return this;
		}
	}
}
