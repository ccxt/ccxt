using System;
using System.IO;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Basic packet for a PGP public key.</remarks>
	public class PublicKeyEncSessionPacket
		: ContainedPacket //, PublicKeyAlgorithmTag
	{
		private int version;
		private long keyId;
		private PublicKeyAlgorithmTag algorithm;
        private byte[][] data;

		internal PublicKeyEncSessionPacket(
			BcpgInputStream bcpgIn)
		{
			version = bcpgIn.ReadByte();

			keyId |= (long)bcpgIn.ReadByte() << 56;
			keyId |= (long)bcpgIn.ReadByte() << 48;
			keyId |= (long)bcpgIn.ReadByte() << 40;
			keyId |= (long)bcpgIn.ReadByte() << 32;
			keyId |= (long)bcpgIn.ReadByte() << 24;
			keyId |= (long)bcpgIn.ReadByte() << 16;
			keyId |= (long)bcpgIn.ReadByte() << 8;
			keyId |= (uint)bcpgIn.ReadByte();

			algorithm = (PublicKeyAlgorithmTag) bcpgIn.ReadByte();

			switch ((PublicKeyAlgorithmTag) algorithm)
			{
				case PublicKeyAlgorithmTag.RsaEncrypt:
				case PublicKeyAlgorithmTag.RsaGeneral:
					data = new byte[][]{ new MPInteger(bcpgIn).GetEncoded() };
					break;
				case PublicKeyAlgorithmTag.ElGamalEncrypt:
				case PublicKeyAlgorithmTag.ElGamalGeneral:
                    MPInteger p = new MPInteger(bcpgIn);
                    MPInteger g = new MPInteger(bcpgIn);
					data = new byte[][]{
                        p.GetEncoded(),
                        g.GetEncoded(),
                    };
					break;
                case PublicKeyAlgorithmTag.ECDH:
                    data = new byte[][]{ Streams.ReadAll(bcpgIn) };
                    break;
				default:
					throw new IOException("unknown PGP public key algorithm encountered");
			}
		}

        public PublicKeyEncSessionPacket(
			long                    keyId,
			PublicKeyAlgorithmTag   algorithm,
			byte[][]                data)
		{
			this.version = 3;
			this.keyId = keyId;
			this.algorithm = algorithm;
            this.data = new byte[data.Length][];
            for (int i = 0; i < data.Length; ++i)
            {
                this.data[i] = Arrays.Clone(data[i]);
            }
		}

        public int Version
		{
			get { return version; }
		}

		public long KeyId
		{
			get { return keyId; }
		}

		public PublicKeyAlgorithmTag Algorithm
		{
			get { return algorithm; }
		}

        public byte[][] GetEncSessionKey()
		{
			return data;
		}

        public override void Encode(BcpgOutputStream bcpgOut)
		{
			MemoryStream bOut = new MemoryStream();
			using (var pOut = new BcpgOutputStream(bOut))
			{
				pOut.WriteByte((byte)version);
				pOut.WriteLong(keyId);
				pOut.WriteByte((byte)algorithm);

				for (int i = 0; i < data.Length; ++i)
				{
					pOut.Write(data[i]);
				}
			}

			bcpgOut.WritePacket(PacketTag.PublicKeyEncryptedSession, bOut.ToArray(), true);
		}
	}
}
