using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
    /// <remarks>General class to handle a PGP secret key object.</remarks>
    public class PgpSecretKey
    {
        private readonly SecretKeyPacket	secret;
        private readonly PgpPublicKey		pub;

        internal PgpSecretKey(
            SecretKeyPacket	secret,
            PgpPublicKey	pub)
        {
            this.secret = secret;
            this.pub = pub;
        }

        internal PgpSecretKey(
            PgpPrivateKey				privKey,
            PgpPublicKey				pubKey,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            byte[]						rawPassPhrase,
            bool                        clearPassPhrase,
            bool						useSha1,
            SecureRandom				rand,
            bool						isMasterKey)
        {
            BcpgObject secKey;

            this.pub = pubKey;

            switch (pubKey.Algorithm)
            {
                case PublicKeyAlgorithmTag.RsaEncrypt:
                case PublicKeyAlgorithmTag.RsaSign:
                case PublicKeyAlgorithmTag.RsaGeneral:
                    RsaPrivateCrtKeyParameters rsK = (RsaPrivateCrtKeyParameters) privKey.Key;
                    secKey = new RsaSecretBcpgKey(rsK.Exponent, rsK.P, rsK.Q);
                    break;
                case PublicKeyAlgorithmTag.Dsa:
                    DsaPrivateKeyParameters dsK = (DsaPrivateKeyParameters) privKey.Key;
                    secKey = new DsaSecretBcpgKey(dsK.X);
                    break;
                case PublicKeyAlgorithmTag.ECDH:
                case PublicKeyAlgorithmTag.ECDsa:
                    ECPrivateKeyParameters ecK = (ECPrivateKeyParameters)privKey.Key;
                    secKey = new ECSecretBcpgKey(ecK.D);
                    break;
                case PublicKeyAlgorithmTag.ElGamalEncrypt:
                case PublicKeyAlgorithmTag.ElGamalGeneral:
                    ElGamalPrivateKeyParameters esK = (ElGamalPrivateKeyParameters) privKey.Key;
                    secKey = new ElGamalSecretBcpgKey(esK.X);
                    break;
                default:
                    throw new PgpException("unknown key class");
            }

            try
            {
                MemoryStream bOut = new MemoryStream();
                BcpgOutputStream pOut = new BcpgOutputStream(bOut);

                pOut.WriteObject(secKey);

                byte[] keyData = bOut.ToArray();
                byte[] checksumData = Checksum(useSha1, keyData, keyData.Length);

                keyData = Arrays.Concatenate(keyData, checksumData);

                if (encAlgorithm == SymmetricKeyAlgorithmTag.Null)
                {
                    if (isMasterKey)
                    {
                        this.secret = new SecretKeyPacket(pub.publicPk, encAlgorithm, null, null, keyData);
                    }
                    else
                    {
                        this.secret = new SecretSubkeyPacket(pub.publicPk, encAlgorithm, null, null, keyData);
                    }
                }
                else
                {
                    S2k s2k;
                    byte[] iv;

                    byte[] encData;
                    if (pub.Version >= 4)
                    {
                        encData = EncryptKeyDataV4(keyData, encAlgorithm, HashAlgorithmTag.Sha1, rawPassPhrase, clearPassPhrase, rand, out s2k, out iv);
                    }
                    else
                    {
                        encData = EncryptKeyDataV3(keyData, encAlgorithm, rawPassPhrase, clearPassPhrase, rand, out s2k, out iv);
                    }

                    int s2kUsage = useSha1
                        ?	SecretKeyPacket.UsageSha1
                        :	SecretKeyPacket.UsageChecksum;

                    if (isMasterKey)
                    {
                        this.secret = new SecretKeyPacket(pub.publicPk, encAlgorithm, s2kUsage, s2k, iv, encData);
                    }
                    else
                    {
                        this.secret = new SecretSubkeyPacket(pub.publicPk, encAlgorithm, s2kUsage, s2k, iv, encData);
                    }
                }
            }
            catch (PgpException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new PgpException("Exception encrypting key", e);
            }
        }

        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public PgpSecretKey(
            int							certificationLevel,
            PgpKeyPair					keyPair,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            char[]						passPhrase,
            bool						useSha1,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(certificationLevel, keyPair, id, encAlgorithm, false, passPhrase, useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        /// <remarks>
        /// If utf8PassPhrase is true, conversion of the passphrase to bytes uses Encoding.UTF8.GetBytes(), otherwise the conversion
        /// is performed using Convert.ToByte(), which is the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public PgpSecretKey(
            int							certificationLevel,
            PgpKeyPair					keyPair,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            bool                        utf8PassPhrase,
            char[]						passPhrase,
            bool						useSha1,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(certificationLevel, keyPair, id, encAlgorithm,
                PgpUtilities.EncodePassPhrase(passPhrase, utf8PassPhrase), true,
                useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public PgpSecretKey(
            int							certificationLevel,
            PgpKeyPair					keyPair,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            byte[]						rawPassPhrase,
            bool						useSha1,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(certificationLevel, keyPair, id, encAlgorithm, rawPassPhrase, false, useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        internal PgpSecretKey(
            int							certificationLevel,
            PgpKeyPair					keyPair,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            byte[]						rawPassPhrase,
            bool                        clearPassPhrase,
            bool						useSha1,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(keyPair.PrivateKey, CertifiedPublicKey(certificationLevel, keyPair, id, hashedPackets, unhashedPackets),
                encAlgorithm, rawPassPhrase, clearPassPhrase, useSha1, rand, true)
        {
        }

        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public PgpSecretKey(
            int                         certificationLevel,
            PgpKeyPair                  keyPair,
            string                      id,
            SymmetricKeyAlgorithmTag    encAlgorithm,
            HashAlgorithmTag            hashAlgorithm,
            char[]                      passPhrase,
            bool                        useSha1,
            PgpSignatureSubpacketVector hashedPackets,
            PgpSignatureSubpacketVector unhashedPackets,
            SecureRandom                rand)
            : this(certificationLevel, keyPair, id, encAlgorithm, hashAlgorithm, false, passPhrase, useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        /// <remarks>
        /// If utf8PassPhrase is true, conversion of the passphrase to bytes uses Encoding.UTF8.GetBytes(), otherwise the conversion
        /// is performed using Convert.ToByte(), which is the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public PgpSecretKey(
            int                         certificationLevel,
            PgpKeyPair                  keyPair,
            string                      id,
            SymmetricKeyAlgorithmTag    encAlgorithm,
            HashAlgorithmTag            hashAlgorithm,
            bool                        utf8PassPhrase,
            char[]                      passPhrase,
            bool                        useSha1,
            PgpSignatureSubpacketVector hashedPackets,
            PgpSignatureSubpacketVector unhashedPackets,
            SecureRandom                rand)
            : this(certificationLevel, keyPair, id, encAlgorithm, hashAlgorithm,
                PgpUtilities.EncodePassPhrase(passPhrase, utf8PassPhrase), true,
                useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public PgpSecretKey(
            int                         certificationLevel,
            PgpKeyPair                  keyPair,
            string                      id,
            SymmetricKeyAlgorithmTag    encAlgorithm,
            HashAlgorithmTag            hashAlgorithm,
            byte[]                      rawPassPhrase,
            bool                        useSha1,
            PgpSignatureSubpacketVector hashedPackets,
            PgpSignatureSubpacketVector unhashedPackets,
            SecureRandom                rand)
            : this(certificationLevel, keyPair, id, encAlgorithm, hashAlgorithm, rawPassPhrase, false, useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        internal PgpSecretKey(
            int                         certificationLevel,
            PgpKeyPair                  keyPair,
            string                      id,
            SymmetricKeyAlgorithmTag    encAlgorithm,
            HashAlgorithmTag            hashAlgorithm,
            byte[]                      rawPassPhrase,
            bool                        clearPassPhrase,
            bool                        useSha1,
            PgpSignatureSubpacketVector hashedPackets,
            PgpSignatureSubpacketVector unhashedPackets,
            SecureRandom                rand)
            : this(keyPair.PrivateKey, CertifiedPublicKey(certificationLevel, keyPair, id, hashedPackets, unhashedPackets, hashAlgorithm),
                encAlgorithm, rawPassPhrase, clearPassPhrase, useSha1, rand, true)
        {
        }

        private static PgpPublicKey CertifiedPublicKey(
            int							certificationLevel,
            PgpKeyPair					keyPair,
            string						id,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets)
        {
            PgpSignatureGenerator sGen;
            try
            {
                sGen = new PgpSignatureGenerator(keyPair.PublicKey.Algorithm, HashAlgorithmTag.Sha1);
            }
            catch (Exception e)
            {
                throw new PgpException("Creating signature generator: " + e.Message, e);
            }

            //
            // Generate the certification
            //
            sGen.InitSign(certificationLevel, keyPair.PrivateKey);

            sGen.SetHashedSubpackets(hashedPackets);
            sGen.SetUnhashedSubpackets(unhashedPackets);

            try
            {
                PgpSignature certification = sGen.GenerateCertification(id, keyPair.PublicKey);
                return PgpPublicKey.AddCertification(keyPair.PublicKey, id, certification);
            }
            catch (Exception e)
            {
                throw new PgpException("Exception doing certification: " + e.Message, e);
            }
        }


        private static PgpPublicKey CertifiedPublicKey(
            int certificationLevel,
            PgpKeyPair keyPair,
            string id,
            PgpSignatureSubpacketVector hashedPackets,
            PgpSignatureSubpacketVector unhashedPackets,
            HashAlgorithmTag hashAlgorithm)
        {
            PgpSignatureGenerator sGen;
            try
            {
                sGen = new PgpSignatureGenerator(keyPair.PublicKey.Algorithm, hashAlgorithm);
            }
            catch (Exception e)
            {
                throw new PgpException("Creating signature generator: " + e.Message, e);
            }

            //
            // Generate the certification
            //
            sGen.InitSign(certificationLevel, keyPair.PrivateKey);

            sGen.SetHashedSubpackets(hashedPackets);
            sGen.SetUnhashedSubpackets(unhashedPackets);

            try
            {
                PgpSignature certification = sGen.GenerateCertification(id, keyPair.PublicKey);
                return PgpPublicKey.AddCertification(keyPair.PublicKey, id, certification);
            }
            catch (Exception e)
            {
                throw new PgpException("Exception doing certification: " + e.Message, e);
            }
        }

        public PgpSecretKey(
            int							certificationLevel,
            PublicKeyAlgorithmTag		algorithm,
            AsymmetricKeyParameter		pubKey,
            AsymmetricKeyParameter		privKey,
            DateTime					time,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            char[]						passPhrase,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(certificationLevel,
                new PgpKeyPair(algorithm, pubKey, privKey, time),
                id, encAlgorithm, passPhrase, false, hashedPackets, unhashedPackets, rand)
        {
        }

        public PgpSecretKey(
            int							certificationLevel,
            PublicKeyAlgorithmTag		algorithm,
            AsymmetricKeyParameter		pubKey,
            AsymmetricKeyParameter		privKey,
            DateTime					time,
            string						id,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            char[]						passPhrase,
            bool						useSha1,
            PgpSignatureSubpacketVector	hashedPackets,
            PgpSignatureSubpacketVector	unhashedPackets,
            SecureRandom				rand)
            : this(certificationLevel, new PgpKeyPair(algorithm, pubKey, privKey, time), id, encAlgorithm, passPhrase, useSha1, hashedPackets, unhashedPackets, rand)
        {
        }

        /// <summary>
        /// Check if this key has an algorithm type that makes it suitable to use for signing.
        /// </summary>
        /// <remarks>
        /// Note: with version 4 keys KeyFlags subpackets should also be considered when present for
        /// determining the preferred use of the key.
        /// </remarks>
        /// <returns>
        /// <c>true</c> if this key algorithm is suitable for use with signing.
        /// </returns>
        public bool IsSigningKey
        {
            get
            {
                switch (pub.Algorithm)
                {
                    case PublicKeyAlgorithmTag.RsaGeneral:
                    case PublicKeyAlgorithmTag.RsaSign:
                    case PublicKeyAlgorithmTag.Dsa:
                    case PublicKeyAlgorithmTag.ECDsa:
                    case PublicKeyAlgorithmTag.EdDsa:
                    case PublicKeyAlgorithmTag.ElGamalGeneral:
                        return true;
                    default:
                        return false;
                }
            }
        }

        /// <summary>True, if this is a master key.</summary>
        public bool IsMasterKey
        {
            get { return pub.IsMasterKey; }
        }

        /// <summary>Detect if the Secret Key's Private Key is empty or not</summary>
        public bool IsPrivateKeyEmpty
        {
            get
            {
                byte[] secKeyData = secret.GetSecretKeyData();

                return secKeyData == null || secKeyData.Length < 1;
            }
        }

        /// <summary>The algorithm the key is encrypted with.</summary>
        public SymmetricKeyAlgorithmTag KeyEncryptionAlgorithm
        {
            get { return secret.EncAlgorithm; }
        }

        /// <summary>The key ID of the public key associated with this key.</summary>
        public long KeyId
        {
            get { return pub.KeyId; }
        }

        /// <summary>Return the S2K usage associated with this key.</summary>
        public int S2kUsage
        {
            get { return secret.S2kUsage; }
        }

        /// <summary>Return the S2K used to process this key.</summary>
        public S2k S2k
        {
            get { return secret.S2k; }
        }

        /// <summary>The public key associated with this key.</summary>
        public PgpPublicKey PublicKey
        {
            get { return pub; }
        }

        /// <summary>Allows enumeration of any user IDs associated with the key.</summary>
        /// <returns>An <c>IEnumerable</c> of <c>string</c> objects.</returns>
        public IEnumerable<string> UserIds
        {
            get { return pub.GetUserIds(); }
        }

        /// <summary>Allows enumeration of any user attribute vectors associated with the key.</summary>
        /// <returns>An <c>IEnumerable</c> of <c>string</c> objects.</returns>
        public IEnumerable<PgpUserAttributeSubpacketVector> UserAttributes
        {
            get { return pub.GetUserAttributes(); }
        }

        private byte[] ExtractKeyData(byte[] rawPassPhrase, bool clearPassPhrase)
        {
            SymmetricKeyAlgorithmTag encAlgorithm = secret.EncAlgorithm;
            byte[] encData = secret.GetSecretKeyData();

            if (encAlgorithm == SymmetricKeyAlgorithmTag.Null)
                // TODO Check checksum here?
                return encData;

            // TODO Factor this block out as 'decryptData'
            try
            {
                KeyParameter key = PgpUtilities.DoMakeKeyFromPassPhrase(secret.EncAlgorithm, secret.S2k, rawPassPhrase, clearPassPhrase);
                byte[] iv = secret.GetIV();
                byte[] data;

                if (secret.PublicKeyPacket.Version >= 4)
                {
                    data = RecoverKeyData(encAlgorithm, "/CFB/NoPadding", key, iv, encData, 0, encData.Length);

                    bool useSha1 = secret.S2kUsage == SecretKeyPacket.UsageSha1;
                    byte[] check = Checksum(useSha1, data, (useSha1) ? data.Length - 20 : data.Length - 2);

                    for (int i = 0; i != check.Length; i++)
                    {
                        if (check[i] != data[data.Length - check.Length + i])
                        {
                            throw new PgpException("Checksum mismatch at " + i + " of " + check.Length);
                        }
                    }
                }
                else // version 2 or 3, RSA only.
                {
                    data = new byte[encData.Length];

                    iv = Arrays.Clone(iv);

                    //
                    // read in the four numbers
                    //
                    int pos = 0;

                    for (int i = 0; i != 4; i++)
                    {
                        int encLen = ((((encData[pos] & 0xff) << 8) | (encData[pos + 1] & 0xff)) + 7) / 8;

                        data[pos] = encData[pos];
                        data[pos + 1] = encData[pos + 1];
                        pos += 2;

                        if (encLen > (encData.Length - pos))
                            throw new PgpException("out of range encLen found in encData");

                        byte[] tmp = RecoverKeyData(encAlgorithm, "/CFB/NoPadding", key, iv, encData, pos, encLen);
                        Array.Copy(tmp, 0, data, pos, encLen);
                        pos += encLen;

                        if (i != 3)
                        {
                            Array.Copy(encData, pos - iv.Length, iv, 0, iv.Length);
                        }
                    }

                    //
                    // verify and copy checksum
                    //

                    data[pos] = encData[pos];
                    data[pos + 1] = encData[pos + 1];

                    int cs = ((encData[pos] << 8) & 0xff00) | (encData[pos + 1] & 0xff);
                    int calcCs = 0;
                    for (int j = 0; j < pos; j++)
                    {
                        calcCs += data[j] & 0xff;
                    }

                    calcCs &= 0xffff;
                    if (calcCs != cs)
                    {
                        throw new PgpException("Checksum mismatch: passphrase wrong, expected "
                            + cs.ToString("X")
                            + " found " + calcCs.ToString("X"));
                    }
                }

                return data;
            }
            catch (PgpException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new PgpException("Exception decrypting key", e);
            }
        }

        private static byte[] RecoverKeyData(SymmetricKeyAlgorithmTag encAlgorithm, string modeAndPadding,
            KeyParameter key, byte[] iv, byte[] keyData, int keyOff, int keyLen)
        {
            IBufferedCipher c;
            try
            {
                string cName = PgpUtilities.GetSymmetricCipherName(encAlgorithm);
                c = CipherUtilities.GetCipher(cName + modeAndPadding);
            }
            catch (Exception e)
            {
                throw new PgpException("Exception creating cipher", e);
            }

            c.Init(false, new ParametersWithIV(key, iv));

            return c.DoFinal(keyData, keyOff, keyLen);
        }

        /// <summary>Extract a <c>PgpPrivateKey</c> from this secret key's encrypted contents.</summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public PgpPrivateKey ExtractPrivateKey(char[] passPhrase)
        {
            return DoExtractPrivateKey(PgpUtilities.EncodePassPhrase(passPhrase, false), true);
        }

        /// <summary>Extract a <c>PgpPrivateKey</c> from this secret key's encrypted contents.</summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        public PgpPrivateKey ExtractPrivateKeyUtf8(char[] passPhrase)
        {
            return DoExtractPrivateKey(PgpUtilities.EncodePassPhrase(passPhrase, true), true);
        }

        /// <summary>Extract a <c>PgpPrivateKey</c> from this secret key's encrypted contents.</summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public PgpPrivateKey ExtractPrivateKeyRaw(byte[] rawPassPhrase)
        {
            return DoExtractPrivateKey(rawPassPhrase, false);
        }

        internal PgpPrivateKey DoExtractPrivateKey(byte[] rawPassPhrase, bool clearPassPhrase)
        {
            if (IsPrivateKeyEmpty)
                return null;

            PublicKeyPacket pubPk = secret.PublicKeyPacket;
            try
            {
                byte[] data = ExtractKeyData(rawPassPhrase, clearPassPhrase);
                BcpgInputStream bcpgIn = BcpgInputStream.Wrap(new MemoryStream(data, false));
                AsymmetricKeyParameter privateKey;
                switch (pubPk.Algorithm)
                {
                case PublicKeyAlgorithmTag.RsaEncrypt:
                case PublicKeyAlgorithmTag.RsaGeneral:
                case PublicKeyAlgorithmTag.RsaSign:
                    RsaPublicBcpgKey rsaPub = (RsaPublicBcpgKey)pubPk.Key;
                    RsaSecretBcpgKey rsaPriv = new RsaSecretBcpgKey(bcpgIn);
                    RsaPrivateCrtKeyParameters rsaPrivSpec = new RsaPrivateCrtKeyParameters(
                        rsaPriv.Modulus,
                        rsaPub.PublicExponent,
                        rsaPriv.PrivateExponent,
                        rsaPriv.PrimeP,
                        rsaPriv.PrimeQ,
                        rsaPriv.PrimeExponentP,
                        rsaPriv.PrimeExponentQ,
                        rsaPriv.CrtCoefficient);
                    privateKey = rsaPrivSpec;
                    break;
                case PublicKeyAlgorithmTag.Dsa:
                    DsaPublicBcpgKey dsaPub = (DsaPublicBcpgKey)pubPk.Key;
                    DsaSecretBcpgKey dsaPriv = new DsaSecretBcpgKey(bcpgIn);
                    DsaParameters dsaParams = new DsaParameters(dsaPub.P, dsaPub.Q, dsaPub.G);
                    privateKey = new DsaPrivateKeyParameters(dsaPriv.X, dsaParams);
                    break;
                case PublicKeyAlgorithmTag.ECDH:
                    privateKey = GetECKey("ECDH", bcpgIn);
                    break;
                case PublicKeyAlgorithmTag.ECDsa:
                    privateKey = GetECKey("ECDSA", bcpgIn);
                    break;
                case PublicKeyAlgorithmTag.ElGamalEncrypt:
                case PublicKeyAlgorithmTag.ElGamalGeneral:
                    ElGamalPublicBcpgKey elPub = (ElGamalPublicBcpgKey)pubPk.Key;
                    ElGamalSecretBcpgKey elPriv = new ElGamalSecretBcpgKey(bcpgIn);
                    ElGamalParameters elParams = new ElGamalParameters(elPub.P, elPub.G);
                    privateKey = new ElGamalPrivateKeyParameters(elPriv.X, elParams);
                    break;
                default:
                    throw new PgpException("unknown public key algorithm encountered");
                }

                return new PgpPrivateKey(KeyId, pubPk, privateKey);
            }
            catch (PgpException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new PgpException("Exception constructing key", e);
            }
        }

        private ECPrivateKeyParameters GetECKey(string algorithm, BcpgInputStream bcpgIn)
        {
            ECPublicBcpgKey ecdsaPub = (ECPublicBcpgKey)secret.PublicKeyPacket.Key;
            ECSecretBcpgKey ecdsaPriv = new ECSecretBcpgKey(bcpgIn);
            return new ECPrivateKeyParameters(algorithm, ecdsaPriv.X, ecdsaPub.CurveOid);
        }

        private static byte[] Checksum(
            bool	useSha1,
            byte[]	bytes,
            int		length)
        {
            if (useSha1)
            {
                try
                {
                    IDigest dig = DigestUtilities.GetDigest("SHA1");
                    dig.BlockUpdate(bytes, 0, length);
                    return DigestUtilities.DoFinal(dig);
                }
                //catch (NoSuchAlgorithmException e)
                catch (Exception e)
                {
                    throw new PgpException("Can't find SHA-1", e);
                }
            }
            else
            {
                int Checksum = 0;
                for (int i = 0; i != length; i++)
                {
                    Checksum += bytes[i];
                }

                return new byte[] { (byte)(Checksum >> 8), (byte)Checksum };
            }
        }

        public byte[] GetEncoded()
        {
            MemoryStream bOut = new MemoryStream();
            Encode(bOut);
            return bOut.ToArray();
        }

        public void Encode(Stream outStr)
        {
            BcpgOutputStream bcpgOut = BcpgOutputStream.Wrap(outStr);

            bcpgOut.WritePacket(secret);
            if (pub.trustPk != null)
            {
                bcpgOut.WritePacket(pub.trustPk);
            }

            if (pub.subSigs == null) // is not a sub key
            {
                foreach (PgpSignature keySig in pub.keySigs)
                {
                    keySig.Encode(bcpgOut);
                }

                for (int i = 0; i != pub.ids.Count; i++)
                {
                    object pubID = pub.ids[i];
                    if (pubID is string id)
                    {
                        bcpgOut.WritePacket(new UserIdPacket(id));
                    }
                    else if (pubID is PgpUserAttributeSubpacketVector v)
                    {
                        bcpgOut.WritePacket(new UserAttributePacket(v.ToSubpacketArray()));
                    }
                    else
                    {
                        throw new InvalidOperationException();
                    }

                    var trustPacket = pub.idTrusts[i];
                    if (trustPacket != null)
                    {
                        bcpgOut.WritePacket(trustPacket);
                    }

                    foreach (PgpSignature sig in pub.idSigs[i])
                    {
                        sig.Encode(bcpgOut);
                    }
                }
            }
            else
            {
                foreach (PgpSignature subSig in pub.subSigs)
                {
                    subSig.Encode(bcpgOut);
                }
            }

            // TODO Check that this is right/necessary
            //bcpgOut.Finish();
        }

        /// <summary>
        /// Return a copy of the passed in secret key, encrypted using a new password
        /// and the passed in algorithm.
        /// </summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        /// <param name="key">The PgpSecretKey to be copied.</param>
        /// <param name="oldPassPhrase">The current password for the key.</param>
        /// <param name="newPassPhrase">The new password for the key.</param>
        /// <param name="newEncAlgorithm">The algorithm to be used for the encryption.</param>
        /// <param name="rand">Source of randomness.</param>
        public static PgpSecretKey CopyWithNewPassword(
            PgpSecretKey				key,
            char[]						oldPassPhrase,
            char[]						newPassPhrase,
            SymmetricKeyAlgorithmTag	newEncAlgorithm,
            SecureRandom				rand)
        {
            return DoCopyWithNewPassword(key, PgpUtilities.EncodePassPhrase(oldPassPhrase, false),
                PgpUtilities.EncodePassPhrase(newPassPhrase, false), true, newEncAlgorithm, rand);
        }

        /// <summary>
        /// Return a copy of the passed in secret key, encrypted using a new password
        /// and the passed in algorithm.
        /// </summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        /// <param name="key">The PgpSecretKey to be copied.</param>
        /// <param name="oldPassPhrase">The current password for the key.</param>
        /// <param name="newPassPhrase">The new password for the key.</param>
        /// <param name="newEncAlgorithm">The algorithm to be used for the encryption.</param>
        /// <param name="rand">Source of randomness.</param>
        public static PgpSecretKey CopyWithNewPasswordUtf8(
            PgpSecretKey				key,
            char[]						oldPassPhrase,
            char[]						newPassPhrase,
            SymmetricKeyAlgorithmTag	newEncAlgorithm,
            SecureRandom				rand)
        {
            return DoCopyWithNewPassword(key, PgpUtilities.EncodePassPhrase(oldPassPhrase, true),
                PgpUtilities.EncodePassPhrase(newPassPhrase, true), true, newEncAlgorithm, rand);
        }

        /// <summary>
        /// Return a copy of the passed in secret key, encrypted using a new password
        /// and the passed in algorithm.
        /// </summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        /// <param name="key">The PgpSecretKey to be copied.</param>
        /// <param name="rawOldPassPhrase">The current password for the key.</param>
        /// <param name="rawNewPassPhrase">The new password for the key.</param>
        /// <param name="newEncAlgorithm">The algorithm to be used for the encryption.</param>
        /// <param name="rand">Source of randomness.</param>
        public static PgpSecretKey CopyWithNewPasswordRaw(
            PgpSecretKey				key,
            byte[]						rawOldPassPhrase,
            byte[]						rawNewPassPhrase,
            SymmetricKeyAlgorithmTag	newEncAlgorithm,
            SecureRandom				rand)
        {
            return DoCopyWithNewPassword(key, rawOldPassPhrase, rawNewPassPhrase, false, newEncAlgorithm, rand);
        }

        internal static PgpSecretKey DoCopyWithNewPassword(
            PgpSecretKey				key,
            byte[]						rawOldPassPhrase,
            byte[]						rawNewPassPhrase,
            bool                        clearPassPhrase,
            SymmetricKeyAlgorithmTag	newEncAlgorithm,
            SecureRandom				rand)
        {
            if (key.IsPrivateKeyEmpty)
                throw new PgpException("no private key in this SecretKey - public key present only.");

            byte[]	rawKeyData = key.ExtractKeyData(rawOldPassPhrase, clearPassPhrase);
            int		s2kUsage = key.secret.S2kUsage;
            byte[]	iv = null;
            S2k		s2k = null;
            byte[]	keyData;
            PublicKeyPacket pubKeyPacket = key.secret.PublicKeyPacket;

            if (newEncAlgorithm == SymmetricKeyAlgorithmTag.Null)
            {
                s2kUsage = SecretKeyPacket.UsageNone;
                if (key.secret.S2kUsage == SecretKeyPacket.UsageSha1)   // SHA-1 hash, need to rewrite Checksum
                {
                    keyData = new byte[rawKeyData.Length - 18];

                    Array.Copy(rawKeyData, 0, keyData, 0, keyData.Length - 2);

                    byte[] check = Checksum(false, keyData, keyData.Length - 2);

                    keyData[keyData.Length - 2] = check[0];
                    keyData[keyData.Length - 1] = check[1];
                }
                else
                {
                    keyData = rawKeyData;
                }
            }
            else
            {
                if (s2kUsage == SecretKeyPacket.UsageNone)
                {
                    s2kUsage = SecretKeyPacket.UsageChecksum;
                }

                try
                {
                    if (pubKeyPacket.Version >= 4)
                    {
                        keyData = EncryptKeyDataV4(rawKeyData, newEncAlgorithm, HashAlgorithmTag.Sha1, rawNewPassPhrase, clearPassPhrase, rand, out s2k, out iv);
                    }
                    else
                    {
                        keyData = EncryptKeyDataV3(rawKeyData, newEncAlgorithm, rawNewPassPhrase, clearPassPhrase, rand, out s2k, out iv);
                    }
                }
                catch (PgpException e)
                {
                    throw e;
                }
                catch (Exception e)
                {
                    throw new PgpException("Exception encrypting key", e);
                }
            }

            SecretKeyPacket secret;
            if (key.secret is SecretSubkeyPacket)
            {
                secret = new SecretSubkeyPacket(pubKeyPacket, newEncAlgorithm, s2kUsage, s2k, iv, keyData);
            }
            else
            {
                secret = new SecretKeyPacket(pubKeyPacket, newEncAlgorithm, s2kUsage, s2k, iv, keyData);
            }

            return new PgpSecretKey(secret, key.pub);
        }

        /// <summary>Replace the passed the public key on the passed in secret key.</summary>
        /// <param name="secretKey">Secret key to change.</param>
        /// <param name="publicKey">New public key.</param>
        /// <returns>A new secret key.</returns>
        /// <exception cref="ArgumentException">If KeyId's do not match.</exception>
        public static PgpSecretKey ReplacePublicKey(
            PgpSecretKey	secretKey,
            PgpPublicKey	publicKey)
        {
            if (publicKey.KeyId != secretKey.KeyId)
                throw new ArgumentException("KeyId's do not match");

            return new PgpSecretKey(secretKey.secret, publicKey);
        }

        private static byte[] EncryptKeyDataV3(
            byte[]						rawKeyData,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            byte[]						rawPassPhrase,
            bool                        clearPassPhrase,
            SecureRandom				random,
            out S2k						s2k,
            out byte[]					iv)
        {
            // Version 2 or 3 - RSA Keys only

            s2k = null;
            iv = null;

            KeyParameter encKey = PgpUtilities.DoMakeKeyFromPassPhrase(encAlgorithm, s2k, rawPassPhrase, clearPassPhrase);

            byte[] keyData = new byte[rawKeyData.Length];

            //
            // process 4 numbers
            //
            int pos = 0;
            for (int i = 0; i != 4; i++)
            {
                int encLen = ((((rawKeyData[pos] & 0xff) << 8) | (rawKeyData[pos + 1] & 0xff)) + 7) / 8;

                keyData[pos] = rawKeyData[pos];
                keyData[pos + 1] = rawKeyData[pos + 1];

                if (encLen > (rawKeyData.Length - (pos + 2)))
                    throw new PgpException("out of range encLen found in rawKeyData");

                byte[] tmp;
                if (i == 0)
                {
                    tmp = EncryptData(encAlgorithm, encKey, rawKeyData, pos + 2, encLen, random, ref iv);
                }
                else
                {
                    byte[] tmpIv = Arrays.CopyOfRange(keyData, pos - iv.Length, pos);

                    tmp = EncryptData(encAlgorithm, encKey, rawKeyData, pos + 2, encLen, random, ref tmpIv);
                }

                Array.Copy(tmp, 0, keyData, pos + 2, tmp.Length);
                pos += 2 + encLen;
            }

            //
            // copy in checksum.
            //
            keyData[pos] = rawKeyData[pos];
            keyData[pos + 1] = rawKeyData[pos + 1];

            return keyData;
        }

        private static byte[] EncryptKeyDataV4(
            byte[]						rawKeyData,
            SymmetricKeyAlgorithmTag	encAlgorithm,
            HashAlgorithmTag            hashAlgorithm,
            byte[]						rawPassPhrase,
            bool                        clearPassPhrase,
            SecureRandom				random,
            out S2k						s2k,
            out byte[]					iv)
        {
            s2k = PgpUtilities.GenerateS2k(hashAlgorithm, 0x60, random);

            KeyParameter key = PgpUtilities.DoMakeKeyFromPassPhrase(encAlgorithm, s2k, rawPassPhrase, clearPassPhrase);

            iv = null;
            return EncryptData(encAlgorithm, key, rawKeyData, 0, rawKeyData.Length, random, ref iv);
        }

        private static byte[] EncryptData(
            SymmetricKeyAlgorithmTag	encAlgorithm,
            KeyParameter                key,
            byte[]						data,
            int                         dataOff,
            int                         dataLen,
            SecureRandom				random,
            ref byte[]                  iv)
        {
            IBufferedCipher c;
            try
            {
                string cName = PgpUtilities.GetSymmetricCipherName(encAlgorithm);
                c = CipherUtilities.GetCipher(cName + "/CFB/NoPadding");
            }
            catch (Exception e)
            {
                throw new PgpException("Exception creating cipher", e);
            }

            if (iv == null)
            {
                iv = PgpUtilities.GenerateIV(c.GetBlockSize(), random);
            }

            c.Init(true, new ParametersWithRandom(new ParametersWithIV(key, iv), random));

            return c.DoFinal(data, dataOff, dataLen);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys associating it with the passed in public key.
        /// </summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExpr(Stream inputStream, char[] passPhrase, PgpPublicKey pubKey)
        {
            return DoParseSecretKeyFromSExpr(inputStream, PgpUtilities.EncodePassPhrase(passPhrase, false), true, pubKey);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys associating it with the passed in public key.
        /// </summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExprUtf8(Stream inputStream, char[] passPhrase, PgpPublicKey pubKey)
        {
            return DoParseSecretKeyFromSExpr(inputStream, PgpUtilities.EncodePassPhrase(passPhrase, true), true, pubKey);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys associating it with the passed in public key.
        /// </summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExprRaw(Stream inputStream, byte[] rawPassPhrase, PgpPublicKey pubKey)
        {
            return DoParseSecretKeyFromSExpr(inputStream, rawPassPhrase, false, pubKey);
        }

        internal static PgpSecretKey DoParseSecretKeyFromSExpr(Stream inputStream, byte[] rawPassPhrase, bool clearPassPhrase, PgpPublicKey pubKey)
        {
            SXprUtilities.SkipOpenParenthesis(inputStream);

            string type = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
            if (type.Equals("protected-private-key"))
            {
                SXprUtilities.SkipOpenParenthesis(inputStream);

                string curveName;

                string keyType = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                if (keyType.Equals("ecc"))
                {
                    SXprUtilities.SkipOpenParenthesis(inputStream);

                    string curveID = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                    curveName = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());

                    SXprUtilities.SkipCloseParenthesis(inputStream);
                }
                else
                {
                    throw new PgpException("no curve details found");
                }

                byte[] qVal;

                SXprUtilities.SkipOpenParenthesis(inputStream);

                type = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                if (type.Equals("q"))
                {
                    qVal = SXprUtilities.ReadBytes(inputStream, inputStream.ReadByte());
                }
                else
                {
                    throw new PgpException("no q value found");
                }

                SXprUtilities.SkipCloseParenthesis(inputStream);

                byte[] dValue = GetDValue(inputStream, rawPassPhrase, clearPassPhrase, curveName);
                // TODO: check SHA-1 hash.

                return new PgpSecretKey(new SecretKeyPacket(pubKey.PublicKeyPacket, SymmetricKeyAlgorithmTag.Null, null, null,
                    new ECSecretBcpgKey(new BigInteger(1, dValue)).GetEncoded()), pubKey);
            }

            throw new PgpException("unknown key type found");
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys.
        /// </summary>
        /// <remarks>
        /// Conversion of the passphrase characters to bytes is performed using Convert.ToByte(), which is
        /// the historical behaviour of the library (1.7 and earlier).
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExpr(Stream inputStream, char[] passPhrase)
        {
            return DoParseSecretKeyFromSExpr(inputStream, PgpUtilities.EncodePassPhrase(passPhrase, false), true);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys.
        /// </summary>
        /// <remarks>
        /// The passphrase is encoded to bytes using UTF8 (Encoding.UTF8.GetBytes).
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExprUtf8(Stream inputStream, char[] passPhrase)
        {
            return DoParseSecretKeyFromSExpr(inputStream, PgpUtilities.EncodePassPhrase(passPhrase, true), true);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys.
        /// </summary>
        /// <remarks>
        /// Allows the caller to handle the encoding of the passphrase to bytes.
        /// </remarks>
        public static PgpSecretKey ParseSecretKeyFromSExprRaw(Stream inputStream, byte[] rawPassPhrase)
        {
            return DoParseSecretKeyFromSExpr(inputStream, rawPassPhrase, false);
        }

        /// <summary>
        /// Parse a secret key from one of the GPG S expression keys.
        /// </summary>
        internal static PgpSecretKey DoParseSecretKeyFromSExpr(Stream inputStream, byte[] rawPassPhrase, bool clearPassPhrase)
        {
            SXprUtilities.SkipOpenParenthesis(inputStream);

            string type = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
            if (type.Equals("protected-private-key"))
            {
                SXprUtilities.SkipOpenParenthesis(inputStream);

                string curveName;

                string keyType = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                if (keyType.Equals("ecc"))
                {
                    SXprUtilities.SkipOpenParenthesis(inputStream);

                    string curveID = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                    curveName = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());

                    if (Platform.StartsWith(curveName, "NIST "))
                    {
                        curveName = curveName.Substring("NIST ".Length);
                    }

                    SXprUtilities.SkipCloseParenthesis(inputStream);
                }
                else
                {
                    throw new PgpException("no curve details found");
                }

                byte[] qVal;

                SXprUtilities.SkipOpenParenthesis(inputStream);

                type = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
                if (type.Equals("q"))
                {
                    qVal = SXprUtilities.ReadBytes(inputStream, inputStream.ReadByte());
                }
                else
                {
                    throw new PgpException("no q value found");
                }

                PublicKeyPacket pubPacket = new PublicKeyPacket(PublicKeyAlgorithmTag.ECDsa, DateTime.UtcNow,
                    new ECDsaPublicBcpgKey(ECNamedCurveTable.GetOid(curveName), new BigInteger(1, qVal)));

                SXprUtilities.SkipCloseParenthesis(inputStream);

                byte[] dValue = GetDValue(inputStream, rawPassPhrase, clearPassPhrase, curveName);
                // TODO: check SHA-1 hash.

                return new PgpSecretKey(new SecretKeyPacket(pubPacket, SymmetricKeyAlgorithmTag.Null, null, null,
                    new ECSecretBcpgKey(new BigInteger(1, dValue)).GetEncoded()), new PgpPublicKey(pubPacket));
            }

            throw new PgpException("unknown key type found");
        }

        private static byte[] GetDValue(Stream inputStream, byte[] rawPassPhrase, bool clearPassPhrase, string curveName)
        {
            string type;
            SXprUtilities.SkipOpenParenthesis(inputStream);

            string protection;
            S2k s2k;
            byte[] iv;
            byte[] secKeyData;

            type = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());
            if (type.Equals("protected"))
            {
                protection = SXprUtilities.ReadString(inputStream, inputStream.ReadByte());

                SXprUtilities.SkipOpenParenthesis(inputStream);

                s2k = SXprUtilities.ParseS2k(inputStream);

                iv = SXprUtilities.ReadBytes(inputStream, inputStream.ReadByte());

                SXprUtilities.SkipCloseParenthesis(inputStream);

                secKeyData = SXprUtilities.ReadBytes(inputStream, inputStream.ReadByte());
            }
            else
            {
                throw new PgpException("protected block not found");
            }

            // TODO: recognise other algorithms
            KeyParameter key = PgpUtilities.DoMakeKeyFromPassPhrase(SymmetricKeyAlgorithmTag.Aes128, s2k, rawPassPhrase, clearPassPhrase);

            byte[] data = RecoverKeyData(SymmetricKeyAlgorithmTag.Aes128, "/CBC/NoPadding", key, iv, secKeyData, 0, secKeyData.Length);

            //
            // parse the secret key S-expr
            //
            Stream keyIn = new MemoryStream(data, false);

            SXprUtilities.SkipOpenParenthesis(keyIn);
            SXprUtilities.SkipOpenParenthesis(keyIn);
            SXprUtilities.SkipOpenParenthesis(keyIn);
            string name = SXprUtilities.ReadString(keyIn, keyIn.ReadByte());
            return SXprUtilities.ReadBytes(keyIn, keyIn.ReadByte());
        }
    }
}
