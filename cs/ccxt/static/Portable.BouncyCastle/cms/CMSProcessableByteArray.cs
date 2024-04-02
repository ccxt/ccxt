using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;

namespace Org.BouncyCastle.Cms
{
	/**
	* a holding class for a byte array of data to be processed.
	*/
	public class CmsProcessableByteArray
		: CmsProcessable, CmsReadable
	{
	    private readonly DerObjectIdentifier type;
		private readonly byte[] bytes;

        public CmsProcessableByteArray(byte[] bytes)
        {
            type = CmsObjectIdentifiers.Data;
			this.bytes = bytes;
		}

	    public CmsProcessableByteArray(DerObjectIdentifier type, byte[] bytes)
	    {
	        this.bytes = bytes;
	        this.type = type;
	    }

	    public DerObjectIdentifier Type
	    {
	        get { return type; }
	    }

        public virtual Stream GetInputStream()
		{
			return new MemoryStream(bytes, false);
		}

        public virtual void Write(Stream zOut)
		{
			zOut.Write(bytes, 0, bytes.Length);
		}
	}
}
