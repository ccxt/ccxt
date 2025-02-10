using System;

namespace Org.BouncyCastle.OpenSsl
{
	public interface IPasswordFinder
	{
		char[] GetPassword();
	}
}
