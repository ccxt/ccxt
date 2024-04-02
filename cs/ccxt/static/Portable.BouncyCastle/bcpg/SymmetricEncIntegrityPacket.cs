using System;
using System.IO;

namespace Org.BouncyCastle.Bcpg
{
	public class SymmetricEncIntegrityPacket
		: InputStreamPacket
	{
		internal readonly int version;

		internal SymmetricEncIntegrityPacket(
			BcpgInputStream bcpgIn)
			: base(bcpgIn)
        {
			version = bcpgIn.ReadByte();
        }
    }
}
