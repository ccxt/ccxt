using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>Generator for encrypted objects.</remarks>
    public class PgpEncryptedDataGenerator
		: IStreamGenerator
    {
		private BcpgOutputStream	pOut;
        private CipherStream		cOut;
        private IBufferedCipher		c;
        private bool				withIntegrityPacket;
        private bool				oldFormat;
        private DigestStream		digestOut;

		private abstract class EncMethod
            : ContainedPacket
        {
            protected byte[]                    sessionInfo;
            protected SymmetricKeyAlgorithmTag  encAlgorithm;
            protected KeyParameter              key;

			public abstract void AddSessionInfo(byte[] si, SecureRandom random);
        }

        private class PbeMethod
            : EncMethod
        {
            private S2k s2k;

            internal PbeMethod(
                SymmetricKeyAlgorithmTag  encAlgorithm,
                S2k                       s2k,
                KeyParameter              key)
            {
                this.encAlgorithm = encAlgorithm;
                this.s2k = s2k;
                this.key = key;
            }

            public KeyParameter GetKey()
            {
                return key;
            }

			public override void AddSessionInfo(
                byte[]			si,
				SecureRandom	random)
            {
                string cName = PgpUtilities.GetSymmetricCipherName(encAlgorithm);
                IBufferedCipher c = CipherUtilities.GetCipher(cName + "/CFB/NoPadding");

				byte[] iv = new byte[c.GetBlockSize()];
                c.Init(true, new ParametersWithRandom(new ParametersWithIV(key, iv), random));

				this.sessionInfo = c.DoFinal(si, 0, si.Length - 2);
			}

			public override void Encode(BcpgOutputStream pOut)
            {
                SymmetricKeyEncSessionPacket pk = new SymmetricKeyEncSessionPacket(
                    encAlgorithm, s2k, sessionInfo);

				pOut.WritePacket(pk);
            }
        }

		private class PubMethod
            : EncMethod
        {
			internal PgpPublicKey pubKey;
            internal bool sessionKeyObfuscation;
            internal byte[][] data;

            internal PubMethod(PgpPublicKey pubKey, bool sessionKeyObfuscation)
            {
                this.pubKey = pubKey;
                this.sessionKeyObfuscation = sessionKeyObfuscation;
            }

            public override void AddSessionInfo(
                byte[]			sessionInfo,
				SecureRandom	random)
            {
                byte[] encryptedSessionInfo = EncryptSessionInfo(sessionInfo, random);

                this.data = ProcessSessionInfo(encryptedSessionInfo);
            }

            private byte[] EncryptSessionInfo(byte[] sessionInfo, SecureRandom random)
            {
                if (pubKey.Algorithm != PublicKeyAlgorithmTag.ECDH)
                {
                    IBufferedCipher c;
				    switch (pubKey.Algorithm)
                    {
                        case PublicKeyAlgorithmTag.RsaEncrypt:
                        case PublicKeyAlgorithmTag.RsaGeneral:
                            c = CipherUtilities.GetCipher("RSA//PKCS1Padding");
                            break;
                        case PublicKeyAlgorithmTag.ElGamalEncrypt:
                        case PublicKeyAlgorithmTag.ElGamalGeneral:
                            c = CipherUtilities.GetCipher("ElGamal/ECB/PKCS1Padding");
                            break;
                        case PublicKeyAlgorithmTag.Dsa:
                            throw new PgpException("Can't use DSA for encryption.");
                        case PublicKeyAlgorithmTag.ECDsa:
                            throw new PgpException("Can't use ECDSA for encryption.");
                        default:
                            throw new PgpException("unknown asymmetric algorithm: " + pubKey.Algorithm);
                    }

                    AsymmetricKeyParameter akp = pubKey.GetKey();
				    c.Init(true, new ParametersWithRandom(akp, random));
                    return c.DoFinal(sessionInfo);
                }

                ECDHPublicBcpgKey ecKey = (ECDHPublicBcpgKey)pubKey.PublicKeyPacket.Key;

                // Generate the ephemeral key pair
                IAsymmetricCipherKeyPairGenerator gen = GeneratorUtilities.GetKeyPairGenerator("ECDH");
                gen.Init(new ECKeyGenerationParameters(ecKey.CurveOid, random));

                AsymmetricCipherKeyPair ephKp = gen.GenerateKeyPair();
                ECPrivateKeyParameters ephPriv = (ECPrivateKeyParameters)ephKp.Private;
                ECPublicKeyParameters ephPub = (ECPublicKeyParameters)ephKp.Public;

                ECPublicKeyParameters pub = (ECPublicKeyParameters)pubKey.GetKey();
                ECPoint S = pub.Q.Multiply(ephPriv.D).Normalize();

                KeyParameter key = new KeyParameter(Rfc6637Utilities.CreateKey(pubKey.PublicKeyPacket, S));

                IWrapper w = PgpUtilities.CreateWrapper(ecKey.SymmetricKeyAlgorithm);
                w.Init(true, new ParametersWithRandom(key, random));

                byte[] paddedSessionData = PgpPad.PadSessionData(sessionInfo, sessionKeyObfuscation);

                byte[] C = w.Wrap(paddedSessionData, 0, paddedSessionData.Length);
                byte[] VB = new MPInteger(new BigInteger(1, ephPub.Q.GetEncoded(false))).GetEncoded();

                byte[] rv = new byte[VB.Length + 1 + C.Length];

                Array.Copy(VB, 0, rv, 0, VB.Length);
                rv[VB.Length] = (byte)C.Length;
                Array.Copy(C, 0, rv, VB.Length + 1, C.Length);

                return rv;
            }

            private byte[][] ProcessSessionInfo(byte[] encryptedSessionInfo)
            {
                byte[][] data;

                switch (pubKey.Algorithm)
                {
                case PublicKeyAlgorithmTag.RsaEncrypt:
                case PublicKeyAlgorithmTag.RsaGeneral:
                    data = new byte[][] { ConvertToEncodedMpi(encryptedSessionInfo) };
                    break;
                case PublicKeyAlgorithmTag.ElGamalEncrypt:
                case PublicKeyAlgorithmTag.ElGamalGeneral:
                    int halfLength = encryptedSessionInfo.Length / 2;
                    byte[] b1 = new byte[halfLength];
                    byte[] b2 = new byte[halfLength];

                    Array.Copy(encryptedSessionInfo, 0, b1, 0, halfLength);
                    Array.Copy(encryptedSessionInfo, halfLength, b2, 0, halfLength);

                    data = new byte[][] {
                        ConvertToEncodedMpi(b1),
                        ConvertToEncodedMpi(b2),
                    };
                    break;
                case PublicKeyAlgorithmTag.ECDH:
                    data = new byte[][]{ encryptedSessionInfo };
                    break;
                default:
                    throw new PgpException("unknown asymmetric algorithm: " + pubKey.Algorithm);
                }

                return data;
            }

            private byte[] ConvertToEncodedMpi(byte[] encryptedSessionInfo)
            {
                try
                {
                    return new MPInteger(new BigInteger(1, encryptedSessionInfo)).GetEncoded();
                }
                catch (IOException e)
                {
                    throw new PgpException("Invalid MPI encoding: " + e.Message, e);
                }
            }

            public override void Encode(BcpgOutputStream pOut)
            {
                PublicKeyEncSessionPacket pk = new PublicKeyEncSessionPacket(pubKey.KeyId, pubKey.Algorithm, data);

                pOut.WritePacket(pk);
            }
        }

        private readonly List<EncMethod> methods = new List<EncMethod>();
        private readonly SymmetricKeyAlgorithmTag defAlgorithm;
        private readonly SecureRandom rand;

		public PgpEncryptedDataGenerator(
			SymmetricKeyAlgorithmTag encAlgorithm)
		{
			this.defAlgorithm = encAlgorithm;
			this.rand = new SecureRandom();
		}

		public PgpEncryptedDataGenerator(
			SymmetricKeyAlgorithmTag	encAlgorithm,
			bool						withIntegrityPacket)
		{
			this.defAlgorithm = encAlgorithm;
			this.withIntegrityPacket = withIntegrityPacket;
			this.rand = new SecureRandom();
		}

		/// <summary>Existing SecureRandom constructor.</summary>
		/// <param name="encAlgorithm">The symmetric algorithm to use.</param>
		/// <param name="rand">Source of randomness.</param>
        public PgpEncryptedDataGenerator(
            SymmetricKeyAlgorithmTag	encAlgorithm,
            SecureRandom				rand)
        {
            this.defAlgorithm = encAlgorithm;
            this.rand = rand;
        }

		/// <summary>Creates a cipher stream which will have an integrity packet associated with it.</summary>
        public PgpEncryptedDataGenerator(
            SymmetricKeyAlgorithmTag	encAlgorithm,
            bool						withIntegrityPacket,
            SecureRandom				rand)
        {
            this.defAlgorithm = encAlgorithm;
            this.rand = rand;
            this.withIntegrityPacket = withIntegrityPacket;
        }

		/// <summary>Base constructor.</summary>
		/// <param name="encAlgorithm">The symmetric algorithm to use.</param>
		/// <param name="rand">Source of randomness.</param>
		/// <param name="oldFormat">PGP 2.6.x compatibility required.</param>
        public PgpEncryptedDataGenerator(
            SymmetricKeyAlgorithmTag	encAlgorithm,
            SecureRandom				rand,
            bool						oldFormat)
        {
            this.defAlgorithm = encAlgorithm;
            this.rand = rand;
            this.oldFormat = oldFormat;
        }

        /// <summary>Add a PBE encryption method to the encrypted object.</summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public void AddMethod(char[] passPhrase, HashAlgorithmTag s2kDigest)
        {
            DoAddMethod(PgpUtilities.EncodePassPhrase(passPhrase, false), true, s2kDigest);
        }

        /// <summary>Add a PBE encryption method to the encrypted object.</summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        public void AddMethodUtf8(char[] passPhrase, HashAlgorithmTag s2kDigest)
        {
            DoAddMethod(PgpUtilities.EncodePassPhrase(passPhrase, true), true, s2kDigest);
        }

        /// <summary>Add a PBE encryption method to the encrypted object.</summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public void AddMethodRaw(byte[] rawPassPhrase, HashAlgorithmTag s2kDigest)
        {
            DoAddMethod(rawPassPhrase, false, s2kDigest);
        }

        internal void DoAddMethod(byte[] rawPassPhrase, bool clearPassPhrase, HashAlgorithmTag s2kDigest)
        {
            S2k s2k = PgpUtilities.GenerateS2k(s2kDigest, 0x60, rand);

            methods.Add(new PbeMethod(defAlgorithm, s2k, PgpUtilities.DoMakeKeyFromPassPhrase(defAlgorithm, s2k, rawPassPhrase, clearPassPhrase)));
        }

        /// <summary>Add a public key encrypted session key to the encrypted object.</summary>
        public void AddMethod(PgpPublicKey key)
        {
            AddMethod(key, true);
        }

        public void AddMethod(PgpPublicKey key, bool sessionKeyObfuscation)
        {
            if (!key.IsEncryptionKey)
            {
                throw new ArgumentException("passed in key not an encryption key!");
            }

            methods.Add(new PubMethod(key, sessionKeyObfuscation));
        }

        private void AddCheckSum(
            byte[] sessionInfo)
        {
			Debug.Assert(sessionInfo != null);
			Debug.Assert(sessionInfo.Length >= 3);

			int check = 0;

			for (int i = 1; i < sessionInfo.Length - 2; i++)
            {
                check += sessionInfo[i];
            }

			sessionInfo[sessionInfo.Length - 2] = (byte)(check >> 8);
            sessionInfo[sessionInfo.Length - 1] = (byte)(check);
        }

		private byte[] CreateSessionInfo(
			SymmetricKeyAlgorithmTag	algorithm,
			KeyParameter				key)
		{
			byte[] keyBytes = key.GetKey();
			byte[] sessionInfo = new byte[keyBytes.Length + 3];
			sessionInfo[0] = (byte) algorithm;
			keyBytes.CopyTo(sessionInfo, 1);
			AddCheckSum(sessionInfo);
			return sessionInfo;
		}

		/// <summary>
		/// <p>
		/// If buffer is non null stream assumed to be partial, otherwise the length will be used
		/// to output a fixed length packet.
		/// </p>
		/// <p>
		/// The stream created can be closed off by either calling Close()
		/// on the stream or Close() on the generator. Closing the returned
		/// stream does not close off the Stream parameter <c>outStr</c>.
		/// </p>
		/// </summary>
        private Stream Open(
            Stream	outStr,
            long	length,
            byte[]	buffer)
        {
			if (cOut != null)
				throw new InvalidOperationException("generator already in open state");
			if (methods.Count == 0)
				throw new InvalidOperationException("No encryption methods specified");
			if (outStr == null)
				throw new ArgumentNullException("outStr");

			pOut = new BcpgOutputStream(outStr);

			KeyParameter key;

			if (methods.Count == 1)
            {
                if (methods[0] is PbeMethod pbeMethod)
                {
					key = pbeMethod.GetKey();
                }
                else if (methods[0] is PubMethod pubMethod)
                {
                    key = PgpUtilities.MakeRandomKey(defAlgorithm, rand);

					byte[] sessionInfo = CreateSessionInfo(defAlgorithm, key);

                    try
                    {
                        pubMethod.AddSessionInfo(sessionInfo, rand);
                    }
                    catch (Exception e)
                    {
                        throw new PgpException("exception encrypting session key", e);
                    }
                }
                else
                {
                    throw new InvalidOperationException();
                }

				pOut.WritePacket(methods[0]);
            }
            else // multiple methods
            {
                key = PgpUtilities.MakeRandomKey(defAlgorithm, rand);
				byte[] sessionInfo = CreateSessionInfo(defAlgorithm, key);

                foreach (EncMethod m in methods)
                {
                    try
                    {
                        m.AddSessionInfo(sessionInfo, rand);
                    }
                    catch (Exception e)
                    {
                        throw new PgpException("exception encrypting session key", e);
                    }

                    pOut.WritePacket(m);
                }
            }

            string cName = PgpUtilities.GetSymmetricCipherName(defAlgorithm);
			if (cName == null)
                throw new PgpException("null cipher specified");

			try
            {
                if (withIntegrityPacket)
                {
                    cName += "/CFB/NoPadding";
                }
                else
                {
                    cName += "/OpenPGPCFB/NoPadding";
                }

                c = CipherUtilities.GetCipher(cName);

				// TODO Confirm the IV should be all zero bytes (not inLineIv - see below)
				byte[] iv = new byte[c.GetBlockSize()];
                c.Init(true, new ParametersWithRandom(new ParametersWithIV(key, iv), rand));

                if (buffer == null)
                {
                    //
                    // we have to Add block size + 2 for the Generated IV and + 1 + 22 if integrity protected
                    //
                    if (withIntegrityPacket)
                    {
                        pOut = new BcpgOutputStream(outStr, PacketTag.SymmetricEncryptedIntegrityProtected, length + c.GetBlockSize() + 2 + 1 + 22);
                        pOut.WriteByte(1);        // version number
                    }
                    else
                    {
                        pOut = new BcpgOutputStream(outStr, PacketTag.SymmetricKeyEncrypted, length + c.GetBlockSize() + 2, oldFormat);
                    }
                }
                else
                {
                    if (withIntegrityPacket)
                    {
                        pOut = new BcpgOutputStream(outStr, PacketTag.SymmetricEncryptedIntegrityProtected, buffer);
                        pOut.WriteByte(1);        // version number
                    }
                    else
                    {
                        pOut = new BcpgOutputStream(outStr, PacketTag.SymmetricKeyEncrypted, buffer);
                    }
                }

				int blockSize = c.GetBlockSize();
				byte[] inLineIv = new byte[blockSize + 2];
                rand.NextBytes(inLineIv, 0, blockSize);
				Array.Copy(inLineIv, inLineIv.Length - 4, inLineIv, inLineIv.Length - 2, 2);

				Stream myOut = cOut = new CipherStream(pOut, null, c);

				if (withIntegrityPacket)
                {
					string digestName = PgpUtilities.GetDigestName(HashAlgorithmTag.Sha1);
					IDigest digest = DigestUtilities.GetDigest(digestName);
					myOut = digestOut = new DigestStream(myOut, null, digest);
                }

				myOut.Write(inLineIv, 0, inLineIv.Length);

				return new WrappedGeneratorStream(this, myOut);
            }
            catch (Exception e)
            {
                throw new PgpException("Exception creating cipher", e);
            }
        }

		/// <summary>
		/// <p>
		/// Return an output stream which will encrypt the data as it is written to it.
		/// </p>
		/// <p>
		/// The stream created can be closed off by either calling Close()
		/// on the stream or Close() on the generator. Closing the returned
		/// stream does not close off the Stream parameter <c>outStr</c>.
		/// </p>
		/// </summary>
        public Stream Open(
            Stream	outStr,
            long	length)
        {
            return Open(outStr, length, null);
        }

		/// <summary>
		/// <p>
		/// Return an output stream which will encrypt the data as it is written to it.
		/// The stream will be written out in chunks according to the size of the passed in buffer.
		/// </p>
		/// <p>
		/// The stream created can be closed off by either calling Close()
		/// on the stream or Close() on the generator. Closing the returned
		/// stream does not close off the Stream parameter <c>outStr</c>.
		/// </p>
		/// <p>
		/// <b>Note</b>: if the buffer is not a power of 2 in length only the largest power of 2
		/// bytes worth of the buffer will be used.
		/// </p>
		/// </summary>
        public Stream Open(
            Stream	outStr,
            byte[]	buffer)
        {
            return Open(outStr, 0, buffer);
        }

		/// <summary>
		/// <p>
		/// Close off the encrypted object - this is equivalent to calling Close() on the stream
		/// returned by the Open() method.
		/// </p>
		/// <p>
		/// <b>Note</b>: This does not close the underlying output stream, only the stream on top of
		/// it created by the Open() method.
		/// </p>
		/// </summary>
        public void Close()
        {
            if (cOut != null)
            {
				// TODO Should this all be under the try/catch block?
                if (digestOut != null)
                {
                    //
                    // hand code a mod detection packet
                    //
                    BcpgOutputStream bOut = new BcpgOutputStream(
						digestOut, PacketTag.ModificationDetectionCode, 20);

                    bOut.Flush();
                    digestOut.Flush();

					// TODO
					byte[] dig = DigestUtilities.DoFinal(digestOut.WriteDigest);
					cOut.Write(dig, 0, dig.Length);
                }

				cOut.Flush();

				try
                {
					pOut.Write(c.DoFinal());
                    pOut.Finish();
                }
                catch (Exception e)
                {
                    throw new IOException(e.Message, e);
                }

				cOut = null;
				pOut = null;
            }
		}
	}
}
