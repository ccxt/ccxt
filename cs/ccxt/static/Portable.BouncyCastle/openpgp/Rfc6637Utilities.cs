using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
    public sealed class Rfc6637Utilities
    {
        private Rfc6637Utilities()
        {
        }

        // "Anonymous Sender    ", which is the octet sequence
        private static readonly byte[] ANONYMOUS_SENDER = Hex.Decode("416E6F6E796D6F75732053656E64657220202020");

        public static string GetAgreementAlgorithm(PublicKeyPacket pubKeyData)
        {
            ECDHPublicBcpgKey ecKey = (ECDHPublicBcpgKey)pubKeyData.Key;

            switch (ecKey.HashAlgorithm)
            {
            case HashAlgorithmTag.Sha256:
                return "ECCDHwithSHA256CKDF";
            case HashAlgorithmTag.Sha384:
                return "ECCDHwithSHA384CKDF";
            case HashAlgorithmTag.Sha512:
                return "ECCDHwithSHA512CKDF";
            default:
                throw new ArgumentException("Unknown hash algorithm specified: " + ecKey.HashAlgorithm);
            }
        }

        public static DerObjectIdentifier GetKeyEncryptionOID(SymmetricKeyAlgorithmTag algID)
        {
            switch (algID)
            {
            case SymmetricKeyAlgorithmTag.Aes128:
                return NistObjectIdentifiers.IdAes128Wrap;
            case SymmetricKeyAlgorithmTag.Aes192:
                return NistObjectIdentifiers.IdAes192Wrap;
            case SymmetricKeyAlgorithmTag.Aes256:
                return NistObjectIdentifiers.IdAes256Wrap;
            default:
                throw new PgpException("unknown symmetric algorithm ID: " + algID);
            }
        }

        public static int GetKeyLength(SymmetricKeyAlgorithmTag algID)
        {
            switch (algID)
            {
            case SymmetricKeyAlgorithmTag.Aes128:
                return 16;
            case SymmetricKeyAlgorithmTag.Aes192:
                return 24;
            case SymmetricKeyAlgorithmTag.Aes256:
                return 32;
            default:
                throw new PgpException("unknown symmetric algorithm ID: " + algID);
            }
        }

        public static byte[] CreateKey(PublicKeyPacket pubKeyData, ECPoint s)
        {
            byte[] userKeyingMaterial = CreateUserKeyingMaterial(pubKeyData);

            ECDHPublicBcpgKey ecKey = (ECDHPublicBcpgKey)pubKeyData.Key;

            return Kdf(ecKey.HashAlgorithm, s, GetKeyLength(ecKey.SymmetricKeyAlgorithm), userKeyingMaterial);
        }

        // RFC 6637 - Section 8
        // curve_OID_len = (byte)len(curve_OID);
        // Param = curve_OID_len || curve_OID || public_key_alg_ID || 03
        // || 01 || KDF_hash_ID || KEK_alg_ID for AESKeyWrap || "Anonymous
        // Sender    " || recipient_fingerprint;
        // Z_len = the key size for the KEK_alg_ID used with AESKeyWrap
        // Compute Z = KDF( S, Z_len, Param );
        public static byte[] CreateUserKeyingMaterial(PublicKeyPacket pubKeyData)
        {
            MemoryStream pOut = new MemoryStream();
            ECDHPublicBcpgKey ecKey = (ECDHPublicBcpgKey)pubKeyData.Key;
            byte[] encOid = ecKey.CurveOid.GetEncoded();

            pOut.Write(encOid, 1, encOid.Length - 1);
            pOut.WriteByte((byte)pubKeyData.Algorithm);
            pOut.WriteByte(0x03);
            pOut.WriteByte(0x01);
            pOut.WriteByte((byte)ecKey.HashAlgorithm);
            pOut.WriteByte((byte)ecKey.SymmetricKeyAlgorithm);
            pOut.Write(ANONYMOUS_SENDER, 0, ANONYMOUS_SENDER.Length);

            byte[] fingerprint = PgpPublicKey.CalculateFingerprint(pubKeyData);
            pOut.Write(fingerprint, 0, fingerprint.Length);

            return pOut.ToArray();
        }

        // RFC 6637 - Section 7
        //   Implements KDF( X, oBits, Param );
        //   Input: point X = (x,y)
        //   oBits - the desired size of output
        //   hBits - the size of output of hash function Hash
        //   Param - octets representing the parameters
        //   Assumes that oBits <= hBits
        //   Convert the point X to the octet string, see section 6:
        //   ZB' = 04 || x || y
        //   and extract the x portion from ZB'
        //         ZB = x;
        //         MB = Hash ( 00 || 00 || 00 || 01 || ZB || Param );
        //   return oBits leftmost bits of MB.
        private static byte[] Kdf(HashAlgorithmTag digestAlg, ECPoint s, int keyLen, byte[] parameters)
        {
            byte[] ZB = s.XCoord.GetEncoded();

            string digestName = PgpUtilities.GetDigestName(digestAlg);
			IDigest digest = DigestUtilities.GetDigest(digestName);

            digest.Update(0x00);
            digest.Update(0x00);
            digest.Update(0x00);
            digest.Update(0x01);
            digest.BlockUpdate(ZB, 0, ZB.Length);
            digest.BlockUpdate(parameters, 0, parameters.Length);

            byte[] hash = DigestUtilities.DoFinal(digest);

            return Arrays.CopyOfRange(hash, 0, keyLen);
        }
    }
}
