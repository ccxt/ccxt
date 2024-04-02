using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Bcpg.Sig;
using Org.BouncyCastle.Utilities.Date;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Generic signature packet.</remarks>
    public class SignaturePacket
        : ContainedPacket //, PublicKeyAlgorithmTag
    {
		private int						version;
        private int						signatureType;
        private long					creationTime;
        private long					keyId;
        private PublicKeyAlgorithmTag	keyAlgorithm;
        private HashAlgorithmTag		hashAlgorithm;
        private MPInteger[]				signature;
        private byte[]					fingerprint;
        private SignatureSubpacket[]	hashedData;
        private SignatureSubpacket[]	unhashedData;
		private byte[]					signatureEncoding;

		internal SignaturePacket(
            BcpgInputStream bcpgIn)
        {
            version = bcpgIn.ReadByte();

			if (version == 3 || version == 2)
            {
//                int l =
                bcpgIn.ReadByte();

				signatureType = bcpgIn.ReadByte();
                creationTime = (((long)bcpgIn.ReadByte() << 24) | ((long)bcpgIn.ReadByte() << 16)
                    | ((long)bcpgIn.ReadByte() << 8) | (uint)bcpgIn.ReadByte()) * 1000L;

				keyId |= (long)bcpgIn.ReadByte() << 56;
                keyId |= (long)bcpgIn.ReadByte() << 48;
                keyId |= (long)bcpgIn.ReadByte() << 40;
                keyId |= (long)bcpgIn.ReadByte() << 32;
                keyId |= (long)bcpgIn.ReadByte() << 24;
                keyId |= (long)bcpgIn.ReadByte() << 16;
                keyId |= (long)bcpgIn.ReadByte() << 8;
                keyId |= (uint)bcpgIn.ReadByte();

				keyAlgorithm = (PublicKeyAlgorithmTag) bcpgIn.ReadByte();
                hashAlgorithm = (HashAlgorithmTag) bcpgIn.ReadByte();
            }
            else if (version == 4)
            {
                signatureType = bcpgIn.ReadByte();
                keyAlgorithm = (PublicKeyAlgorithmTag) bcpgIn.ReadByte();
                hashAlgorithm = (HashAlgorithmTag) bcpgIn.ReadByte();

				int hashedLength = (bcpgIn.ReadByte() << 8) | bcpgIn.ReadByte();
                byte[] hashed = new byte[hashedLength];

				bcpgIn.ReadFully(hashed);

				//
                // read the signature sub packet data.
                //
                SignatureSubpacketsParser sIn = new SignatureSubpacketsParser(
                    new MemoryStream(hashed, false));

                var v = new List<SignatureSubpacket>();

				SignatureSubpacket sub;
				while ((sub = sIn.ReadPacket()) != null)
                {
                    v.Add(sub);
                }

                hashedData = v.ToArray();

				foreach (var p in hashedData)
                {
                    if (p is IssuerKeyId issuerKeyId)
                    {
                        keyId = issuerKeyId.KeyId;
                    }
                    else if (p is SignatureCreationTime sigCreationTime)
                    {
                        creationTime = DateTimeUtilities.DateTimeToUnixMs(sigCreationTime.GetTime());
                    }
                }

				int unhashedLength = (bcpgIn.ReadByte() << 8) | bcpgIn.ReadByte();
                byte[] unhashed = new byte[unhashedLength];

				bcpgIn.ReadFully(unhashed);

				sIn = new SignatureSubpacketsParser(new MemoryStream(unhashed, false));

				v.Clear();

				while ((sub = sIn.ReadPacket()) != null)
                {
                    v.Add(sub);
                }

                unhashedData = v.ToArray();

				foreach (var p in unhashedData)
                {
                    if (p is IssuerKeyId issuerKeyId)
                    {
                        keyId = issuerKeyId.KeyId;
                    }
                }
            }
            else
            {
                Streams.Drain(bcpgIn);

                throw new UnsupportedPacketVersionException("unsupported version: " + version);
            }

			fingerprint = new byte[2];
            bcpgIn.ReadFully(fingerprint);

			switch (keyAlgorithm)
            {
                case PublicKeyAlgorithmTag.RsaGeneral:
                case PublicKeyAlgorithmTag.RsaSign:
                    MPInteger v = new MPInteger(bcpgIn);
					signature = new MPInteger[]{ v };
                    break;
				case PublicKeyAlgorithmTag.Dsa:
                    MPInteger r = new MPInteger(bcpgIn);
                    MPInteger s = new MPInteger(bcpgIn);
					signature = new MPInteger[]{ r, s };
                    break;
                case PublicKeyAlgorithmTag.ElGamalEncrypt: // yep, this really does happen sometimes.
                case PublicKeyAlgorithmTag.ElGamalGeneral:
                    MPInteger p = new MPInteger(bcpgIn);
                    MPInteger g = new MPInteger(bcpgIn);
                    MPInteger y = new MPInteger(bcpgIn);
					signature = new MPInteger[]{ p, g, y };
                    break;
                case PublicKeyAlgorithmTag.ECDsa:
                    MPInteger ecR = new MPInteger(bcpgIn);
                    MPInteger ecS = new MPInteger(bcpgIn);
                    signature = new MPInteger[]{ ecR, ecS };
                    break;
                default:
					if (keyAlgorithm >= PublicKeyAlgorithmTag.Experimental_1 && keyAlgorithm <= PublicKeyAlgorithmTag.Experimental_11)
					{
						signature = null;
						MemoryStream bOut = new MemoryStream();
						int ch;
						while ((ch = bcpgIn.ReadByte()) >= 0)
						{
							bOut.WriteByte((byte) ch);
						}
						signatureEncoding = bOut.ToArray();
					}
					else
					{
						throw new IOException("unknown signature key algorithm: " + keyAlgorithm);
					}
					break;
            }
        }

		/**
        * Generate a version 4 signature packet.
        *
        * @param signatureType
        * @param keyAlgorithm
        * @param hashAlgorithm
        * @param hashedData
        * @param unhashedData
        * @param fingerprint
        * @param signature
        */
        public SignaturePacket(
            int						signatureType,
            long					keyId,
            PublicKeyAlgorithmTag	keyAlgorithm,
            HashAlgorithmTag		hashAlgorithm,
            SignatureSubpacket[]	hashedData,
            SignatureSubpacket[]	unhashedData,
            byte[]					fingerprint,
            MPInteger[]				signature)
            : this(4, signatureType, keyId, keyAlgorithm, hashAlgorithm, hashedData, unhashedData, fingerprint, signature)
        {
        }

		/**
        * Generate a version 2/3 signature packet.
        *
        * @param signatureType
        * @param keyAlgorithm
        * @param hashAlgorithm
        * @param fingerprint
        * @param signature
        */
        public SignaturePacket(
            int						version,
            int						signatureType,
            long					keyId,
            PublicKeyAlgorithmTag	keyAlgorithm,
            HashAlgorithmTag		hashAlgorithm,
            long					creationTime,
            byte[]					fingerprint,
            MPInteger[]				signature)
            : this(version, signatureType, keyId, keyAlgorithm, hashAlgorithm, null, null, fingerprint, signature)
        {
			this.creationTime = creationTime;
        }

		public SignaturePacket(
            int						version,
            int						signatureType,
            long					keyId,
            PublicKeyAlgorithmTag	keyAlgorithm,
            HashAlgorithmTag		hashAlgorithm,
            SignatureSubpacket[]	hashedData,
            SignatureSubpacket[]	unhashedData,
            byte[]					fingerprint,
            MPInteger[]				signature)
        {
            this.version = version;
            this.signatureType = signatureType;
            this.keyId = keyId;
            this.keyAlgorithm = keyAlgorithm;
            this.hashAlgorithm = hashAlgorithm;
            this.hashedData = hashedData;
            this.unhashedData = unhashedData;
            this.fingerprint = fingerprint;
            this.signature = signature;

			if (hashedData != null)
			{
				setCreationTime();
			}
		}

		public int Version
        {
			get { return version; }
        }

		public int SignatureType
        {
			get { return signatureType; }
		}

		/**
        * return the keyId
        * @return the keyId that created the signature.
        */
        public long KeyId
        {
            get { return keyId; }
        }

		/**
        * return the signature trailer that must be included with the data
        * to reconstruct the signature
        *
        * @return byte[]
        */
        public byte[] GetSignatureTrailer()
        {
            byte[] trailer = null;

			if (version == 3)
            {
                trailer = new byte[5];

				long time = creationTime / 1000L;

				trailer[0] = (byte)signatureType;
                trailer[1] = (byte)(time >> 24);
                trailer[2] = (byte)(time >> 16);
                trailer[3] = (byte)(time >> 8);
                trailer[4] = (byte)(time);
            }
            else
            {
                MemoryStream sOut = new MemoryStream();

				sOut.WriteByte((byte)this.Version);
                sOut.WriteByte((byte)this.SignatureType);
                sOut.WriteByte((byte)this.KeyAlgorithm);
                sOut.WriteByte((byte)this.HashAlgorithm);

				MemoryStream hOut = new MemoryStream();
                SignatureSubpacket[] hashed = this.GetHashedSubPackets();

				for (int i = 0; i != hashed.Length; i++)
                {
                    hashed[i].Encode(hOut);
                }

				byte[] data = hOut.ToArray();

				sOut.WriteByte((byte)(data.Length >> 8));
                sOut.WriteByte((byte)data.Length);
                sOut.Write(data, 0, data.Length);

				byte[] hData = sOut.ToArray();

				sOut.WriteByte((byte)this.Version);
                sOut.WriteByte((byte)0xff);
                sOut.WriteByte((byte)(hData.Length>> 24));
                sOut.WriteByte((byte)(hData.Length >> 16));
                sOut.WriteByte((byte)(hData.Length >> 8));
                sOut.WriteByte((byte)(hData.Length));

				trailer = sOut.ToArray();
            }

			return trailer;
        }

		public PublicKeyAlgorithmTag KeyAlgorithm
        {
			get { return keyAlgorithm; }
        }

		public HashAlgorithmTag HashAlgorithm
		{
			get { return hashAlgorithm; }
        }

		/**
		* return the signature as a set of integers - note this is normalised to be the
        * ASN.1 encoding of what appears in the signature packet.
        */
        public MPInteger[] GetSignature()
        {
            return signature;
        }

		/**
		 * Return the byte encoding of the signature section.
		 * @return uninterpreted signature bytes.
		 */
		public byte[] GetSignatureBytes()
		{
			if (signatureEncoding != null)
			{
				return (byte[]) signatureEncoding.Clone();
			}

			MemoryStream bOut = new MemoryStream();
			BcpgOutputStream bcOut = new BcpgOutputStream(bOut);

			foreach (MPInteger sigObj in signature)
			{
				try
				{
					bcOut.WriteObject(sigObj);
				}
				catch (IOException e)
				{
					throw new Exception("internal error: " + e);
				}
			}

			return bOut.ToArray();
		}

		public SignatureSubpacket[] GetHashedSubPackets()
        {
            return hashedData;
        }

		public SignatureSubpacket[] GetUnhashedSubPackets()
        {
            return unhashedData;
        }

		/// <summary>Return the creation time in milliseconds since 1 Jan., 1970 UTC.</summary>
        public long CreationTime
        {
            get { return creationTime; }
        }

		public override void Encode(BcpgOutputStream bcpgOut)
        {
            MemoryStream bOut = new MemoryStream();
            using (var pOut = new BcpgOutputStream(bOut))
            {
                pOut.WriteByte((byte)version);

                if (version == 3 || version == 2)
                {
                    byte nextBlockLength = 5;
                    pOut.Write(nextBlockLength, (byte)signatureType);
                    pOut.WriteInt((int)(creationTime / 1000L));
                    pOut.WriteLong(keyId);
                    pOut.Write((byte)keyAlgorithm, (byte)hashAlgorithm);
                }
                else if (version == 4)
                {
                    pOut.Write((byte)signatureType, (byte)keyAlgorithm, (byte)hashAlgorithm);
                    EncodeLengthAndData(pOut, GetEncodedSubpackets(hashedData));
                    EncodeLengthAndData(pOut, GetEncodedSubpackets(unhashedData));
                }
                else
                {
                    throw new IOException("unknown version: " + version);
                }

                pOut.Write(fingerprint);

                if (signature != null)
                {
                    pOut.WriteObjects(signature);
                }
                else
                {
                    pOut.Write(signatureEncoding);
                }
            }

			bcpgOut.WritePacket(PacketTag.Signature, bOut.ToArray(), true);
        }

		private static void EncodeLengthAndData(
			BcpgOutputStream	pOut,
			byte[]				data)
		{
			pOut.WriteShort((short) data.Length);
			pOut.Write(data);
		}

		private static byte[] GetEncodedSubpackets(
			SignatureSubpacket[] ps)
		{
			MemoryStream sOut = new MemoryStream();

			foreach (SignatureSubpacket p in ps)
			{
				p.Encode(sOut);
			}

			return sOut.ToArray();
		}

		private void setCreationTime()
		{
			foreach (SignatureSubpacket p in hashedData)
			{
				if (p is SignatureCreationTime)
				{
                    creationTime = DateTimeUtilities.DateTimeToUnixMs(
						((SignatureCreationTime)p).GetTime());
					break;
				}
			}
		}
        public static SignaturePacket FromByteArray(byte[] data)
        {
            BcpgInputStream input = BcpgInputStream.Wrap(new MemoryStream(data));

            return new SignaturePacket(input);
        }
    }
}
