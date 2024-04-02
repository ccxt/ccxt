using System;
using System.IO;

using Org.BouncyCastle.Bcpg.Sig;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
	/**
	* reader for signature sub-packets
	*/
	public class SignatureSubpacketsParser
	{
		private readonly Stream input;

		public SignatureSubpacketsParser(
			Stream input)
		{
			this.input = input;
		}

		public SignatureSubpacket ReadPacket()
		{
			int l = input.ReadByte();
			if (l < 0)
				return null;

			int bodyLen = 0;
            bool isLongLength = false;

            if (l < 192)
			{
				bodyLen = l;
			}
			else if (l <= 223)
			{
				bodyLen = ((l - 192) << 8) + (input.ReadByte()) + 192;
			}
			else if (l == 255)
			{
                isLongLength = true;
				bodyLen = (input.ReadByte() << 24) | (input.ReadByte() << 16)
					|  (input.ReadByte() << 8)  | input.ReadByte();
			}
			else
			{
                throw new IOException("unexpected length header");
			}

            int tag = input.ReadByte();
			if (tag < 0)
				throw new EndOfStreamException("unexpected EOF reading signature sub packet");

            if (bodyLen <= 0)
                throw new EndOfStreamException("out of range data found in signature sub packet");

            byte[] data = new byte[bodyLen - 1];

            //
            // this may seem a bit strange but it turns out some applications miscode the length
            // in fixed length fields, so we check the length we do get, only throwing an exception if
            // we really cannot continue
            //
            int bytesRead = Streams.ReadFully(input, data);

            bool isCritical = ((tag & 0x80) != 0);
            SignatureSubpacketTag type = (SignatureSubpacketTag)(tag & 0x7f);

            if (bytesRead != data.Length)
            {
                switch (type)
                {
                case SignatureSubpacketTag.CreationTime:
                    data = CheckData(data, 4, bytesRead, "Signature Creation Time");
                    break;
                case SignatureSubpacketTag.IssuerKeyId:
                    data = CheckData(data, 8, bytesRead, "Issuer");
                    break;
                case SignatureSubpacketTag.KeyExpireTime:
                    data = CheckData(data, 4, bytesRead, "Signature Key Expiration Time");
                    break;
                case SignatureSubpacketTag.ExpireTime:
                    data = CheckData(data, 4, bytesRead, "Signature Expiration Time");
                    break;
                default:
                    throw new EndOfStreamException("truncated subpacket data.");
                }
            }

            switch (type)
			{
			case SignatureSubpacketTag.CreationTime:
				return new SignatureCreationTime(isCritical, isLongLength, data);
			case SignatureSubpacketTag.KeyExpireTime:
                return new KeyExpirationTime(isCritical, isLongLength, data);
			case SignatureSubpacketTag.ExpireTime:
                return new SignatureExpirationTime(isCritical, isLongLength, data);
			case SignatureSubpacketTag.Revocable:
                return new Revocable(isCritical, isLongLength, data);
			case SignatureSubpacketTag.Exportable:
                return new Exportable(isCritical, isLongLength, data);
			case SignatureSubpacketTag.IssuerKeyId:
                return new IssuerKeyId(isCritical, isLongLength, data);
			case SignatureSubpacketTag.TrustSig:
                return new TrustSignature(isCritical, isLongLength, data);
			case SignatureSubpacketTag.PreferredCompressionAlgorithms:
			case SignatureSubpacketTag.PreferredHashAlgorithms:
			case SignatureSubpacketTag.PreferredSymmetricAlgorithms:
                return new PreferredAlgorithms(type, isCritical, isLongLength, data);
			case SignatureSubpacketTag.KeyFlags:
                return new KeyFlags(isCritical, isLongLength, data);
			case SignatureSubpacketTag.PrimaryUserId:
                return new PrimaryUserId(isCritical, isLongLength, data);
			case SignatureSubpacketTag.SignerUserId:
                return new SignerUserId(isCritical, isLongLength, data);
			case SignatureSubpacketTag.NotationData:
                return new NotationData(isCritical, isLongLength, data);
            case SignatureSubpacketTag.RevocationReason:
                return new RevocationReason(isCritical, isLongLength, data);
            case SignatureSubpacketTag.RevocationKey:
                return new RevocationKey(isCritical, isLongLength, data);
            }
            return new SignatureSubpacket(type, isCritical, isLongLength, data);
		}

        private byte[] CheckData(byte[] data, int expected, int bytesRead, string name)
        {
            if (bytesRead != expected)
                throw new EndOfStreamException("truncated " + name + " subpacket data.");

            return Arrays.CopyOfRange(data, 0, expected);
        }
	}
}
