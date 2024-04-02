using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	public abstract class PgpKeyRing
		: PgpObject
	{
		internal PgpKeyRing()
		{
		}

        internal static TrustPacket ReadOptionalTrustPacket(BcpgInputStream pIn)
		{
            PacketTag tag = pIn.SkipMarkerPackets();

            return tag == PacketTag.Trust ? (TrustPacket)pIn.ReadPacket() : null;
		}

		internal static IList<PgpSignature> ReadSignaturesAndTrust(BcpgInputStream pIn)
		{
            try
            {
				var sigList = new List<PgpSignature>();

				while (pIn.SkipMarkerPackets() == PacketTag.Signature)
				{
					SignaturePacket signaturePacket = (SignaturePacket)pIn.ReadPacket();
					TrustPacket trustPacket = ReadOptionalTrustPacket(pIn);

					sigList.Add(new PgpSignature(signaturePacket, trustPacket));
				}

				return sigList;
			}
			catch (PgpException e)
			{
				throw new IOException("can't create signature object: " + e.Message, e);
			}
		}

		internal static void ReadUserIDs(BcpgInputStream pIn, out IList<object> ids, out IList<TrustPacket> idTrusts,
			out IList<IList<PgpSignature>> idSigs)
		{
			ids = new List<object>();
			idTrusts = new List<TrustPacket>();
			idSigs = new List<IList<PgpSignature>>();

            while (IsUserTag(pIn.SkipMarkerPackets()))
			{
				Packet obj = pIn.ReadPacket();
				if (obj is UserIdPacket)
				{
					UserIdPacket id = (UserIdPacket)obj;
					ids.Add(id.GetId());
				}
				else
				{
					UserAttributePacket user = (UserAttributePacket)obj;
					ids.Add(new PgpUserAttributeSubpacketVector(user.GetSubpackets()));
				}

				idTrusts.Add(ReadOptionalTrustPacket(pIn));
				idSigs.Add(ReadSignaturesAndTrust(pIn));
			}
		}

        private static bool IsUserTag(PacketTag tag)
        {
            switch (tag)
            {
                case PacketTag.UserAttribute:
                case PacketTag.UserId:
                    return true;
                default:
                    return false;
            }
        }
	}
}
