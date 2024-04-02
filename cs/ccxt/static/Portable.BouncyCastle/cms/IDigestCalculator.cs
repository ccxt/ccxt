using System;

namespace Org.BouncyCastle.Cms
{
	internal interface IDigestCalculator
	{
		byte[] GetDigest();
	}
}
