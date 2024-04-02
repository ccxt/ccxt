using System;
using System.IO;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>A password based encryption object.</remarks>
    public class PgpPbeEncryptedData
        : PgpEncryptedData
    {
        private readonly SymmetricKeyEncSessionPacket keyData;

		internal PgpPbeEncryptedData(
			SymmetricKeyEncSessionPacket	keyData,
			InputStreamPacket				encData)
			: base(encData)
		{
			this.keyData = keyData;
		}

		/// <summary>Return the raw input stream for the data stream.</summary>
		public override Stream GetInputStream()
		{
			return encData.GetInputStream();
		}

		/// <summary>Return the decrypted input stream, using the passed in passphrase.</summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public Stream GetDataStream(char[] passPhrase)
        {
            return DoGetDataStream(PgpUtilities.EncodePassPhrase(passPhrase, false), true);
        }

		/// <summary>Return the decrypted input stream, using the passed in passphrase.</summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        public Stream GetDataStreamUtf8(char[] passPhrase)
        {
            return DoGetDataStream(PgpUtilities.EncodePassPhrase(passPhrase, true), true);
        }

		/// <summary>Return the decrypted input stream, using the passed in passphrase.</summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public Stream GetDataStreamRaw(byte[] rawPassPhrase)
        {
            return DoGetDataStream(rawPassPhrase, false);
        }

        internal Stream DoGetDataStream(byte[] rawPassPhrase, bool clearPassPhrase)
        {
			try
			{
				SymmetricKeyAlgorithmTag keyAlgorithm = keyData.EncAlgorithm;

				KeyParameter key = PgpUtilities.DoMakeKeyFromPassPhrase(
					keyAlgorithm, keyData.S2k, rawPassPhrase, clearPassPhrase);

                byte[] secKeyData = keyData.GetSecKeyData();
				if (secKeyData != null && secKeyData.Length > 0)
				{
					IBufferedCipher keyCipher = CipherUtilities.GetCipher(
						PgpUtilities.GetSymmetricCipherName(keyAlgorithm) + "/CFB/NoPadding");

					keyCipher.Init(false,
						new ParametersWithIV(key, new byte[keyCipher.GetBlockSize()]));

					byte[] keyBytes = keyCipher.DoFinal(secKeyData);

					keyAlgorithm = (SymmetricKeyAlgorithmTag) keyBytes[0];

					key = ParameterUtilities.CreateKeyParameter(
						PgpUtilities.GetSymmetricCipherName(keyAlgorithm),
						keyBytes, 1, keyBytes.Length - 1);
				}


				IBufferedCipher c = CreateStreamCipher(keyAlgorithm);

				byte[] iv = new byte[c.GetBlockSize()];

				c.Init(false, new ParametersWithIV(key, iv));

				encStream = BcpgInputStream.Wrap(new CipherStream(encData.GetInputStream(), c, null));

				if (encData is SymmetricEncIntegrityPacket)
				{
					truncStream = new TruncatedStream(encStream);

					string digestName = PgpUtilities.GetDigestName(HashAlgorithmTag.Sha1);
					IDigest digest = DigestUtilities.GetDigest(digestName);

					encStream = new DigestStream(truncStream, digest, null);
				}

				if (Streams.ReadFully(encStream, iv, 0, iv.Length) < iv.Length)
					throw new EndOfStreamException("unexpected end of stream.");

				int v1 = encStream.ReadByte();
				int v2 = encStream.ReadByte();

				if (v1 < 0 || v2 < 0)
					throw new EndOfStreamException("unexpected end of stream.");


				// Note: the oracle attack on the "quick check" bytes is not deemed
				// a security risk for PBE (see PgpPublicKeyEncryptedData)

				bool repeatCheckPassed =
						iv[iv.Length - 2] == (byte)v1
					&&	iv[iv.Length - 1] == (byte)v2;

				// Note: some versions of PGP appear to produce 0 for the extra
				// bytes rather than repeating the two previous bytes
				bool zeroesCheckPassed =
						v1 == 0
					&&	v2 == 0;

				if (!repeatCheckPassed && !zeroesCheckPassed)
				{
					throw new PgpDataValidationException("quick check failed.");
				}


				return encStream;
			}
			catch (PgpException e)
			{
				throw e;
			}
			catch (Exception e)
			{
				throw new PgpException("Exception creating cipher", e);
			}
		}

		private IBufferedCipher CreateStreamCipher(
			SymmetricKeyAlgorithmTag keyAlgorithm)
		{
			string mode = (encData is SymmetricEncIntegrityPacket)
				? "CFB"
				: "OpenPGPCFB";

			string cName = PgpUtilities.GetSymmetricCipherName(keyAlgorithm)
				+ "/" + mode + "/NoPadding";

			return CipherUtilities.GetCipher(cName);
		}
	}
}
