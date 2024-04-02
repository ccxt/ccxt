using System;
using System.IO;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>A one pass signature object.</remarks>
    public class PgpOnePassSignature
    {
        private static OnePassSignaturePacket Cast(Packet packet)
        {
            if (!(packet is OnePassSignaturePacket))
                throw new IOException("unexpected packet in stream: " + packet);

            return (OnePassSignaturePacket)packet;
        }

        private readonly OnePassSignaturePacket sigPack;
        private readonly int signatureType;
		private ISigner sig;
		private byte lastb;

		internal PgpOnePassSignature(
            BcpgInputStream bcpgInput)
            : this(Cast(bcpgInput.ReadPacket()))
        {
        }

		internal PgpOnePassSignature(
            OnePassSignaturePacket sigPack)
        {
            this.sigPack = sigPack;
            this.signatureType = sigPack.SignatureType;
        }

		/// <summary>Initialise the signature object for verification.</summary>
        public void InitVerify(
            PgpPublicKey pubKey)
        {
			lastb = 0;

			try
			{
				sig = SignerUtilities.GetSigner(
					PgpUtilities.GetSignatureName(sigPack.KeyAlgorithm, sigPack.HashAlgorithm));
			}
			catch (Exception e)
			{
				throw new PgpException("can't set up signature object.",  e);
			}

			try
            {
                sig.Init(false, pubKey.GetKey());
            }
			catch (InvalidKeyException e)
            {
                throw new PgpException("invalid key.", e);
            }
        }

		public void Update(
            byte b)
        {
			if (signatureType == PgpSignature.CanonicalTextDocument)
			{
				doCanonicalUpdateByte(b);
			}
			else
			{
				sig.Update(b);
			}
        }

		private void doCanonicalUpdateByte(
			byte b)
		{
			if (b == '\r')
			{
				doUpdateCRLF();
			}
			else if (b == '\n')
			{
				if (lastb != '\r')
				{
					doUpdateCRLF();
				}
			}
			else
			{
				sig.Update(b);
			}

			lastb = b;
		}

		private void doUpdateCRLF()
		{
			sig.Update((byte)'\r');
			sig.Update((byte)'\n');
		}

		public void Update(
            byte[] bytes)
        {
            if (signatureType == PgpSignature.CanonicalTextDocument)
            {
                for (int i = 0; i != bytes.Length; i++)
                {
                    doCanonicalUpdateByte(bytes[i]);
                }
            }
            else
            {
                sig.BlockUpdate(bytes, 0, bytes.Length);
            }
        }

        public void Update(
            byte[]  bytes,
            int     off,
            int     length)
        {
            if (signatureType == PgpSignature.CanonicalTextDocument)
            {
                int finish = off + length;

                for (int i = off; i != finish; i++)
                {
                    doCanonicalUpdateByte(bytes[i]);
                }
            }
            else
            {
                sig.BlockUpdate(bytes, off, length);
            }
        }

		/// <summary>Verify the calculated signature against the passed in PgpSignature.</summary>
        public bool Verify(
            PgpSignature pgpSig)
        {
            byte[] trailer = pgpSig.GetSignatureTrailer();

			sig.BlockUpdate(trailer, 0, trailer.Length);

			return sig.VerifySignature(pgpSig.GetSignature());
        }

        public long KeyId
        {
			get { return sigPack.KeyId; }
        }

		public int SignatureType
        {
            get { return sigPack.SignatureType; }
        }

		public HashAlgorithmTag HashAlgorithm
		{
			get { return sigPack.HashAlgorithm; }
		}

		public PublicKeyAlgorithmTag KeyAlgorithm
		{
			get { return sigPack.KeyAlgorithm; }
		}

		public byte[] GetEncoded()
        {
            MemoryStream bOut = new MemoryStream();

            Encode(bOut);

            return bOut.ToArray();
        }

		public void Encode(
            Stream outStr)
        {
            BcpgOutputStream.Wrap(outStr).WritePacket(sigPack);
        }
    }
}
