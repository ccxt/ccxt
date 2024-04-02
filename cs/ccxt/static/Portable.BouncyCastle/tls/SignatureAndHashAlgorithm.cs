using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    /// <summary>RFC 5246 7.4.1.4.1</summary>
    public sealed class SignatureAndHashAlgorithm
    {
        public static readonly SignatureAndHashAlgorithm ecdsa_brainpoolP256r1tls13_sha256 =
            Create(SignatureScheme.ecdsa_brainpoolP256r1tls13_sha256);
        public static readonly SignatureAndHashAlgorithm ecdsa_brainpoolP384r1tls13_sha384 =
            Create(SignatureScheme.ecdsa_brainpoolP384r1tls13_sha384);
        public static readonly SignatureAndHashAlgorithm ecdsa_brainpoolP512r1tls13_sha512 =
            Create(SignatureScheme.ecdsa_brainpoolP512r1tls13_sha512);
        public static readonly SignatureAndHashAlgorithm ed25519 =
            Create(SignatureScheme.ed25519);
        public static readonly SignatureAndHashAlgorithm ed448 =
            Create(SignatureScheme.ed448);
        public static readonly SignatureAndHashAlgorithm gostr34102012_256 =
            Create(HashAlgorithm.Intrinsic, SignatureAlgorithm.gostr34102012_256);
        public static readonly SignatureAndHashAlgorithm gostr34102012_512 =
            Create(HashAlgorithm.Intrinsic, SignatureAlgorithm.gostr34102012_512);
        public static readonly SignatureAndHashAlgorithm rsa_pss_rsae_sha256 =
            Create(SignatureScheme.rsa_pss_rsae_sha256);
        public static readonly SignatureAndHashAlgorithm rsa_pss_rsae_sha384 =
            Create(SignatureScheme.rsa_pss_rsae_sha384);
        public static readonly SignatureAndHashAlgorithm rsa_pss_rsae_sha512 =
            Create(SignatureScheme.rsa_pss_rsae_sha512);
        public static readonly SignatureAndHashAlgorithm rsa_pss_pss_sha256 =
            Create(SignatureScheme.rsa_pss_pss_sha256);
        public static readonly SignatureAndHashAlgorithm rsa_pss_pss_sha384 =
            Create(SignatureScheme.rsa_pss_pss_sha384);
        public static readonly SignatureAndHashAlgorithm rsa_pss_pss_sha512 =
            Create(SignatureScheme.rsa_pss_pss_sha512);

        public static SignatureAndHashAlgorithm GetInstance(short hashAlgorithm, short signatureAlgorithm)
        {
            switch (hashAlgorithm)
            {
            case HashAlgorithm.Intrinsic:
                return GetInstanceIntrinsic(signatureAlgorithm);
            default:
                return Create(hashAlgorithm, signatureAlgorithm);
            }
        }

        private static SignatureAndHashAlgorithm GetInstanceIntrinsic(short signatureAlgorithm)
        {
            switch (signatureAlgorithm)
            {
            case SignatureAlgorithm.ed25519:
                return ed25519;
            case SignatureAlgorithm.ed448:
                return ed448;
            case SignatureAlgorithm.gostr34102012_256:
                return gostr34102012_256;
            case SignatureAlgorithm.gostr34102012_512:
                return gostr34102012_512;
            case SignatureAlgorithm.rsa_pss_rsae_sha256:
                return rsa_pss_rsae_sha256;
            case SignatureAlgorithm.rsa_pss_rsae_sha384:
                return rsa_pss_rsae_sha384;
            case SignatureAlgorithm.rsa_pss_rsae_sha512:
                return rsa_pss_rsae_sha512;
            case SignatureAlgorithm.rsa_pss_pss_sha256:
                return rsa_pss_pss_sha256;
            case SignatureAlgorithm.rsa_pss_pss_sha384:
                return rsa_pss_pss_sha384;
            case SignatureAlgorithm.rsa_pss_pss_sha512:
                return rsa_pss_pss_sha512;
            case SignatureAlgorithm.ecdsa_brainpoolP256r1tls13_sha256:
                return ecdsa_brainpoolP256r1tls13_sha256;
            case SignatureAlgorithm.ecdsa_brainpoolP384r1tls13_sha384:
                return ecdsa_brainpoolP384r1tls13_sha384;
            case SignatureAlgorithm.ecdsa_brainpoolP512r1tls13_sha512:
                return ecdsa_brainpoolP512r1tls13_sha512;
            default:
                return Create(HashAlgorithm.Intrinsic, signatureAlgorithm);
            }
        }

        private static SignatureAndHashAlgorithm Create(int signatureScheme)
        {
            short hashAlgorithm = SignatureScheme.GetHashAlgorithm(signatureScheme);
            short signatureAlgorithm = SignatureScheme.GetSignatureAlgorithm(signatureScheme);
            return Create(hashAlgorithm, signatureAlgorithm);
        }

        private static SignatureAndHashAlgorithm Create(short hashAlgorithm, short signatureAlgorithm)
        {
            return new SignatureAndHashAlgorithm(hashAlgorithm, signatureAlgorithm);
        }

        private readonly short m_hash;
        private readonly short m_signature;

        /// <param name="hash"><see cref="HashAlgorithm"/></param>
        /// <param name="signature"><see cref="SignatureAlgorithm"/></param>
        public SignatureAndHashAlgorithm(short hash, short signature)
        {
            /*
             * TODO]tls] The TlsUtils methods are inlined here to avoid circular static initialization
             * b/w these classes. We should refactor parts of TlsUtils into separate classes. e.g. the
             * TLS low-level encoding methods, and/or the SigAndHash registry and methods.
             */

            //if (!TlsUtilities.IsValidUint8(hash))
            if ((hash & 0xFF) != hash)
                throw new ArgumentException("should be a uint8", "hash");

            //if (!TlsUtilities.IsValidUint8(signature))
            if ((signature & 0xFF) != signature)
                throw new ArgumentException("should be a uint8", "signature");

            this.m_hash = hash;
            this.m_signature = signature;
        }

        /// <returns><see cref="HashAlgorithm"/></returns>
        public short Hash
        {
            get { return m_hash; }
        }

        /// <returns><see cref="SignatureAlgorithm"/></returns>
        public short Signature
        {
            get { return m_signature; }
        }

        /// <summary>Encode this <see cref="SignatureAndHashAlgorithm"/> to a <see cref="Stream"/>.</summary>
        /// <param name="output">the <see cref="Stream"/> to encode to.</param>
        /// <exception cref="IOException"/>
        public void Encode(Stream output)
        {
            TlsUtilities.WriteUint8(Hash, output);
            TlsUtilities.WriteUint8(Signature, output);
        }

        /// <summary>Parse a <see cref="SignatureAndHashAlgorithm"/> from a <see cref="Stream"/>.</summary>
        /// <param name="input">the <see cref="Stream"/> to parse from.</param>
        /// <returns>a <see cref="SignatureAndHashAlgorithm"/> object.</returns>
        /// <exception cref="IOException"/>
        public static SignatureAndHashAlgorithm Parse(Stream input)
        {
            short hash = TlsUtilities.ReadUint8(input);
            short signature = TlsUtilities.ReadUint8(input);

            return GetInstance(hash, signature);
        }

        public override bool Equals(object obj)
        {
            if (!(obj is SignatureAndHashAlgorithm))
                return false;

            SignatureAndHashAlgorithm other = (SignatureAndHashAlgorithm)obj;
            return other.Hash == Hash && other.Signature == Signature;
        }

        public override int GetHashCode()
        {
            return ((int)Hash << 16) | (int)Signature;
        }

        public override string ToString()
        {
            return "{" + HashAlgorithm.GetText(Hash) + "," + SignatureAlgorithm.GetText(Signature) + "}";
        }
    }
}
