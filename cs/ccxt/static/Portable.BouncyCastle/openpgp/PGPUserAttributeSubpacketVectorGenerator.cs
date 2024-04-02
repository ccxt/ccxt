using System;
using System.Collections.Generic;

using Org.BouncyCastle.Bcpg.Attr;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	public class PgpUserAttributeSubpacketVectorGenerator
	{
		private readonly List<UserAttributeSubpacket> list = new List<UserAttributeSubpacket>();

		public virtual void SetImageAttribute(ImageAttrib.Format imageType, byte[] imageData)
		{
			if (imageData == null)
				throw new ArgumentException("attempt to set null image", "imageData");

			list.Add(new ImageAttrib(imageType, imageData));
		}

        public virtual PgpUserAttributeSubpacketVector Generate()
		{
            return new PgpUserAttributeSubpacketVector(list.ToArray());
		}
	}
}
