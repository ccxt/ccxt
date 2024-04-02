using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class RsaDigestSigner
        : ISigner
    {
        private readonly IAsymmetricBlockCipher rsaEngine;
        private readonly AlgorithmIdentifier algId;
        private readonly IDigest digest;
        private bool forSigning;

        private static readonly IDictionary<string, DerObjectIdentifier> OidMap =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// Load oid table.
        /// </summary>
        static RsaDigestSigner()
        {
            OidMap["RIPEMD128"] = TeleTrusTObjectIdentifiers.RipeMD128;
            OidMap["RIPEMD160"] = TeleTrusTObjectIdentifiers.RipeMD160;
            OidMap["RIPEMD256"] = TeleTrusTObjectIdentifiers.RipeMD256;

            OidMap["SHA-1"] = X509ObjectIdentifiers.IdSha1;
            OidMap["SHA-224"] = NistObjectIdentifiers.IdSha224;
            OidMap["SHA-256"] = NistObjectIdentifiers.IdSha256;
            OidMap["SHA-384"] = NistObjectIdentifiers.IdSha384;
            OidMap["SHA-512"] = NistObjectIdentifiers.IdSha512;
            OidMap["SHA-512/224"] = NistObjectIdentifiers.IdSha512_224;
            OidMap["SHA-512/256"] = NistObjectIdentifiers.IdSha512_256;
            OidMap["SHA3-224"] = NistObjectIdentifiers.IdSha3_224;
            OidMap["SHA3-256"] = NistObjectIdentifiers.IdSha3_256;
            OidMap["SHA3-384"] = NistObjectIdentifiers.IdSha3_384;
            OidMap["SHA3-512"] = NistObjectIdentifiers.IdSha3_512;

            OidMap["MD2"] = PkcsObjectIdentifiers.MD2;
            OidMap["MD4"] = PkcsObjectIdentifiers.MD4;
            OidMap["MD5"] = PkcsObjectIdentifiers.MD5;
        }

        public RsaDigestSigner(IDigest digest)
            :   this(digest, CollectionUtilities.GetValueOrNull(OidMap, digest.AlgorithmName))
        {
        }

        public RsaDigestSigner(IDigest digest, DerObjectIdentifier digestOid)
            :   this(digest, new AlgorithmIdentifier(digestOid, DerNull.Instance))
        {
        }

        public RsaDigestSigner(IDigest digest, AlgorithmIdentifier algId)
            :   this(new RsaCoreEngine(), digest, algId)
        {
        }

        public RsaDigestSigner(IRsa rsa, IDigest digest, DerObjectIdentifier digestOid)
            :   this(rsa, digest, new AlgorithmIdentifier(digestOid, DerNull.Instance))
        {
        }

        public RsaDigestSigner(IRsa rsa, IDigest digest, AlgorithmIdentifier algId)
            :   this(new RsaBlindedEngine(rsa), digest, algId)
        {
        }

        public RsaDigestSigner(IAsymmetricBlockCipher rsaEngine, IDigest digest, AlgorithmIdentifier algId)
        {
            this.rsaEngine = new Pkcs1Encoding(rsaEngine);
            this.digest = digest;
            this.algId = algId;
        }

        public virtual string AlgorithmName
        {
            get { return digest.AlgorithmName + "withRSA"; }
        }

        /**
         * Initialise the signer for signing or verification.
         *
         * @param forSigning true if for signing, false otherwise
         * @param param necessary parameters.
         */
        public virtual void Init(
            bool				forSigning,
            ICipherParameters	parameters)
        {
            this.forSigning = forSigning;
            AsymmetricKeyParameter k;

            if (parameters is ParametersWithRandom)
            {
                k = (AsymmetricKeyParameter)((ParametersWithRandom)parameters).Parameters;
            }
            else
            {
                k = (AsymmetricKeyParameter)parameters;
            }

            if (forSigning && !k.IsPrivate)
                throw new InvalidKeyException("Signing requires private key.");

            if (!forSigning && k.IsPrivate)
                throw new InvalidKeyException("Verification requires public key.");

            Reset();

            rsaEngine.Init(forSigning, parameters);
        }

        public virtual void Update(byte input)
        {
            digest.Update(input);
        }

        public virtual void BlockUpdate(byte[] input, int inOff, int inLen)
        {
            digest.BlockUpdate(input, inOff, inLen);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            digest.BlockUpdate(input);
        }
#endif

        public virtual byte[] GenerateSignature()
        {
            if (!forSigning)
                throw new InvalidOperationException("RsaDigestSigner not initialised for signature generation.");

            byte[] hash = new byte[digest.GetDigestSize()];
            digest.DoFinal(hash, 0);

            byte[] data = DerEncode(hash);
            return rsaEngine.ProcessBlock(data, 0, data.Length);
        }

        public virtual bool VerifySignature(byte[] signature)
        {
            if (forSigning)
                throw new InvalidOperationException("RsaDigestSigner not initialised for verification");

            byte[] hash = new byte[digest.GetDigestSize()];
            digest.DoFinal(hash, 0);

            byte[] sig;
            byte[] expected;

            try
            {
                sig = rsaEngine.ProcessBlock(signature, 0, signature.Length);
                expected = DerEncode(hash);
            }
            catch (Exception)
            {
                return false;
            }

            if (sig.Length == expected.Length)
            {
                return Arrays.ConstantTimeAreEqual(sig, expected);
            }
            else if (sig.Length == expected.Length - 2)  // NULL left out
            {
                int sigOffset = sig.Length - hash.Length - 2;
                int expectedOffset = expected.Length - hash.Length - 2;

                expected[1] -= 2;      // adjust lengths
                expected[3] -= 2;

                int nonEqual = 0;

                for (int i = 0; i < hash.Length; i++)
                {
                    nonEqual |= (sig[sigOffset + i] ^ expected[expectedOffset + i]);
                }

                for (int i = 0; i < sigOffset; i++)
                {
                    nonEqual |= (sig[i] ^ expected[i]);  // check header less NULL
                }

                return nonEqual == 0;
            }
            else
            {
                return false;
            }
        }

        public virtual void Reset()
        {
            digest.Reset();
        }

        private byte[] DerEncode(byte[] hash)
        {
            if (algId == null)
            {
                // For raw RSA, the DigestInfo must be prepared externally
                return hash;
            }

            DigestInfo dInfo = new DigestInfo(algId, hash);

            return dInfo.GetDerEncoded();
        }
    }
}
