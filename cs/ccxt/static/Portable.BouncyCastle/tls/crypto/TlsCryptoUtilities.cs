using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Tls.Crypto
{
    public abstract class TlsCryptoUtilities
    {
        // "tls13 "
        private static readonly byte[] Tls13Prefix = new byte[] { 0x74, 0x6c, 0x73, 0x31, 0x33, 0x20 };

        public static int GetHash(short hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
            case HashAlgorithm.md5:
                return CryptoHashAlgorithm.md5;
            case HashAlgorithm.sha1:
                return CryptoHashAlgorithm.sha1;
            case HashAlgorithm.sha224:
                return CryptoHashAlgorithm.sha224;
            case HashAlgorithm.sha256:
                return CryptoHashAlgorithm.sha256;
            case HashAlgorithm.sha384:
                return CryptoHashAlgorithm.sha384;
            case HashAlgorithm.sha512:
                return CryptoHashAlgorithm.sha512;
            default:
                throw new ArgumentException("specified HashAlgorithm invalid: " + HashAlgorithm.GetText(hashAlgorithm));
            }
        }

        public static int GetHashForHmac(int macAlgorithm)
        {
            switch (macAlgorithm)
            {
            case MacAlgorithm.hmac_md5:
                return CryptoHashAlgorithm.md5;
            case MacAlgorithm.hmac_sha1:
                return CryptoHashAlgorithm.sha1;
            case MacAlgorithm.hmac_sha256:
                return CryptoHashAlgorithm.sha256;
            case MacAlgorithm.hmac_sha384:
                return CryptoHashAlgorithm.sha384;
            case MacAlgorithm.hmac_sha512:
                return CryptoHashAlgorithm.sha512;
            default:
                throw new ArgumentException("specified MacAlgorithm not an HMAC: " + MacAlgorithm.GetText(macAlgorithm));
            }
        }

        public static int GetHashForPrf(int prfAlgorithm)
        {
            switch (prfAlgorithm)
            {
            case PrfAlgorithm.ssl_prf_legacy:
            case PrfAlgorithm.tls_prf_legacy:
                throw new ArgumentException("legacy PRF not a valid algorithm");
            case PrfAlgorithm.tls_prf_sha256:
            case PrfAlgorithm.tls13_hkdf_sha256:
                return CryptoHashAlgorithm.sha256;
            case PrfAlgorithm.tls_prf_sha384:
            case PrfAlgorithm.tls13_hkdf_sha384:
                return CryptoHashAlgorithm.sha384;
            case PrfAlgorithm.tls13_hkdf_sm3:
                return CryptoHashAlgorithm.sm3;
            default:
                throw new ArgumentException("unknown PrfAlgorithm: " + PrfAlgorithm.GetText(prfAlgorithm));
            }
        }

        public static int GetHashInternalSize(int cryptoHashAlgorithm)
        {
            switch (cryptoHashAlgorithm)
            {
            case CryptoHashAlgorithm.md5:
            case CryptoHashAlgorithm.sha1:
            case CryptoHashAlgorithm.sha224:
            case CryptoHashAlgorithm.sha256:
            case CryptoHashAlgorithm.sm3:
                return 64;
            case CryptoHashAlgorithm.sha384:
            case CryptoHashAlgorithm.sha512:
                return 128;
            default:
                throw new ArgumentException();
            }
        }

        public static int GetHashOutputSize(int cryptoHashAlgorithm)
        {
            switch (cryptoHashAlgorithm)
            {
            case CryptoHashAlgorithm.md5:
                return 16;
            case CryptoHashAlgorithm.sha1:
                return 20;
            case CryptoHashAlgorithm.sha224:
                return 28;
            case CryptoHashAlgorithm.sha256:
            case CryptoHashAlgorithm.sm3:
                return 32;
            case CryptoHashAlgorithm.sha384:
                return 48;
            case CryptoHashAlgorithm.sha512:
                return 64;
            default:
                throw new ArgumentException();
            }
        }

        public static DerObjectIdentifier GetOidForHash(int cryptoHashAlgorithm)
        {
            switch (cryptoHashAlgorithm)
            {
            case CryptoHashAlgorithm.md5:
                return PkcsObjectIdentifiers.MD5;
            case CryptoHashAlgorithm.sha1:
                return X509ObjectIdentifiers.IdSha1;
            case CryptoHashAlgorithm.sha224:
                return NistObjectIdentifiers.IdSha224;
            case CryptoHashAlgorithm.sha256:
                return NistObjectIdentifiers.IdSha256;
            case CryptoHashAlgorithm.sha384:
                return NistObjectIdentifiers.IdSha384;
            case CryptoHashAlgorithm.sha512:
                return NistObjectIdentifiers.IdSha512;
            // TODO[RFC 8998]
            //case CryptoHashAlgorithm.sm3:
            //    return GMObjectIdentifiers.sm3;
            default:
                throw new ArgumentException();
            }
        }

        public static int GetSignature(short signatureAlgorithm)
        {
            switch (signatureAlgorithm)
            {
            case SignatureAlgorithm.rsa:
                return CryptoSignatureAlgorithm.rsa;
            case SignatureAlgorithm.dsa:
                return CryptoSignatureAlgorithm.dsa;
            case SignatureAlgorithm.ecdsa:
                return CryptoSignatureAlgorithm.ecdsa;
            case SignatureAlgorithm.rsa_pss_rsae_sha256:
                return CryptoSignatureAlgorithm.rsa_pss_rsae_sha256;
            case SignatureAlgorithm.rsa_pss_rsae_sha384:
                return CryptoSignatureAlgorithm.rsa_pss_rsae_sha384;
            case SignatureAlgorithm.rsa_pss_rsae_sha512:
                return CryptoSignatureAlgorithm.rsa_pss_rsae_sha512;
            case SignatureAlgorithm.ed25519:
                return CryptoSignatureAlgorithm.ed25519;
            case SignatureAlgorithm.ed448:
                return CryptoSignatureAlgorithm.ed448;
            case SignatureAlgorithm.rsa_pss_pss_sha256:
                return CryptoSignatureAlgorithm.rsa_pss_pss_sha256;
            case SignatureAlgorithm.rsa_pss_pss_sha384:
                return CryptoSignatureAlgorithm.rsa_pss_pss_sha384;
            case SignatureAlgorithm.rsa_pss_pss_sha512:
                return CryptoSignatureAlgorithm.rsa_pss_pss_sha512;
            case SignatureAlgorithm.ecdsa_brainpoolP256r1tls13_sha256:
                return CryptoSignatureAlgorithm.ecdsa_brainpoolP256r1tls13_sha256;
            case SignatureAlgorithm.ecdsa_brainpoolP384r1tls13_sha384:
                return CryptoSignatureAlgorithm.ecdsa_brainpoolP384r1tls13_sha384;
            case SignatureAlgorithm.ecdsa_brainpoolP512r1tls13_sha512:
                return CryptoSignatureAlgorithm.ecdsa_brainpoolP512r1tls13_sha512;
            case SignatureAlgorithm.gostr34102012_256:
                return CryptoSignatureAlgorithm.gostr34102012_256;
            case SignatureAlgorithm.gostr34102012_512:
                return CryptoSignatureAlgorithm.gostr34102012_512;
            default:
                throw new ArgumentException("specified SignatureAlgorithm invalid: "
                    + SignatureAlgorithm.GetText(signatureAlgorithm));
            }
        }

        /// <exception cref="IOException"/>
        public static TlsSecret HkdfExpandLabel(TlsSecret secret, int cryptoHashAlgorithm, string label,
            byte[] context, int length)
        {
            int labelLength = label.Length;
            if (labelLength < 1)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            int contextLength = context.Length;
            int expandedLabelLength = Tls13Prefix.Length + labelLength;

            byte[] hkdfLabel = new byte[2 + (1 + expandedLabelLength) + (1 + contextLength)];

            // uint16 length
            {
                TlsUtilities.CheckUint16(length);
                TlsUtilities.WriteUint16(length, hkdfLabel, 0);
            }

            // opaque label<7..255>
            {
                TlsUtilities.CheckUint8(expandedLabelLength);
                TlsUtilities.WriteUint8(expandedLabelLength, hkdfLabel, 2);

                Array.Copy(Tls13Prefix, 0, hkdfLabel, 2 + 1, Tls13Prefix.Length);

                int labelPos = 2 + (1 + Tls13Prefix.Length);
                for (int i = 0; i < labelLength; ++i)
                {
                    char c = label[i];
                    hkdfLabel[labelPos + i] = (byte)c;
                }
            }

            // context
            {
                TlsUtilities.WriteOpaque8(context, hkdfLabel, 2 + (1 + expandedLabelLength));
            }

            return secret.HkdfExpand(cryptoHashAlgorithm, hkdfLabel, length);
        }
    }
}
