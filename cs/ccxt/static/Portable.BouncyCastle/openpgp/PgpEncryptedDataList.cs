using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>A holder for a list of PGP encryption method packets.</remarks>
    public class PgpEncryptedDataList
		: PgpObject
    {
        private readonly List<PgpEncryptedData> list = new List<PgpEncryptedData>();
        private readonly InputStreamPacket data;

        public PgpEncryptedDataList(BcpgInputStream bcpgInput)
        {
            var packets = new List<Packet>();
            while (bcpgInput.NextPacketTag() == PacketTag.PublicKeyEncryptedSession
                || bcpgInput.NextPacketTag() == PacketTag.SymmetricKeyEncryptedSessionKey)
            {
                packets.Add(bcpgInput.ReadPacket());
            }

            Packet lastPacket = bcpgInput.ReadPacket();
            if (!(lastPacket is InputStreamPacket inputStreamPacket))
                throw new IOException("unexpected packet in stream: " + lastPacket);

            this.data = inputStreamPacket;

            foreach (var packet in packets)
            {
                if (packet is SymmetricKeyEncSessionPacket symmetricKey)
                {
                    list.Add(new PgpPbeEncryptedData(symmetricKey, data));
                }
                else if (packet is PublicKeyEncSessionPacket publicKey)
                {
                    list.Add(new PgpPublicKeyEncryptedData(publicKey, data));
                }
                else
                {
                    throw new InvalidOperationException();
                }
            }
        }

		public PgpEncryptedData this[int index]
		{
			get { return (PgpEncryptedData) list[index]; }
		}

		public int Count
		{
			get { return list.Count; }
		}

		public bool IsEmpty
        {
			get { return list.Count == 0; }
        }

		public IEnumerable<PgpEncryptedData> GetEncryptedDataObjects()
        {
            return CollectionUtilities.Proxy(list);
        }
    }
}
