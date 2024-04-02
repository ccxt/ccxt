using System;
using System.IO;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>
	/// A PGP marker packet - in general these should be ignored other than where
	/// the idea is to preserve the original input stream.
	/// </remarks>
    public class PgpMarker
		: PgpObject
    {
        private readonly MarkerPacket data;

		public PgpMarker(
            BcpgInputStream bcpgInput)
        {
            Packet packet = bcpgInput.ReadPacket();
            if (!(packet is MarkerPacket))
                throw new IOException("unexpected packet in stream: " + packet);

            this.data = (MarkerPacket)packet;
        }
	}
}
