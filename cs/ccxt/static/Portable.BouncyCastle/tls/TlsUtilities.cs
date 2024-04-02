using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Bsi;
using Org.BouncyCastle.Asn1.Eac;
using Org.BouncyCastle.Asn1.EdEC;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Date;
using Org.BouncyCastle.Utilities.Encoders;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public abstract class TlsUtilities
    {
        private static readonly byte[] DowngradeTlsV11 = Hex.DecodeStrict("444F574E47524400");
        private static readonly byte[] DowngradeTlsV12 = Hex.DecodeStrict("444F574E47524401");

        private static readonly IDictionary<string, SignatureAndHashAlgorithm> CertSigAlgOids = CreateCertSigAlgOids();
        private static readonly IList<SignatureAndHashAlgorithm> DefaultSupportedSigAlgs = CreateDefaultSupportedSigAlgs();

        private static void AddCertSigAlgOid(IDictionary<string, SignatureAndHashAlgorithm> d, DerObjectIdentifier oid,
            SignatureAndHashAlgorithm sigAndHash)
        {
            d[oid.Id] = sigAndHash;
        }

        private static void AddCertSigAlgOid(IDictionary<string, SignatureAndHashAlgorithm> d, DerObjectIdentifier oid,
            short hashAlgorithm, short signatureAlgorithm)
        {
            AddCertSigAlgOid(d, oid, SignatureAndHashAlgorithm.GetInstance(hashAlgorithm, signatureAlgorithm));
        }

        private static IDictionary<string, SignatureAndHashAlgorithm> CreateCertSigAlgOids()
        {
            var d = new Dictionary<string, SignatureAndHashAlgorithm>();

            AddCertSigAlgOid(d, NistObjectIdentifiers.DsaWithSha224, HashAlgorithm.sha224, SignatureAlgorithm.dsa);
            AddCertSigAlgOid(d, NistObjectIdentifiers.DsaWithSha256, HashAlgorithm.sha256, SignatureAlgorithm.dsa);
            AddCertSigAlgOid(d, NistObjectIdentifiers.DsaWithSha384, HashAlgorithm.sha384, SignatureAlgorithm.dsa);
            AddCertSigAlgOid(d, NistObjectIdentifiers.DsaWithSha512, HashAlgorithm.sha512, SignatureAlgorithm.dsa);

            AddCertSigAlgOid(d, OiwObjectIdentifiers.DsaWithSha1, HashAlgorithm.sha1, SignatureAlgorithm.dsa);
            AddCertSigAlgOid(d, OiwObjectIdentifiers.Sha1WithRsa, HashAlgorithm.sha1, SignatureAlgorithm.rsa);

            AddCertSigAlgOid(d, PkcsObjectIdentifiers.Sha1WithRsaEncryption, HashAlgorithm.sha1, SignatureAlgorithm.rsa);
            AddCertSigAlgOid(d, PkcsObjectIdentifiers.Sha224WithRsaEncryption, HashAlgorithm.sha224, SignatureAlgorithm.rsa);
            AddCertSigAlgOid(d, PkcsObjectIdentifiers.Sha256WithRsaEncryption, HashAlgorithm.sha256, SignatureAlgorithm.rsa);
            AddCertSigAlgOid(d, PkcsObjectIdentifiers.Sha384WithRsaEncryption, HashAlgorithm.sha384, SignatureAlgorithm.rsa);
            AddCertSigAlgOid(d, PkcsObjectIdentifiers.Sha512WithRsaEncryption, HashAlgorithm.sha512, SignatureAlgorithm.rsa);

            AddCertSigAlgOid(d, X9ObjectIdentifiers.ECDsaWithSha1, HashAlgorithm.sha1, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, X9ObjectIdentifiers.ECDsaWithSha224, HashAlgorithm.sha224, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, X9ObjectIdentifiers.ECDsaWithSha256, HashAlgorithm.sha256, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, X9ObjectIdentifiers.ECDsaWithSha384, HashAlgorithm.sha384, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, X9ObjectIdentifiers.ECDsaWithSha512, HashAlgorithm.sha512, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, X9ObjectIdentifiers.IdDsaWithSha1, HashAlgorithm.sha1, SignatureAlgorithm.dsa);

            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_ECDSA_SHA_1, HashAlgorithm.sha1, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_ECDSA_SHA_224, HashAlgorithm.sha224, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_ECDSA_SHA_256, HashAlgorithm.sha256, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_ECDSA_SHA_384, HashAlgorithm.sha384, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_ECDSA_SHA_512, HashAlgorithm.sha512, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_RSA_v1_5_SHA_1, HashAlgorithm.sha1, SignatureAlgorithm.rsa);
            AddCertSigAlgOid(d, EacObjectIdentifiers.id_TA_RSA_v1_5_SHA_256, HashAlgorithm.sha256, SignatureAlgorithm.rsa);

            AddCertSigAlgOid(d, BsiObjectIdentifiers.ecdsa_plain_SHA1, HashAlgorithm.sha1, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, BsiObjectIdentifiers.ecdsa_plain_SHA224, HashAlgorithm.sha224, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, BsiObjectIdentifiers.ecdsa_plain_SHA256, HashAlgorithm.sha256, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, BsiObjectIdentifiers.ecdsa_plain_SHA384, HashAlgorithm.sha384, SignatureAlgorithm.ecdsa);
            AddCertSigAlgOid(d, BsiObjectIdentifiers.ecdsa_plain_SHA512, HashAlgorithm.sha512, SignatureAlgorithm.ecdsa);

            AddCertSigAlgOid(d, EdECObjectIdentifiers.id_Ed25519, SignatureAndHashAlgorithm.ed25519);
            AddCertSigAlgOid(d, EdECObjectIdentifiers.id_Ed448, SignatureAndHashAlgorithm.ed448);

            AddCertSigAlgOid(d, RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256,
                SignatureAndHashAlgorithm.gostr34102012_256);
            AddCertSigAlgOid(d, RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512,
                SignatureAndHashAlgorithm.gostr34102012_512);

            // TODO[RFC 8998]
            //AddCertSigAlgOid(d, GMObjectIdentifiers.sm2sign_with_sm3, HashAlgorithm.sm3, SignatureAlgorithm.sm2);

            return d;
        }

        private static IList<SignatureAndHashAlgorithm> CreateDefaultSupportedSigAlgs()
        {
            var result = new List<SignatureAndHashAlgorithm>();
            result.Add(SignatureAndHashAlgorithm.ed25519);
            result.Add(SignatureAndHashAlgorithm.ed448);
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha256, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha384, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha512, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.rsa_pss_rsae_sha256);
            result.Add(SignatureAndHashAlgorithm.rsa_pss_rsae_sha384);
            result.Add(SignatureAndHashAlgorithm.rsa_pss_rsae_sha512);
            result.Add(SignatureAndHashAlgorithm.rsa_pss_pss_sha256);
            result.Add(SignatureAndHashAlgorithm.rsa_pss_pss_sha384);
            result.Add(SignatureAndHashAlgorithm.rsa_pss_pss_sha512);
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha256, SignatureAlgorithm.rsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha384, SignatureAlgorithm.rsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha512, SignatureAlgorithm.rsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha256, SignatureAlgorithm.dsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha384, SignatureAlgorithm.dsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha512, SignatureAlgorithm.dsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha224, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha224, SignatureAlgorithm.rsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha224, SignatureAlgorithm.dsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.rsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.dsa));
            return result;
        }

        public static readonly byte[] EmptyBytes = new byte[0];
        public static readonly short[] EmptyShorts = new short[0];
        public static readonly int[] EmptyInts = new int[0];
        public static readonly long[] EmptyLongs = new long[0];
        public static readonly string[] EmptyStrings = new string[0];

        internal static short MinimumHashStrict = HashAlgorithm.sha1;
        internal static short MinimumHashPreferred = HashAlgorithm.sha256;

        public static void CheckUint8(short i)
        {
            if (!IsValidUint8(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint8(int i)
        {
            if (!IsValidUint8(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint8(long i)
        {
            if (!IsValidUint8(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint16(int i)
        {
            if (!IsValidUint16(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint16(long i)
        {
            if (!IsValidUint16(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint24(int i)
        {
            if (!IsValidUint24(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint24(long i)
        {
            if (!IsValidUint24(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint32(long i)
        {
            if (!IsValidUint32(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint48(long i)
        {
            if (!IsValidUint48(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static void CheckUint64(long i)
        {
            if (!IsValidUint64(i))
                throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public static bool IsValidUint8(short i)
        {
            return (i & 0xFF) == i;
        }

        public static bool IsValidUint8(int i)
        {
            return (i & 0xFF) == i;
        }

        public static bool IsValidUint8(long i)
        {
            return (i & 0xFFL) == i;
        }

        public static bool IsValidUint16(int i)
        {
            return (i & 0xFFFF) == i;
        }

        public static bool IsValidUint16(long i)
        {
            return (i & 0xFFFFL) == i;
        }

        public static bool IsValidUint24(int i)
        {
            return (i & 0xFFFFFF) == i;
        }

        public static bool IsValidUint24(long i)
        {
            return (i & 0xFFFFFFL) == i;
        }

        public static bool IsValidUint32(long i)
        {
            return (i & 0xFFFFFFFFL) == i;
        }

        public static bool IsValidUint48(long i)
        {
            return (i & 0xFFFFFFFFFFFFL) == i;
        }

        public static bool IsValidUint64(long i)
        {
            return true;
        }

        public static bool IsSsl(TlsContext context)
        {
            return context.ServerVersion.IsSsl;
        }

        public static bool IsTlsV10(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv10.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV10(TlsContext context)
        {
            return IsTlsV10(context.ServerVersion);
        }

        public static bool IsTlsV11(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv11.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV11(TlsContext context)
        {
            return IsTlsV11(context.ServerVersion);
        }

        public static bool IsTlsV12(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv12.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV12(TlsContext context)
        {
            return IsTlsV12(context.ServerVersion);
        }

        public static bool IsTlsV13(ProtocolVersion version)
        {
            return ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static bool IsTlsV13(TlsContext context)
        {
            return IsTlsV13(context.ServerVersion);
        }

        public static void WriteUint8(short i, Stream output)
        {
            output.WriteByte((byte)i);
        }

        public static void WriteUint8(int i, Stream output)
        {
            output.WriteByte((byte)i);
        }

        public static void WriteUint8(short i, byte[] buf, int offset)
        {
            buf[offset] = (byte)i;
        }

        public static void WriteUint8(int i, byte[] buf, int offset)
        {
            buf[offset] = (byte)i;
        }

        public static void WriteUint16(int i, Stream output)
        {
            output.WriteByte((byte)(i >> 8));
            output.WriteByte((byte)i);
        }

        public static void WriteUint16(int i, byte[] buf, int offset)
        {
            buf[offset    ] = (byte)(i >> 8);
            buf[offset + 1] = (byte)i;
        }

        public static void WriteUint24(int i, Stream output)
        {
            output.WriteByte((byte)(i >> 16));
            output.WriteByte((byte)(i >> 8));
            output.WriteByte((byte)i);
        }

        public static void WriteUint24(int i, byte[] buf, int offset)
        {
            buf[offset    ] = (byte)(i >> 16);
            buf[offset + 1] = (byte)(i >> 8);
            buf[offset + 2] = (byte)i;
        }

        public static void WriteUint32(long i, Stream output)
        {
            output.WriteByte((byte)(i >> 24));
            output.WriteByte((byte)(i >> 16));
            output.WriteByte((byte)(i >> 8));
            output.WriteByte((byte)i);
        }

        public static void WriteUint32(long i, byte[] buf, int offset)
        {
            buf[offset    ] = (byte)(i >> 24);
            buf[offset + 1] = (byte)(i >> 16);
            buf[offset + 2] = (byte)(i >> 8);
            buf[offset + 3] = (byte)i;
        }

        public static void WriteUint48(long i, Stream output)
        {
            output.WriteByte((byte)(i >> 40));
            output.WriteByte((byte)(i >> 32));
            output.WriteByte((byte)(i >> 24));
            output.WriteByte((byte)(i >> 16));
            output.WriteByte((byte)(i >> 8));
            output.WriteByte((byte)i);
        }

        public static void WriteUint48(long i, byte[] buf, int offset)
        {
            buf[offset    ] = (byte)(i >> 40);
            buf[offset + 1] = (byte)(i >> 32);
            buf[offset + 2] = (byte)(i >> 24);
            buf[offset + 3] = (byte)(i >> 16);
            buf[offset + 4] = (byte)(i >> 8);
            buf[offset + 5] = (byte)i;
        }

        public static void WriteUint64(long i, Stream output)
        {
            output.WriteByte((byte)(i >> 56));
            output.WriteByte((byte)(i >> 48));
            output.WriteByte((byte)(i >> 40));
            output.WriteByte((byte)(i >> 32));
            output.WriteByte((byte)(i >> 24));
            output.WriteByte((byte)(i >> 16));
            output.WriteByte((byte)(i >> 8));
            output.WriteByte((byte) i);
        }

        public static void WriteUint64(long i, byte[] buf, int offset)
        {
            buf[offset    ] = (byte)(i >> 56);
            buf[offset + 1] = (byte)(i >> 48);
            buf[offset + 2] = (byte)(i >> 40);
            buf[offset + 3] = (byte)(i >> 32);
            buf[offset + 4] = (byte)(i >> 24);
            buf[offset + 5] = (byte)(i >> 16);
            buf[offset + 6] = (byte)(i >> 8);
            buf[offset + 7] = (byte)i;
        }

        public static void WriteOpaque8(byte[] buf, Stream output)
        {
            CheckUint8(buf.Length);
            WriteUint8(buf.Length, output);
            output.Write(buf, 0, buf.Length);
        }

        public static void WriteOpaque8(byte[] data, byte[] buf, int off)
        {
            CheckUint8(data.Length);
            WriteUint8(data.Length, buf, off);
            Array.Copy(data, 0, buf, off + 1, data.Length);
        }

        public static void WriteOpaque16(byte[] buf, Stream output)
        {
            CheckUint16(buf.Length);
            WriteUint16(buf.Length, output);
            output.Write(buf, 0, buf.Length);
        }

        public static void WriteOpaque16(byte[] data, byte[] buf, int off)
        {
            CheckUint16(data.Length);
            WriteUint16(data.Length, buf, off);
            Array.Copy(data, 0, buf, off + 2, data.Length);
        }

        public static void WriteOpaque24(byte[] buf, Stream output)
        {
            CheckUint24(buf.Length);
            WriteUint24(buf.Length, output);
            output.Write(buf, 0, buf.Length);
        }

        public static void WriteOpaque24(byte[] data, byte[] buf, int off)
        {
            CheckUint24(data.Length);
            WriteUint24(data.Length, buf, off);
            Array.Copy(data, 0, buf, off + 3, data.Length);
        }

        public static void WriteUint8Array(short[] u8s, Stream output)
        {
            for (int i = 0; i < u8s.Length; ++i)
            {
                WriteUint8(u8s[i], output);
            }
        }

        public static void WriteUint8Array(short[] u8s, byte[] buf, int offset)
        {
            for (int i = 0; i < u8s.Length; ++i)
            {
                WriteUint8(u8s[i], buf, offset);
                ++offset;
            }
        }

        public static void WriteUint8ArrayWithUint8Length(short[] u8s, Stream output)
        {
            CheckUint8(u8s.Length);
            WriteUint8(u8s.Length, output);
            WriteUint8Array(u8s, output);
        }

        public static void WriteUint8ArrayWithUint8Length(short[] u8s, byte[] buf, int offset)
        {
            CheckUint8(u8s.Length);
            WriteUint8(u8s.Length, buf, offset);
            WriteUint8Array(u8s, buf, offset + 1);
        }

        public static void WriteUint16Array(int[] u16s, Stream output)
        {
            for (int i = 0; i < u16s.Length; ++i)
            {
                WriteUint16(u16s[i], output);
            }
        }

        public static void WriteUint16Array(int[] u16s, byte[] buf, int offset)
        {
            for (int i = 0; i < u16s.Length; ++i)
            {
                WriteUint16(u16s[i], buf, offset);
                offset += 2;
            }
        }

        public static void WriteUint16ArrayWithUint8Length(int[] u16s, byte[] buf, int offset)
        {
            int length = 2 * u16s.Length;
            CheckUint8(length);
            WriteUint8(length, buf, offset);
            WriteUint16Array(u16s, buf, offset + 1);
        }

        public static void WriteUint16ArrayWithUint16Length(int[] u16s, Stream output)
        {
            int length = 2 * u16s.Length;
            CheckUint16(length);
            WriteUint16(length, output);
            WriteUint16Array(u16s, output);
        }

        public static void WriteUint16ArrayWithUint16Length(int[] u16s, byte[] buf, int offset)
        {
            int length = 2 * u16s.Length;
            CheckUint16(length);
            WriteUint16(length, buf, offset);
            WriteUint16Array(u16s, buf, offset + 2);
        }

        public static byte[] DecodeOpaque8(byte[] buf)
        {
            return DecodeOpaque8(buf, 0);
        }

        public static byte[] DecodeOpaque8(byte[] buf, int minLength)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");
            if (buf.Length < 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            short length = ReadUint8(buf, 0);
            if (buf.Length != (length + 1) || length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return CopyOfRangeExact(buf, 1, buf.Length);
        }

        public static byte[] DecodeOpaque16(byte[] buf)
        {
            return DecodeOpaque16(buf, 0);
        }

        public static byte[] DecodeOpaque16(byte[] buf, int minLength)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");
            if (buf.Length < 2)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int length = ReadUint16(buf, 0);
            if (buf.Length != (length + 2) || length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return CopyOfRangeExact(buf, 2, buf.Length);
        }

        public static short DecodeUint8(byte[] buf)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");
            if (buf.Length != 1)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadUint8(buf, 0);
        }

        public static short[] DecodeUint8ArrayWithUint8Length(byte[] buf)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");

            int count = ReadUint8(buf, 0);
            if (buf.Length != (count + 1))
                throw new TlsFatalAlert(AlertDescription.decode_error);

            short[] uints = new short[count];
            for (int i = 0; i < count; ++i)
            {
                uints[i] = ReadUint8(buf, i + 1);
            }
            return uints;
        }

        public static int DecodeUint16(byte[] buf)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");
            if (buf.Length != 2)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadUint16(buf, 0);
        }

        public static int[] DecodeUint16ArrayWithUint8Length(byte[] buf)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");

            int length = ReadUint8(buf, 0);
            if (buf.Length != (length + 1) || (length & 1) != 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int count = length / 2, pos = 1;
            int[] u16s = new int[count];
            for (int i = 0; i < count; ++i)
            {
                u16s[i] = ReadUint16(buf, pos);
                pos += 2;
            }
            return u16s;
        }

        public static long DecodeUint32(byte[] buf)
        {
            if (buf == null)
                throw new ArgumentNullException("buf");
            if (buf.Length != 4)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadUint32(buf, 0);
        }

        public static byte[] EncodeOpaque8(byte[] buf)
        {
            CheckUint8(buf.Length);
            return Arrays.Prepend(buf, (byte)buf.Length);
        }

        public static byte[] EncodeOpaque16(byte[] buf)
        {
            CheckUint16(buf.Length);
            byte[] r = new byte[2 + buf.Length];
            WriteUint16(buf.Length, r, 0);
            Array.Copy(buf, 0, r, 2, buf.Length);
            return r;
        }

        public static byte[] EncodeOpaque24(byte[] buf)
        {
            CheckUint24(buf.Length);
            byte[] r = new byte[3 + buf.Length];
            WriteUint24(buf.Length, r, 0);
            Array.Copy(buf, 0, r, 3, buf.Length);
            return r;
        }

        public static byte[] EncodeUint8(short u8)
        {
            CheckUint8(u8);

            byte[] encoding = new byte[1];
            WriteUint8(u8, encoding, 0);
            return encoding;
        }

        public static byte[] EncodeUint8ArrayWithUint8Length(short[] u8s)
        {
            byte[] result = new byte[1 + u8s.Length];
            WriteUint8ArrayWithUint8Length(u8s, result, 0);
            return result;
        }

        public static byte[] EncodeUint16(int u16)
        {
            CheckUint16(u16);

            byte[] encoding = new byte[2];
            WriteUint16(u16, encoding, 0);
            return encoding;
        }

        public static byte[] EncodeUint16ArrayWithUint8Length(int[] u16s)
        {
            int length = 2 * u16s.Length;
            byte[] result = new byte[1 + length];
            WriteUint16ArrayWithUint8Length(u16s, result, 0);
            return result;
        }

        public static byte[] EncodeUint16ArrayWithUint16Length(int[] u16s)
        {
            int length = 2 * u16s.Length;
            byte[] result = new byte[2 + length];
            WriteUint16ArrayWithUint16Length(u16s, result, 0);
            return result;
        }

        public static byte[] EncodeUint24(int u24)
        {
            CheckUint24(u24);

            byte[] encoding = new byte[3];
            WriteUint24(u24, encoding, 0);
            return encoding;
        }

        public static byte[] EncodeUint32(long u32)
        {
            CheckUint32(u32);

            byte[] encoding = new byte[4];
            WriteUint32(u32, encoding, 0);
            return encoding;
        }

        public static byte[] EncodeVersion(ProtocolVersion version)
        {
            return new byte[]{
                (byte)version.MajorVersion,
                (byte)version.MinorVersion
            };
        }

        public static int ReadInt32(byte[] buf, int offset)
        {
            int n = buf[offset] << 24;
            n |= (buf[++offset] & 0xff) << 16;
            n |= (buf[++offset] & 0xff) << 8;
            n |= (buf[++offset] & 0xff);
            return n;
        }

        public static short ReadUint8(Stream input)
        {
            int i = input.ReadByte();
            if (i < 0)
                throw new EndOfStreamException();
            return (short)i;
        }

        public static short ReadUint8(byte[] buf, int offset)
        {
            return (short)(buf[offset] & 0xff);
        }

        public static int ReadUint16(Stream input)
        {
            int i1 = input.ReadByte();
            int i2 = input.ReadByte();
            if (i2 < 0)
                throw new EndOfStreamException();
            return (i1 << 8) | i2;
        }

        public static int ReadUint16(byte[] buf, int offset)
        {
            int n = (buf[offset] & 0xff) << 8;
            n |= (buf[++offset] & 0xff);
            return n;
        }

        public static int ReadUint24(Stream input)
        {
            int i1 = input.ReadByte();
            int i2 = input.ReadByte();
            int i3 = input.ReadByte();
            if (i3 < 0)
                throw new EndOfStreamException();

            return (i1 << 16) | (i2 << 8) | i3;
        }

        public static int ReadUint24(byte[] buf, int offset)
        {
            int n = (buf[offset] & 0xff) << 16;
            n |= (buf[++offset] & 0xff) << 8;
            n |= (buf[++offset] & 0xff);
            return n;
        }

        public static long ReadUint32(Stream input)
        {
            int i1 = input.ReadByte();
            int i2 = input.ReadByte();
            int i3 = input.ReadByte();
            int i4 = input.ReadByte();
            if (i4 < 0)
                throw new EndOfStreamException();

            return ((i1 << 24) | (i2 << 16) | (i3 << 8) | i4) & 0xFFFFFFFFL;
        }

        public static long ReadUint32(byte[] buf, int offset)
        {
            int n = (buf[offset] & 0xff) << 24;
            n |= (buf[++offset] & 0xff) << 16;
            n |= (buf[++offset] & 0xff) << 8;
            n |= (buf[++offset] & 0xff);
            return n & 0xFFFFFFFFL;
        }

        public static long ReadUint48(Stream input)
        {
            int hi = ReadUint24(input);
            int lo = ReadUint24(input);
            return ((long)(hi & 0xffffffffL) << 24) | (long)(lo & 0xffffffffL);
        }

        public static long ReadUint48(byte[] buf, int offset)
        {
            int hi = ReadUint24(buf, offset);
            int lo = ReadUint24(buf, offset + 3);
            return ((long)(hi & 0xffffffffL) << 24) | (long)(lo & 0xffffffffL);
        }

        public static byte[] ReadAllOrNothing(int length, Stream input)
        {
            if (length < 1)
                return EmptyBytes;
            byte[] buf = new byte[length];
            int read = Streams.ReadFully(input, buf);
            if (read == 0)
                return null;
            if (read != length)
                throw new EndOfStreamException();
            return buf;
        }

        public static byte[] ReadFully(int length, Stream input)
        {
            if (length < 1)
                return EmptyBytes;
            byte[] buf = new byte[length];
            if (length != Streams.ReadFully(input, buf))
                throw new EndOfStreamException();
            return buf;
        }

        public static void ReadFully(byte[] buf, Stream input)
        {
            int length = buf.Length;
            if (length > 0 && length != Streams.ReadFully(input, buf))
                throw new EndOfStreamException();
        }

        public static byte[] ReadOpaque8(Stream input)
        {
            short length = ReadUint8(input);
            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque8(Stream input, int minLength)
        {
            short length = ReadUint8(input);
            if (length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque8(Stream input, int minLength, int maxLength)
        {
            short length = ReadUint8(input);
            if (length < minLength || maxLength < length)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque16(Stream input)
        {
            int length = ReadUint16(input);
            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque16(Stream input, int minLength)
        {
            int length = ReadUint16(input);
            if (length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque24(Stream input)
        {
            int length = ReadUint24(input);
            return ReadFully(length, input);
        }

        public static byte[] ReadOpaque24(Stream input, int minLength)
        {
            int length = ReadUint24(input);
            if (length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadFully(length, input);
        }

        public static short[] ReadUint8Array(int count, Stream input)
        {
            short[] uints = new short[count];
            for (int i = 0; i < count; ++i)
            {
                uints[i] = ReadUint8(input);
            }
            return uints;
        }

        public static short[] ReadUint8ArrayWithUint8Length(Stream input, int minLength)
        {
            int length = ReadUint8(input);
            if (length < minLength)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return ReadUint8Array(length, input);
        }

        public static int[] ReadUint16Array(int count, Stream input)
        {
            int[] uints = new int[count];
            for (int i = 0; i < count; ++i)
            {
                uints[i] = ReadUint16(input);
            }
            return uints;
        }

        public static ProtocolVersion ReadVersion(byte[] buf, int offset)
        {
            return ProtocolVersion.Get(buf[offset], buf[offset + 1]);
        }

        public static ProtocolVersion ReadVersion(Stream input)
        {
            int i1 = input.ReadByte();
            int i2 = input.ReadByte();
            if (i2 < 0)
                throw new EndOfStreamException();

            return ProtocolVersion.Get(i1, i2);
        }

        public static Asn1Object ReadAsn1Object(byte[] encoding)
        {
            Asn1InputStream asn1 = new Asn1InputStream(encoding);
            Asn1Object result = asn1.ReadObject();
            if (null == result)
                throw new TlsFatalAlert(AlertDescription.decode_error);
            if (null != asn1.ReadObject())
                throw new TlsFatalAlert(AlertDescription.decode_error);

            return result;
        }

        /// <exception cref="IOException"/>
        public static void RequireDerEncoding(Asn1Encodable asn1, byte[] encoding)
        {
            /*
             * NOTE: The current ASN.1 parsing code can't enforce DER-only parsing, but since DER is
             * canonical, we can check it by re-encoding the result and comparing to the original.
             */
            byte[] check = asn1.GetEncoded(Asn1Encodable.Der);
            if (!Arrays.AreEqual(check, encoding))
                throw new TlsFatalAlert(AlertDescription.decode_error);
        }

        public static void WriteGmtUnixTime(byte[] buf, int offset)
        {
            int t = (int)(DateTimeUtilities.CurrentUnixMs() / 1000L);
            buf[offset    ] = (byte)(t >> 24);
            buf[offset + 1] = (byte)(t >> 16);
            buf[offset + 2] = (byte)(t >> 8);
            buf[offset + 3] = (byte)t;
        }

        public static void WriteVersion(ProtocolVersion version, Stream output)
        {
            output.WriteByte((byte)version.MajorVersion);
            output.WriteByte((byte)version.MinorVersion);
        }

        public static void WriteVersion(ProtocolVersion version, byte[] buf, int offset)
        {
            buf[offset] = (byte)version.MajorVersion;
            buf[offset + 1] = (byte)version.MinorVersion;
        }

        public static void AddIfSupported(IList<SignatureAndHashAlgorithm> supportedAlgs, TlsCrypto crypto,
            SignatureAndHashAlgorithm alg)
        {
            if (crypto.HasSignatureAndHashAlgorithm(alg))
            {
                supportedAlgs.Add(alg);
            }
        }

        public static void AddIfSupported(IList<int> supportedGroups, TlsCrypto crypto, int namedGroup)
        {
            if (crypto.HasNamedGroup(namedGroup))
            {
                supportedGroups.Add(namedGroup);
            }
        }

        public static void AddIfSupported(IList<int> supportedGroups, TlsCrypto crypto, int[] namedGroups)
        {
            for (int i = 0; i < namedGroups.Length; ++i)
            {
                AddIfSupported(supportedGroups, crypto, namedGroups[i]);
            }
        }

        public static bool AddToSet<T>(IList<T> s, T i)
        {
            bool result = !s.Contains(i);
            if (result)
            {
                s.Add(i);
            }
            return result;
        }

        public static IList<SignatureAndHashAlgorithm> GetDefaultDssSignatureAlgorithms()
        {
            return GetDefaultSignatureAlgorithms(SignatureAlgorithm.dsa);
        }

        public static IList<SignatureAndHashAlgorithm> GetDefaultECDsaSignatureAlgorithms()
        {
            return GetDefaultSignatureAlgorithms(SignatureAlgorithm.ecdsa);
        }

        public static IList<SignatureAndHashAlgorithm> GetDefaultRsaSignatureAlgorithms()
        {
            return GetDefaultSignatureAlgorithms(SignatureAlgorithm.rsa);
        }

        public static SignatureAndHashAlgorithm GetDefaultSignatureAlgorithm(short signatureAlgorithm)
        {
            /*
             * RFC 5246 7.4.1.4.1. If the client does not send the signature_algorithms extension,
             * the server MUST do the following:
             * 
             * - If the negotiated key exchange algorithm is one of (RSA, DHE_RSA, DH_RSA, RSA_PSK,
             * ECDH_RSA, ECDHE_RSA), behave as if client had sent the value {sha1,rsa}.
             * 
             * - If the negotiated key exchange algorithm is one of (DHE_DSS, DH_DSS), behave as if
             * the client had sent the value {sha1,dsa}.
             * 
             * - If the negotiated key exchange algorithm is one of (ECDH_ECDSA, ECDHE_ECDSA),
             * behave as if the client had sent value {sha1,ecdsa}.
             */

            switch (signatureAlgorithm)
            {
            case SignatureAlgorithm.dsa:
            case SignatureAlgorithm.ecdsa:
            case SignatureAlgorithm.rsa:
                return SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, signatureAlgorithm);
            default:
                return null;
            }
        }

        public static IList<SignatureAndHashAlgorithm> GetDefaultSignatureAlgorithms(short signatureAlgorithm)
        {
            SignatureAndHashAlgorithm sigAndHashAlg = GetDefaultSignatureAlgorithm(signatureAlgorithm);

            return null == sigAndHashAlg ? new List<SignatureAndHashAlgorithm>() : VectorOfOne(sigAndHashAlg);
        }

        public static IList<SignatureAndHashAlgorithm> GetDefaultSupportedSignatureAlgorithms(TlsContext context)
        {
            return GetSupportedSignatureAlgorithms(context, DefaultSupportedSigAlgs);
        }

        public static IList<SignatureAndHashAlgorithm> GetSupportedSignatureAlgorithms(TlsContext context,
            IList<SignatureAndHashAlgorithm> candidates)
        {
            TlsCrypto crypto = context.Crypto;

            var result = new List<SignatureAndHashAlgorithm>(candidates.Count);
            foreach (SignatureAndHashAlgorithm sigAndHashAlg in candidates)
            {
                AddIfSupported(result, crypto, sigAndHashAlg);
            }
            return result;
        }

        internal static SignatureAndHashAlgorithm GetSignatureAndHashAlgorithm(ProtocolVersion negotiatedVersion,
            TlsCredentialedSigner credentialedSigner)
        {
            SignatureAndHashAlgorithm signatureAndHashAlgorithm = null;
            if (IsSignatureAlgorithmsExtensionAllowed(negotiatedVersion))
            {
                signatureAndHashAlgorithm = credentialedSigner.SignatureAndHashAlgorithm;
                if (signatureAndHashAlgorithm == null)
                {
                    /*
                     * RFC 5246 4.7. digitally-signed element needs SignatureAndHashAlgorithm from TLS 1.2
                     */
                    throw new TlsFatalAlert(AlertDescription.internal_error);
                }
            }
            return signatureAndHashAlgorithm;
        }

        public static byte[] GetExtensionData(IDictionary<int, byte[]> extensions, int extensionType)
        {
            if (extensions == null || !extensions.TryGetValue(extensionType, out var extensionData))
                return null;

            return extensionData;
        }

        public static bool HasExpectedEmptyExtensionData(IDictionary<int, byte[]> extensions, int extensionType,
            short alertDescription)
        {
            byte[] extension_data = GetExtensionData(extensions, extensionType);
            if (extension_data == null)
                return false;

            if (extension_data.Length != 0)
                throw new TlsFatalAlert(alertDescription);

            return true;
        }

        public static TlsSession ImportSession(byte[] sessionID, SessionParameters sessionParameters)
        {
            return new TlsSessionImpl(sessionID, sessionParameters);
        }

        internal static bool IsExtendedMasterSecretOptionalDtls(ProtocolVersion[] activeProtocolVersions)
        {
            return ProtocolVersion.Contains(activeProtocolVersions, ProtocolVersion.DTLSv12)
                || ProtocolVersion.Contains(activeProtocolVersions, ProtocolVersion.DTLSv10);
        }

        internal static bool IsExtendedMasterSecretOptionalTls(ProtocolVersion[] activeProtocolVersions)
        {
            return ProtocolVersion.Contains(activeProtocolVersions, ProtocolVersion.TLSv12)
                || ProtocolVersion.Contains(activeProtocolVersions, ProtocolVersion.TLSv11)
                || ProtocolVersion.Contains(activeProtocolVersions, ProtocolVersion.TLSv10);
        }

        public static bool IsNullOrContainsNull(object[] array)
        {
            if (null == array)
                return true;

            int count = array.Length;
            for (int i = 0; i < count; ++i)
            {
                if (null == array[i])
                    return true;
            }
            return false;
        }

        public static bool IsNullOrEmpty<T>(T[] array)
        {
            return null == array || array.Length < 1;
        }

        public static bool IsNullOrEmpty(string s)
        {
            return null == s || s.Length < 1;
        }

        public static bool IsNullOrEmpty<T>(IList<T> v)
        {
            return null == v || v.Count < 1;
        }

        public static bool IsSignatureAlgorithmsExtensionAllowed(ProtocolVersion version)
        {
            return null != version
                && ProtocolVersion.TLSv12.IsEqualOrEarlierVersionOf(version.GetEquivalentTlsVersion());
        }

        public static short GetLegacyClientCertType(short signatureAlgorithm)
        {
            switch (signatureAlgorithm)
            {
            case SignatureAlgorithm.rsa:
                return ClientCertificateType.rsa_sign;
            case SignatureAlgorithm.dsa:
                return ClientCertificateType.dss_sign;
            case SignatureAlgorithm.ecdsa:
                return ClientCertificateType.ecdsa_sign;
            default:
                return -1;
            }
        }

        public static short GetLegacySignatureAlgorithmClient(short clientCertificateType)
        {
            switch (clientCertificateType)
            {
            case ClientCertificateType.dss_sign:
                return SignatureAlgorithm.dsa;
            case ClientCertificateType.ecdsa_sign:
                return SignatureAlgorithm.ecdsa;
            case ClientCertificateType.rsa_sign:
                return SignatureAlgorithm.rsa;
            default:
                return -1;
            }
        }

        public static short GetLegacySignatureAlgorithmClientCert(short clientCertificateType)
        {
            switch (clientCertificateType)
            {
            case ClientCertificateType.dss_sign:
            case ClientCertificateType.dss_fixed_dh:
                return SignatureAlgorithm.dsa;

            case ClientCertificateType.ecdsa_sign:
            case ClientCertificateType.ecdsa_fixed_ecdh:
                return SignatureAlgorithm.ecdsa;

            case ClientCertificateType.rsa_sign:
            case ClientCertificateType.rsa_fixed_dh:
            case ClientCertificateType.rsa_fixed_ecdh:
                return SignatureAlgorithm.rsa;
            default:
                return -1;
            }
        }

        public static short GetLegacySignatureAlgorithmServer(int keyExchangeAlgorithm)
        {
            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.SRP_DSS:
                return SignatureAlgorithm.dsa;

            case KeyExchangeAlgorithm.ECDHE_ECDSA:
                return SignatureAlgorithm.ecdsa;

            case KeyExchangeAlgorithm.DHE_RSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
            case KeyExchangeAlgorithm.SRP_RSA:
                return SignatureAlgorithm.rsa;

            default:
                return -1;
            }
        }

        public static short GetLegacySignatureAlgorithmServerCert(int keyExchangeAlgorithm)
        {
            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.SRP_DSS:
                return SignatureAlgorithm.dsa;

            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDHE_ECDSA:
                return SignatureAlgorithm.ecdsa;

            case KeyExchangeAlgorithm.DH_RSA:
            case KeyExchangeAlgorithm.DHE_RSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
            case KeyExchangeAlgorithm.RSA:
            case KeyExchangeAlgorithm.RSA_PSK:
            case KeyExchangeAlgorithm.SRP_RSA:
                return SignatureAlgorithm.rsa;

            default:
                return -1;
            }
        }

        public static IList<SignatureAndHashAlgorithm> GetLegacySupportedSignatureAlgorithms()
        {
            var result = new List<SignatureAndHashAlgorithm>(3);
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.dsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.ecdsa));
            result.Add(SignatureAndHashAlgorithm.GetInstance(HashAlgorithm.sha1, SignatureAlgorithm.rsa));
            return result;
        }

        /// <exception cref="IOException"/>
        public static void EncodeSupportedSignatureAlgorithms(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms, Stream output)
        {
            if (supportedSignatureAlgorithms == null ||
                supportedSignatureAlgorithms.Count < 1 ||
                supportedSignatureAlgorithms.Count >= (1 << 15))
            {
                throw new ArgumentException("must have length from 1 to (2^15 - 1)", "supportedSignatureAlgorithms");
            }

            // supported_signature_algorithms
            int length = 2 * supportedSignatureAlgorithms.Count;
            CheckUint16(length);
            WriteUint16(length, output);
            foreach (SignatureAndHashAlgorithm entry in supportedSignatureAlgorithms)
            {
                if (entry.Signature == SignatureAlgorithm.anonymous)
                {
                    /*
                     * RFC 5246 7.4.1.4.1 The "anonymous" value is meaningless in this context but used
                     * in Section 7.4.3. It MUST NOT appear in this extension.
                     */
                    throw new ArgumentException(
                        "SignatureAlgorithm.anonymous MUST NOT appear in the signature_algorithms extension");
                }
                entry.Encode(output);
            }
        }

        /// <exception cref="IOException"/>
        public static IList<SignatureAndHashAlgorithm> ParseSupportedSignatureAlgorithms(Stream input)
        {
            // supported_signature_algorithms
            int length = ReadUint16(input);
            if (length < 2 || (length & 1) != 0)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            int count = length / 2;
            var supportedSignatureAlgorithms = new List<SignatureAndHashAlgorithm>(count);
            for (int i = 0; i < count; ++i)
            {
                SignatureAndHashAlgorithm sigAndHashAlg = SignatureAndHashAlgorithm.Parse(input);

                if (SignatureAlgorithm.anonymous != sigAndHashAlg.Signature)
                {
                    supportedSignatureAlgorithms.Add(sigAndHashAlg);
                }
            }
            return supportedSignatureAlgorithms;
        }

        /// <exception cref="IOException"/>
        public static void VerifySupportedSignatureAlgorithm(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms, SignatureAndHashAlgorithm signatureAlgorithm)
        {
            VerifySupportedSignatureAlgorithm(supportedSignatureAlgorithms, signatureAlgorithm,
                AlertDescription.illegal_parameter);
        }

        /// <exception cref="IOException"/>
        internal static void VerifySupportedSignatureAlgorithm(
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms, SignatureAndHashAlgorithm signatureAlgorithm,
            short alertDescription)
        {
            if (supportedSignatureAlgorithms == null || supportedSignatureAlgorithms.Count < 1
                || supportedSignatureAlgorithms.Count >= (1 << 15))
            {
                throw new ArgumentException("must have length from 1 to (2^15 - 1)", "supportedSignatureAlgorithms");
            }
            if (signatureAlgorithm == null)
                throw new ArgumentNullException("signatureAlgorithm");

            if (signatureAlgorithm.Signature == SignatureAlgorithm.anonymous
                || !ContainsSignatureAlgorithm(supportedSignatureAlgorithms, signatureAlgorithm))
            {
                throw new TlsFatalAlert(alertDescription);
            }
        }

        /// <exception cref="IOException"/>
        public static bool ContainsSignatureAlgorithm(IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms,
            SignatureAndHashAlgorithm signatureAlgorithm)
        {
            foreach (SignatureAndHashAlgorithm entry in supportedSignatureAlgorithms)
            {
                if (entry.Equals(signatureAlgorithm))
                    return true;
            }

            return false;
        }

        public static bool ContainsAnySignatureAlgorithm(IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms,
            short signatureAlgorithm)
        {
            foreach (SignatureAndHashAlgorithm entry in supportedSignatureAlgorithms)
            {
                if (entry.Signature == signatureAlgorithm)
                    return true;
            }

            return false;
        }

        public static TlsSecret Prf(SecurityParameters securityParameters, TlsSecret secret, string asciiLabel,
            byte[] seed, int length)
        {
            return secret.DeriveUsingPrf(securityParameters.PrfAlgorithm, asciiLabel, seed, length);
        }

        public static byte[] Clone(byte[] data)
        {
            return null == data ? null : data.Length == 0 ? EmptyBytes : (byte[])data.Clone();
        }

        public static string[] Clone(string[] s)
        {
            return null == s ? null : s.Length < 1 ? EmptyStrings : (string[])s.Clone();
        }

        public static bool ConstantTimeAreEqual(int len, byte[] a, int aOff, byte[] b, int bOff)
        {
            int d = 0;
            for (int i = 0; i < len; ++i)
            {
                d |= a[aOff + i] ^ b[bOff + i];
            }
            return 0 == d;
        }

        public static byte[] CopyOfRangeExact(byte[] original, int from, int to)
        {
            int newLength = to - from;
            byte[] copy = new byte[newLength];
            Array.Copy(original, from, copy, 0, newLength);
            return copy;
        }

        internal static byte[] Concat(byte[] a, byte[] b)
        {
            byte[] c = new byte[a.Length + b.Length];
            Array.Copy(a, 0, c, 0, a.Length);
            Array.Copy(b, 0, c, a.Length, b.Length);
            return c;
        }

        /// <exception cref="IOException"/>
        internal static byte[] CalculateEndPointHash(TlsContext context, TlsCertificate certificate, byte[] enc)
        {
            return CalculateEndPointHash(context, certificate, enc, 0, enc.Length);
        }

        /// <exception cref="IOException"/>
        internal static byte[] CalculateEndPointHash(TlsContext context, TlsCertificate certificate, byte[] enc,
            int encOff, int encLen)
        {
            short hashAlgorithm = HashAlgorithm.none;

            string sigAlgOid = certificate.SigAlgOid;
            if (sigAlgOid != null)
            {
                if (PkcsObjectIdentifiers.IdRsassaPss.Id.Equals(sigAlgOid))
                {
                    RsassaPssParameters pssParams = RsassaPssParameters.GetInstance(certificate.GetSigAlgParams());
                    if (null != pssParams)
                    {
                        DerObjectIdentifier hashOid = pssParams.HashAlgorithm.Algorithm;
                        if (NistObjectIdentifiers.IdSha256.Equals(hashOid))
                        {
                            hashAlgorithm = HashAlgorithm.sha256;
                        }
                        else if (NistObjectIdentifiers.IdSha384.Equals(hashOid))
                        {
                            hashAlgorithm = HashAlgorithm.sha384;
                        }
                        else if (NistObjectIdentifiers.IdSha512.Equals(hashOid))
                        {
                            hashAlgorithm = HashAlgorithm.sha512;
                        }
                    }
                }
                else
                {
                    if (CertSigAlgOids.TryGetValue(sigAlgOid, out var algorithm))
                    {
                        hashAlgorithm = algorithm.Hash;
                    }
                }
            }

            switch (hashAlgorithm)
            {
            case HashAlgorithm.Intrinsic:
                hashAlgorithm = HashAlgorithm.none;
                break;
            case HashAlgorithm.md5:
            case HashAlgorithm.sha1:
                hashAlgorithm = HashAlgorithm.sha256;
                break;
            }

            if (HashAlgorithm.none != hashAlgorithm)
            {
                TlsHash hash = CreateHash(context.Crypto, hashAlgorithm);
                if (hash != null)
                {                
                    hash.Update(enc, encOff, encLen);
                    return hash.CalculateHash();
                }
            }

            return EmptyBytes;
        }

        public static byte[] CalculateExporterSeed(SecurityParameters securityParameters, byte[] context)
        {
            byte[] cr = securityParameters.ClientRandom, sr = securityParameters.ServerRandom;
            if (null == context)
                return Arrays.Concatenate(cr, sr);

            if (!IsValidUint16(context.Length))
                throw new ArgumentException("must have length less than 2^16 (or be null)", "context");

            byte[] contextLength = new byte[2];
            WriteUint16(context.Length, contextLength, 0);

            return Arrays.ConcatenateAll(cr, sr, contextLength, context);
        }

        private static byte[] CalculateFinishedHmac(SecurityParameters securityParameters, TlsSecret baseKey,
            byte[] transcriptHash)
        {
            int prfCryptoHashAlgorithm = securityParameters.PrfCryptoHashAlgorithm;
            int prfHashLength = securityParameters.PrfHashLength;

            return CalculateFinishedHmac(prfCryptoHashAlgorithm, prfHashLength, baseKey, transcriptHash);
        }

        private static byte[] CalculateFinishedHmac(int prfCryptoHashAlgorithm, int prfHashLength, TlsSecret baseKey,
            byte[] transcriptHash)
        {
            TlsSecret finishedKey = TlsCryptoUtilities.HkdfExpandLabel(baseKey, prfCryptoHashAlgorithm, "finished",
                EmptyBytes, prfHashLength);

            try
            {
                return finishedKey.CalculateHmac(prfCryptoHashAlgorithm, transcriptHash, 0, transcriptHash.Length);
            }
            finally
            {
                finishedKey.Destroy();
            }
        }

        internal static TlsSecret CalculateMasterSecret(TlsContext context, TlsSecret preMasterSecret)
        {
            SecurityParameters sp = context.SecurityParameters;

            string asciiLabel;
            byte[] seed;
            if (sp.IsExtendedMasterSecret)
            {
                asciiLabel = ExporterLabel.extended_master_secret;
                seed = sp.SessionHash;
            }
            else
            {
                asciiLabel = ExporterLabel.master_secret;
                seed = Concat(sp.ClientRandom, sp.ServerRandom);
            }

            return Prf(sp, preMasterSecret, asciiLabel, seed, 48);
        }

        internal static byte[] CalculatePskBinder(TlsCrypto crypto, bool isExternalPsk, int pskCryptoHashAlgorithm,
            TlsSecret earlySecret, byte[] transcriptHash)
        {
            int prfHashLength = TlsCryptoUtilities.GetHashOutputSize(pskCryptoHashAlgorithm);

            string label = isExternalPsk ? "ext binder" : "res binder";
            byte[] emptyTranscriptHash = crypto.CreateHash(pskCryptoHashAlgorithm).CalculateHash();

            TlsSecret binderKey = DeriveSecret(pskCryptoHashAlgorithm, prfHashLength, earlySecret, label,
                emptyTranscriptHash);

            try
            {
                return CalculateFinishedHmac(pskCryptoHashAlgorithm, prfHashLength, binderKey, transcriptHash);
            }
            finally
            {
                binderKey.Destroy();
            }
        }

        internal static byte[] CalculateVerifyData(TlsContext context, TlsHandshakeHash handshakeHash, bool isServer)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (IsTlsV13(negotiatedVersion))
            {
                TlsSecret baseKey = isServer
                    ?   securityParameters.BaseKeyServer
                    :   securityParameters.BaseKeyClient;
                byte[] transcriptHash = GetCurrentPrfHash(handshakeHash);

                return CalculateFinishedHmac(securityParameters, baseKey, transcriptHash);
            }

            if (negotiatedVersion.IsSsl)
            {
                return Ssl3Utilities.CalculateVerifyData(handshakeHash, isServer);
            }

            string asciiLabel = isServer ? ExporterLabel.server_finished : ExporterLabel.client_finished;
            byte[] prfHash = GetCurrentPrfHash(handshakeHash);

            TlsSecret master_secret = securityParameters.MasterSecret;
            int verify_data_length = securityParameters.VerifyDataLength;

            return Prf(securityParameters, master_secret, asciiLabel, prfHash, verify_data_length).Extract();
        }

        internal static void Establish13PhaseSecrets(TlsContext context, TlsSecret pskEarlySecret,
            TlsSecret sharedSecret)
        {
            TlsCrypto crypto = context.Crypto;
            SecurityParameters securityParameters = context.SecurityParameters;
            int cryptoHashAlgorithm = securityParameters.PrfCryptoHashAlgorithm;
            TlsSecret zeros = crypto.HkdfInit(cryptoHashAlgorithm);
            byte[] emptyTranscriptHash = crypto.CreateHash(cryptoHashAlgorithm).CalculateHash();

            TlsSecret earlySecret = pskEarlySecret;
            if (null == earlySecret)
            {
                earlySecret = crypto
                    .HkdfInit(cryptoHashAlgorithm)
                    .HkdfExtract(cryptoHashAlgorithm, zeros);
            }

            if (null == sharedSecret)
            {
                sharedSecret = zeros;
            }

            TlsSecret handshakeSecret = DeriveSecret(securityParameters, earlySecret, "derived", emptyTranscriptHash)
                .HkdfExtract(cryptoHashAlgorithm, sharedSecret);

            if (sharedSecret != zeros)
            {
                sharedSecret.Destroy();
            }

            TlsSecret masterSecret = DeriveSecret(securityParameters, handshakeSecret, "derived", emptyTranscriptHash)
                .HkdfExtract(cryptoHashAlgorithm, zeros);

            securityParameters.m_earlySecret = earlySecret;
            securityParameters.m_handshakeSecret = handshakeSecret;
            securityParameters.m_masterSecret = masterSecret;
        }

        private static void Establish13TrafficSecrets(TlsContext context, byte[] transcriptHash, TlsSecret phaseSecret,
            string clientLabel, string serverLabel, RecordStream recordStream)
        {
            SecurityParameters securityParameters = context.SecurityParameters;

            securityParameters.m_trafficSecretClient = DeriveSecret(securityParameters, phaseSecret, clientLabel,
                transcriptHash);

            if (null != serverLabel)
            {
                securityParameters.m_trafficSecretServer = DeriveSecret(securityParameters, phaseSecret, serverLabel,
                    transcriptHash);
            }

            // TODO[tls13] Early data (client->server only)

            recordStream.SetPendingCipher(InitCipher(context));
        }

        internal static void Establish13PhaseApplication(TlsContext context, byte[] serverFinishedTranscriptHash,
            RecordStream recordStream)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            TlsSecret phaseSecret = securityParameters.MasterSecret;

            Establish13TrafficSecrets(context, serverFinishedTranscriptHash, phaseSecret, "c ap traffic",
                "s ap traffic", recordStream);

            securityParameters.m_exporterMasterSecret = DeriveSecret(securityParameters, phaseSecret, "exp master",
                serverFinishedTranscriptHash);
        }

        internal static void Establish13PhaseEarly(TlsContext context, byte[] clientHelloTranscriptHash,
            RecordStream recordStream)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            TlsSecret phaseSecret = securityParameters.EarlySecret;

            // TODO[tls13] binder_key

            // TODO[tls13] Early data (client->server only)
            if (null != recordStream)
            {
                Establish13TrafficSecrets(context, clientHelloTranscriptHash, phaseSecret, "c e traffic", null,
                    recordStream);
            }

            securityParameters.m_earlyExporterMasterSecret = DeriveSecret(securityParameters, phaseSecret,
                "e exp master", clientHelloTranscriptHash);
        }

        internal static void Establish13PhaseHandshake(TlsContext context, byte[] serverHelloTranscriptHash,
            RecordStream recordStream)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            TlsSecret phaseSecret = securityParameters.HandshakeSecret;

            Establish13TrafficSecrets(context, serverHelloTranscriptHash, phaseSecret, "c hs traffic", "s hs traffic",
                recordStream);

            securityParameters.m_baseKeyClient = securityParameters.TrafficSecretClient;
            securityParameters.m_baseKeyServer = securityParameters.TrafficSecretServer;
        }

        internal static void Update13TrafficSecretLocal(TlsContext context)
        {
            Update13TrafficSecret(context, context.IsServer);
        }

        internal static void Update13TrafficSecretPeer(TlsContext context)
        {
            Update13TrafficSecret(context, !context.IsServer);
        }

        private static void Update13TrafficSecret(TlsContext context, bool forServer)
        {
            SecurityParameters securityParameters = context.SecurityParameters;

            TlsSecret current;
            if (forServer)
            {
                current = securityParameters.TrafficSecretServer;
                securityParameters.m_trafficSecretServer = Update13TrafficSecret(securityParameters, current);
            }
            else
            {
                current = securityParameters.TrafficSecretClient;
                securityParameters.m_trafficSecretClient = Update13TrafficSecret(securityParameters, current);
            }

            if (null != current)
            {
                current.Destroy();
            }
        }

        private static TlsSecret Update13TrafficSecret(SecurityParameters securityParameters, TlsSecret secret)
        {
            return TlsCryptoUtilities.HkdfExpandLabel(secret, securityParameters.PrfCryptoHashAlgorithm, "traffic upd",
                EmptyBytes, securityParameters.PrfHashLength);
        }

        public static DerObjectIdentifier GetOidForHashAlgorithm(short hashAlgorithm)
        {
            switch (hashAlgorithm)
            {
            case HashAlgorithm.md5:
                return PkcsObjectIdentifiers.MD5;
            case HashAlgorithm.sha1:
                return X509ObjectIdentifiers.IdSha1;
            case HashAlgorithm.sha224:
                return NistObjectIdentifiers.IdSha224;
            case HashAlgorithm.sha256:
                return NistObjectIdentifiers.IdSha256;
            case HashAlgorithm.sha384:
                return NistObjectIdentifiers.IdSha384;
            case HashAlgorithm.sha512:
                return NistObjectIdentifiers.IdSha512;
                // TODO[RFC 8998]
            //case HashAlgorithm.sm3:
            //    return GMObjectIdentifiers.sm3;
            default:
                throw new ArgumentException("invalid HashAlgorithm: " + HashAlgorithm.GetText(hashAlgorithm));
            }
        }

        internal static int GetPrfAlgorithm(SecurityParameters securityParameters, int cipherSuite)
        {
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            bool isTlsV13 = IsTlsV13(negotiatedVersion);
            bool isTlsV12Exactly = !isTlsV13 && IsTlsV12(negotiatedVersion);
            bool isSsl = negotiatedVersion.IsSsl;

            switch (cipherSuite)
            {
            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
            {
                if (isTlsV13)
                    return PrfAlgorithm.tls13_hkdf_sha256;

                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            case CipherSuite.TLS_AES_256_GCM_SHA384:
            {
                if (isTlsV13)
                    return PrfAlgorithm.tls13_hkdf_sha384;

                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            case CipherSuite.TLS_SM4_CCM_SM3:
            case CipherSuite.TLS_SM4_GCM_SM3:
            {
                if (isTlsV13)
                    return PrfAlgorithm.tls13_hkdf_sm3;

                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA256:
            {
                if (isTlsV12Exactly)
                    return PrfAlgorithm.tls_prf_sha256;

                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            case CipherSuite.TLS_DH_anon_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            {
                if (isTlsV12Exactly)
                    return PrfAlgorithm.tls_prf_sha384;

                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
            }

            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA384:
            {
                if (isTlsV13)
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                if (isTlsV12Exactly)
                    return PrfAlgorithm.tls_prf_sha384;

                if (isSsl)
                    return PrfAlgorithm.ssl_prf_legacy;

                return PrfAlgorithm.tls_prf_legacy;
            }

            default:
            {
                if (isTlsV13)
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                if (isTlsV12Exactly)
                    return PrfAlgorithm.tls_prf_sha256;

                if (isSsl)
                    return PrfAlgorithm.ssl_prf_legacy;

                return PrfAlgorithm.tls_prf_legacy;
            }
            }
        }

        internal static int GetPrfAlgorithm13(int cipherSuite)
        {
            // NOTE: GetPrfAlgorithms13 relies on the number of distinct return values
            switch (cipherSuite)
            {
            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
                return PrfAlgorithm.tls13_hkdf_sha256;

            case CipherSuite.TLS_AES_256_GCM_SHA384:
                return PrfAlgorithm.tls13_hkdf_sha384;

            case CipherSuite.TLS_SM4_CCM_SM3:
            case CipherSuite.TLS_SM4_GCM_SM3:
                return PrfAlgorithm.tls13_hkdf_sm3;

            default:
                return -1;
            }
        }

        internal static int[] GetPrfAlgorithms13(int[] cipherSuites)
        {
            int[] result = new int[System.Math.Min(3, cipherSuites.Length)];

            int count = 0;
            for (int i = 0; i < cipherSuites.Length; ++i)
            {
                int prfAlgorithm = GetPrfAlgorithm13(cipherSuites[i]);
                if (prfAlgorithm >= 0 && !Arrays.Contains(result, prfAlgorithm))
                {
                    result[count++] = prfAlgorithm;
                }
            }

            return Truncate(result, count);
        }

        internal static byte[] CalculateSignatureHash(TlsContext context, SignatureAndHashAlgorithm algorithm,
            byte[] extraSignatureInput, DigestInputBuffer buf)
        {
            TlsCrypto crypto = context.Crypto;

            TlsHash h = algorithm == null
                ? new CombinedHash(crypto)
                : CreateHash(crypto, algorithm);

            SecurityParameters sp = context.SecurityParameters;
            // NOTE: The implicit copy here is intended (and important)
            byte[] randoms = Arrays.Concatenate(sp.ClientRandom, sp.ServerRandom);
            h.Update(randoms, 0, randoms.Length);

            if (null != extraSignatureInput)
            {
                h.Update(extraSignatureInput, 0, extraSignatureInput.Length);
            }

            buf.UpdateDigest(h);

            return h.CalculateHash();
        }

        internal static void SendSignatureInput(TlsContext context, byte[] extraSignatureInput, DigestInputBuffer buf,
            Stream output)
        {
            SecurityParameters sp = context.SecurityParameters;
            // NOTE: The implicit copy here is intended (and important)
            byte[] randoms = Arrays.Concatenate(sp.ClientRandom, sp.ServerRandom);
            output.Write(randoms, 0, randoms.Length);

            if (null != extraSignatureInput)
            {
                output.Write(extraSignatureInput, 0, extraSignatureInput.Length);
            }

            buf.CopyInputTo(output);

            Platform.Dispose(output);
        }

        internal static DigitallySigned GenerateCertificateVerifyClient(TlsClientContext clientContext,
            TlsCredentialedSigner clientAuthSigner, SignatureAndHashAlgorithm clientAuthAlgorithm,
            TlsStreamSigner clientAuthStreamSigner, TlsHandshakeHash handshakeHash)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            if (IsTlsV13(securityParameters.NegotiatedVersion))
            {
                // Should be using Generate13CertificateVerify instead
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            byte[] signature;
            if (clientAuthStreamSigner != null)
            {
                handshakeHash.CopyBufferTo(clientAuthStreamSigner.Stream);
                signature = clientAuthStreamSigner.GetSignature();
            }
            else
            {
                byte[] hash;
                if (clientAuthAlgorithm == null)
                {
                    hash = securityParameters.SessionHash;
                }
                else
                {
                    hash = handshakeHash.GetFinalHash(SignatureScheme.GetCryptoHashAlgorithm(clientAuthAlgorithm));
                }

                signature = clientAuthSigner.GenerateRawSignature(hash);
            }

            return new DigitallySigned(clientAuthAlgorithm, signature);
        }

        internal static DigitallySigned Generate13CertificateVerify(TlsContext context,
            TlsCredentialedSigner credentialedSigner, TlsHandshakeHash handshakeHash)
        {
            SignatureAndHashAlgorithm signatureAndHashAlgorithm = credentialedSigner.SignatureAndHashAlgorithm;
            if (null == signatureAndHashAlgorithm)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            string contextString = context.IsServer
                ? "TLS 1.3, server CertificateVerify"
                : "TLS 1.3, client CertificateVerify";

            byte[] signature = Generate13CertificateVerify(context.Crypto, credentialedSigner, contextString,
                handshakeHash, signatureAndHashAlgorithm);

            return new DigitallySigned(signatureAndHashAlgorithm, signature);
        }

        private static byte[] Generate13CertificateVerify(TlsCrypto crypto, TlsCredentialedSigner credentialedSigner,
            string contextString, TlsHandshakeHash handshakeHash, SignatureAndHashAlgorithm signatureAndHashAlgorithm)
        {
            TlsStreamSigner streamSigner = credentialedSigner.GetStreamSigner();

            byte[] header = GetCertificateVerifyHeader(contextString);
            byte[] prfHash = GetCurrentPrfHash(handshakeHash);

            if (null != streamSigner)
            {
                Stream output = streamSigner.Stream;
                output.Write(header, 0, header.Length);
                output.Write(prfHash, 0, prfHash.Length);
                return streamSigner.GetSignature();
            }

            TlsHash tlsHash = CreateHash(crypto, signatureAndHashAlgorithm);
            tlsHash.Update(header, 0, header.Length);
            tlsHash.Update(prfHash, 0, prfHash.Length);
            byte[] hash = tlsHash.CalculateHash();
            return credentialedSigner.GenerateRawSignature(hash);
        }

        internal static void VerifyCertificateVerifyClient(TlsServerContext serverContext,
            CertificateRequest certificateRequest, DigitallySigned certificateVerify, TlsHandshakeHash handshakeHash)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;
            Certificate clientCertificate = securityParameters.PeerCertificate;
            TlsCertificate verifyingCert = clientCertificate.GetCertificateAt(0);
            SignatureAndHashAlgorithm sigAndHashAlg = certificateVerify.Algorithm;
            short signatureAlgorithm;

            if (null == sigAndHashAlg)
            {
                signatureAlgorithm = verifyingCert.GetLegacySignatureAlgorithm();

                CheckClientCertificateType(certificateRequest, GetLegacyClientCertType(signatureAlgorithm),
                    AlertDescription.unsupported_certificate);
            }
            else
            {
                VerifySupportedSignatureAlgorithm(securityParameters.ServerSigAlgs, sigAndHashAlg);

                signatureAlgorithm = sigAndHashAlg.Signature;

                CheckClientCertificateType(certificateRequest,
                    SignatureAlgorithm.GetClientCertificateType(signatureAlgorithm), AlertDescription.illegal_parameter);
            }

            // Verify the CertificateVerify message contains a correct signature.
            bool verified;
            try
            {
                TlsVerifier verifier = verifyingCert.CreateVerifier(signatureAlgorithm);
                TlsStreamVerifier streamVerifier = verifier.GetStreamVerifier(certificateVerify);

                if (streamVerifier != null)
                {
                    handshakeHash.CopyBufferTo(streamVerifier.Stream);
                    verified = streamVerifier.IsVerified();
                }
                else
                {
                    byte[] hash;
                    if (IsTlsV12(serverContext))
                    {
                        hash = handshakeHash.GetFinalHash(SignatureScheme.GetCryptoHashAlgorithm(sigAndHashAlg));
                    }
                    else
                    {
                        hash = securityParameters.SessionHash;
                    }

                    verified = verifier.VerifyRawSignature(certificateVerify, hash);
                }
            }
            catch (TlsFatalAlert e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new TlsFatalAlert(AlertDescription.decrypt_error, e);
            }

            if (!verified)
            {
                throw new TlsFatalAlert(AlertDescription.decrypt_error);
            }
        }

        /// <exception cref="IOException"/>
        internal static void Verify13CertificateVerifyClient(TlsServerContext serverContext,
            TlsHandshakeHash handshakeHash, CertificateVerify certificateVerify)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;

            var supportedAlgorithms = securityParameters.ServerSigAlgs;
            TlsCertificate certificate = securityParameters.PeerCertificate.GetCertificateAt(0);

            Verify13CertificateVerify(supportedAlgorithms, "TLS 1.3, client CertificateVerify", handshakeHash,
                certificate, certificateVerify);
        }

        /// <exception cref="IOException"/>
        internal static void Verify13CertificateVerifyServer(TlsClientContext clientContext,
            TlsHandshakeHash handshakeHash, CertificateVerify certificateVerify)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;

            var supportedAlgorithms = securityParameters.ClientSigAlgs;
            TlsCertificate certificate = securityParameters.PeerCertificate.GetCertificateAt(0);

            Verify13CertificateVerify(supportedAlgorithms, "TLS 1.3, server CertificateVerify", handshakeHash,
                certificate, certificateVerify);
        }

        /// <exception cref="IOException"/>
        private static void Verify13CertificateVerify(IList<SignatureAndHashAlgorithm> supportedAlgorithms,
            string contextString, TlsHandshakeHash handshakeHash, TlsCertificate certificate,
            CertificateVerify certificateVerify)
        {
            // Verify the CertificateVerify message contains a correct signature.
            bool verified;
            try
            {
                int signatureScheme = certificateVerify.Algorithm;

                SignatureAndHashAlgorithm algorithm = SignatureScheme.GetSignatureAndHashAlgorithm(signatureScheme);
                VerifySupportedSignatureAlgorithm(supportedAlgorithms, algorithm);

                Tls13Verifier verifier = certificate.CreateVerifier(signatureScheme);

                byte[] header = GetCertificateVerifyHeader(contextString);
                byte[] prfHash = GetCurrentPrfHash(handshakeHash);

                Stream output = verifier.Stream;
                output.Write(header, 0, header.Length);
                output.Write(prfHash, 0, prfHash.Length);
                verified = verifier.VerifySignature(certificateVerify.Signature);
            }
            catch (TlsFatalAlert e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new TlsFatalAlert(AlertDescription.decrypt_error, e);
            }

            if (!verified)
            {
                throw new TlsFatalAlert(AlertDescription.decrypt_error);
            }
        }

        private static byte[] GetCertificateVerifyHeader(string contextString)
        {
            int count = contextString.Length;
            byte[] header = new byte[64 + count + 1];
            for (int i = 0; i < 64; ++i)
            {
                header[i] = 0x20;
            }
            for (int i = 0; i < count; ++i)
            {
                char c = contextString[i];
                header[64 + i] = (byte)c;
            }
            header[64 + count] = 0x00;
            return header;
        }

        /// <exception cref="IOException"/>
        internal static void GenerateServerKeyExchangeSignature(TlsContext context, TlsCredentialedSigner credentials,
            byte[] extraSignatureInput, DigestInputBuffer digestBuffer)
        {
            /*
             * RFC 5246 4.7. digitally-signed element needs SignatureAndHashAlgorithm from TLS 1.2
             */
            SignatureAndHashAlgorithm algorithm = GetSignatureAndHashAlgorithm(context.ServerVersion, credentials);
            TlsStreamSigner streamSigner = credentials.GetStreamSigner();

            byte[] signature;
            if (streamSigner != null)
            {
                SendSignatureInput(context, extraSignatureInput, digestBuffer, streamSigner.Stream);
                signature = streamSigner.GetSignature();
            }
            else
            {
                byte[] hash = CalculateSignatureHash(context, algorithm, extraSignatureInput, digestBuffer);
                signature = credentials.GenerateRawSignature(hash);
            }

            DigitallySigned digitallySigned = new DigitallySigned(algorithm, signature);

            digitallySigned.Encode(digestBuffer);
        }

        /// <exception cref="IOException"/>
        internal static void VerifyServerKeyExchangeSignature(TlsContext context, Stream signatureInput,
            TlsCertificate serverCertificate, byte[] extraSignatureInput, DigestInputBuffer digestBuffer)
        {
            DigitallySigned digitallySigned = DigitallySigned.Parse(context, signatureInput);

            SecurityParameters securityParameters = context.SecurityParameters;
            int keyExchangeAlgorithm = securityParameters.KeyExchangeAlgorithm;

            SignatureAndHashAlgorithm sigAndHashAlg = digitallySigned.Algorithm;
            short signatureAlgorithm;

            if (sigAndHashAlg == null)
            {
                signatureAlgorithm = GetLegacySignatureAlgorithmServer(keyExchangeAlgorithm);
            }
            else
            {
                signatureAlgorithm = sigAndHashAlg.Signature;

                if (!IsValidSignatureAlgorithmForServerKeyExchange(signatureAlgorithm, keyExchangeAlgorithm))
                    throw new TlsFatalAlert(AlertDescription.illegal_parameter);

                VerifySupportedSignatureAlgorithm(securityParameters.ClientSigAlgs, sigAndHashAlg);
            }

            TlsVerifier verifier = serverCertificate.CreateVerifier(signatureAlgorithm);
            TlsStreamVerifier streamVerifier = verifier.GetStreamVerifier(digitallySigned);

            bool verified;
            if (streamVerifier != null)
            {
                SendSignatureInput(context, null, digestBuffer, streamVerifier.Stream);
                verified = streamVerifier.IsVerified();
            }
            else
            {
                byte[] hash = CalculateSignatureHash(context, sigAndHashAlg, null, digestBuffer);
                verified = verifier.VerifyRawSignature(digitallySigned, hash);
            }

            if (!verified)
            {
                throw new TlsFatalAlert(AlertDescription.decrypt_error);
            }
        }

        internal static void TrackHashAlgorithmClient(TlsHandshakeHash handshakeHash,
            SignatureAndHashAlgorithm signatureAndHashAlgorithm)
        {
            int cryptoHashAlgorithm = SignatureScheme.GetCryptoHashAlgorithm(signatureAndHashAlgorithm);
            if (cryptoHashAlgorithm >= 0)
            {
                handshakeHash.TrackHashAlgorithm(cryptoHashAlgorithm);
            }
        }

        internal static void TrackHashAlgorithms(TlsHandshakeHash handshakeHash,
            IList<SignatureAndHashAlgorithm> supportedSignatureAlgorithms)
        {
            foreach (SignatureAndHashAlgorithm signatureAndHashAlgorithm in supportedSignatureAlgorithms)
            {
                int cryptoHashAlgorithm = SignatureScheme.GetCryptoHashAlgorithm(signatureAndHashAlgorithm);
                if (cryptoHashAlgorithm >= 0)
                {
                    handshakeHash.TrackHashAlgorithm(cryptoHashAlgorithm);
                }
                else if (HashAlgorithm.Intrinsic == signatureAndHashAlgorithm.Hash)
                {
                    handshakeHash.ForceBuffering();
                }
            }
        }

        public static bool HasSigningCapability(short clientCertificateType)
        {
            switch (clientCertificateType)
            {
            case ClientCertificateType.dss_sign:
            case ClientCertificateType.ecdsa_sign:
            case ClientCertificateType.rsa_sign:
                return true;
            default:
                return false;
            }
        }

        public static IList<T> VectorOfOne<T>(T obj)
        {
            var v = new List<T>(1);
            v.Add(obj);
            return v;
        }

        public static int GetCipherType(int cipherSuite)
        {
            int encryptionAlgorithm = GetEncryptionAlgorithm(cipherSuite);

            return GetEncryptionAlgorithmType(encryptionAlgorithm);
        }

        public static int GetEncryptionAlgorithm(int cipherSuite)
        {
            switch (cipherSuite)
            {
            case CipherSuite.TLS_DH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA:
                return EncryptionAlgorithm.cls_3DES_EDE_CBC;

            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_128_CBC_SHA:
                return EncryptionAlgorithm.AES_128_CBC;

            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM:
                return EncryptionAlgorithm.AES_128_CCM;

            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM_8:
                return EncryptionAlgorithm.AES_128_CCM_8;

            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256:
                return EncryptionAlgorithm.AES_128_GCM;

            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_256_CBC_SHA:
                return EncryptionAlgorithm.AES_256_CBC;

            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM:
                return EncryptionAlgorithm.AES_256_CCM;

            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM_8:
                return EncryptionAlgorithm.AES_256_CCM_8;

            case CipherSuite.TLS_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384:
                return EncryptionAlgorithm.AES_256_GCM;

            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256:
                return EncryptionAlgorithm.ARIA_128_CBC;

            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256:
                return EncryptionAlgorithm.ARIA_128_GCM;

            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384:
                return EncryptionAlgorithm.ARIA_256_CBC;

            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384:
                return EncryptionAlgorithm.ARIA_256_GCM;

            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_CBC_SHA256:
                return EncryptionAlgorithm.CAMELLIA_128_CBC;

            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256:
                return EncryptionAlgorithm.CAMELLIA_128_GCM;

            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384:
                return EncryptionAlgorithm.CAMELLIA_256_CBC;

            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384:
                return EncryptionAlgorithm.CAMELLIA_256_GCM;

            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256:
                return EncryptionAlgorithm.CHACHA20_POLY1305;

            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA:
                return EncryptionAlgorithm.NULL;

            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA256:
                return EncryptionAlgorithm.NULL;

            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA384:
                return EncryptionAlgorithm.NULL;

            case CipherSuite.TLS_DH_anon_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_SEED_CBC_SHA:
                return EncryptionAlgorithm.SEED_CBC;

            case CipherSuite.TLS_SM4_CCM_SM3:
                return EncryptionAlgorithm.SM4_CCM;

            case CipherSuite.TLS_SM4_GCM_SM3:
                return EncryptionAlgorithm.SM4_GCM;

            default:
                return -1;
            }
        }

        public static int GetEncryptionAlgorithmType(int encryptionAlgorithm)
        {
            switch (encryptionAlgorithm)
            {
            case EncryptionAlgorithm.AES_128_CCM:
            case EncryptionAlgorithm.AES_128_CCM_8:
            case EncryptionAlgorithm.AES_128_GCM:
            case EncryptionAlgorithm.AES_256_CCM:
            case EncryptionAlgorithm.AES_256_CCM_8:
            case EncryptionAlgorithm.AES_256_GCM:
            case EncryptionAlgorithm.ARIA_128_GCM:
            case EncryptionAlgorithm.ARIA_256_GCM:
            case EncryptionAlgorithm.CAMELLIA_128_GCM:
            case EncryptionAlgorithm.CAMELLIA_256_GCM:
            case EncryptionAlgorithm.CHACHA20_POLY1305:
            case EncryptionAlgorithm.SM4_CCM:
            case EncryptionAlgorithm.SM4_GCM:
                return CipherType.aead;

            case EncryptionAlgorithm.RC2_CBC_40:
            case EncryptionAlgorithm.IDEA_CBC:
            case EncryptionAlgorithm.DES40_CBC:
            case EncryptionAlgorithm.DES_CBC:
            case EncryptionAlgorithm.cls_3DES_EDE_CBC:
            case EncryptionAlgorithm.AES_128_CBC:
            case EncryptionAlgorithm.AES_256_CBC:
            case EncryptionAlgorithm.ARIA_128_CBC:
            case EncryptionAlgorithm.ARIA_256_CBC:
            case EncryptionAlgorithm.CAMELLIA_128_CBC:
            case EncryptionAlgorithm.CAMELLIA_256_CBC:
            case EncryptionAlgorithm.SEED_CBC:
            case EncryptionAlgorithm.SM4_CBC:
                return CipherType.block;

            case EncryptionAlgorithm.NULL:
            case EncryptionAlgorithm.RC4_40:
            case EncryptionAlgorithm.RC4_128:
                return CipherType.stream;

            default:
                return -1;
            }
        }

        public static int GetKeyExchangeAlgorithm(int cipherSuite)
        {
            switch (cipherSuite)
            {
            case CipherSuite.TLS_DH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.DH_anon;

            case CipherSuite.TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.DH_DSS;

            case CipherSuite.TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.DH_RSA;

            case CipherSuite.TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.DHE_DSS;

            case CipherSuite.TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_256_CCM_8:
                return KeyExchangeAlgorithm.DHE_PSK;

            case CipherSuite.TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.DHE_RSA;

            case CipherSuite.TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_NULL_SHA:
                return KeyExchangeAlgorithm.ECDH_anon;

            case CipherSuite.TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_NULL_SHA:
                return KeyExchangeAlgorithm.ECDH_ECDSA;

            case CipherSuite.TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_NULL_SHA:
                return KeyExchangeAlgorithm.ECDH_RSA;

            case CipherSuite.TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_NULL_SHA:
                return KeyExchangeAlgorithm.ECDHE_ECDSA;

            case CipherSuite.TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA384:
                return KeyExchangeAlgorithm.ECDHE_PSK;

            case CipherSuite.TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_NULL_SHA:
                return KeyExchangeAlgorithm.ECDHE_RSA;

            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_AES_256_GCM_SHA384:
            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_SM4_CCM_SM3:
            case CipherSuite.TLS_SM4_GCM_SM3:
                return KeyExchangeAlgorithm.NULL;

            case CipherSuite.TLS_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA384:
                return KeyExchangeAlgorithm.PSK;

            case CipherSuite.TLS_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_WITH_SEED_CBC_SHA:
                return KeyExchangeAlgorithm.RSA;

            case CipherSuite.TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA384:
                return KeyExchangeAlgorithm.RSA_PSK;

            case CipherSuite.TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_256_CBC_SHA:
                return KeyExchangeAlgorithm.SRP;

            case CipherSuite.TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA:
                return KeyExchangeAlgorithm.SRP_DSS;

            case CipherSuite.TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA:
                return KeyExchangeAlgorithm.SRP_RSA;

            default:
                return -1;
            }
        }

        public static IList<int> GetKeyExchangeAlgorithms(int[] cipherSuites)
        {
            var result = new List<int>();
            if (null != cipherSuites)
            {
                for (int i = 0; i < cipherSuites.Length; ++i)
                {
                    AddToSet(result, GetKeyExchangeAlgorithm(cipherSuites[i]));
                }
                result.Remove(-1);
            }
            return result;
        }

        public static int GetMacAlgorithm(int cipherSuite)
        {
            switch (cipherSuite)
            {
            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_AES_256_GCM_SHA384:
            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_SM4_CCM_SM3:
            case CipherSuite.TLS_SM4_GCM_SM3:
                return MacAlgorithm.cls_null;

            case CipherSuite.TLS_DH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_anon_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_DSS_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DH_RSA_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_DSS_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_DHE_RSA_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_anon_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDH_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_ECDHE_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA:
            case CipherSuite.TLS_RSA_WITH_SEED_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_128_CBC_SHA:
            case CipherSuite.TLS_SRP_SHA_WITH_AES_256_CBC_SHA:
                return MacAlgorithm.hmac_sha1;

            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA256:
                return MacAlgorithm.hmac_sha256;

            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_NULL_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_CBC_SHA384:
                return MacAlgorithm.hmac_sha384;

            default:
                return -1;
            }
        }

        public static ProtocolVersion GetMinimumVersion(int cipherSuite)
        {
            switch (cipherSuite)
            {
            case CipherSuite.TLS_AES_128_CCM_SHA256:
            case CipherSuite.TLS_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_AES_128_GCM_SHA256:
            case CipherSuite.TLS_AES_256_GCM_SHA384:
            case CipherSuite.TLS_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_SM4_CCM_SM3:
            case CipherSuite.TLS_SM4_GCM_SM3:
                return ProtocolVersion.TLSv13;

            case CipherSuite.TLS_DH_anon_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_anon_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_DSS_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_DHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDH_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_CBC_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_DHE_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM:
            case CipherSuite.TLS_PSK_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_PSK_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_128_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM:
            case CipherSuite.TLS_RSA_WITH_AES_256_CCM_8:
            case CipherSuite.TLS_RSA_WITH_AES_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_CBC_SHA384:
            case CipherSuite.TLS_RSA_WITH_ARIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_128_GCM_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256:
            case CipherSuite.TLS_RSA_WITH_CAMELLIA_256_GCM_SHA384:
            case CipherSuite.TLS_RSA_WITH_NULL_SHA256:
                return ProtocolVersion.TLSv12;

            default:
                return ProtocolVersion.SSLv3;
            }
        }

        public static IList<int> GetNamedGroupRoles(int[] cipherSuites)
        {
            return GetNamedGroupRoles(GetKeyExchangeAlgorithms(cipherSuites));
        }

        public static IList<int> GetNamedGroupRoles(IList<int> keyExchangeAlgorithms)
        {
            var result = new List<int>();
            foreach (int keyExchangeAlgorithm in keyExchangeAlgorithms)
            {
                switch (keyExchangeAlgorithm)
                {
                case KeyExchangeAlgorithm.DH_anon:
                case KeyExchangeAlgorithm.DH_DSS:
                case KeyExchangeAlgorithm.DH_RSA:
                case KeyExchangeAlgorithm.DHE_DSS:
                case KeyExchangeAlgorithm.DHE_PSK:
                case KeyExchangeAlgorithm.DHE_RSA:
                {
                    AddToSet(result, NamedGroupRole.dh);
                    break;
                }

                case KeyExchangeAlgorithm.ECDH_anon:
                case KeyExchangeAlgorithm.ECDH_RSA:
                case KeyExchangeAlgorithm.ECDHE_PSK:
                case KeyExchangeAlgorithm.ECDHE_RSA:
                {
                    AddToSet(result, NamedGroupRole.ecdh);
                    break;
                }

                case KeyExchangeAlgorithm.ECDH_ECDSA:
                case KeyExchangeAlgorithm.ECDHE_ECDSA:
                {
                    AddToSet(result, NamedGroupRole.ecdh);
                    AddToSet(result, NamedGroupRole.ecdsa);
                    break;
                }

                case KeyExchangeAlgorithm.NULL:
                {
                    // TODO[tls13] We're conservatively adding both here, though maybe only one is needed
                    AddToSet(result, NamedGroupRole.dh);
                    AddToSet(result, NamedGroupRole.ecdh);
                    break;
                }
                }
            }
            return result;
        }

        /// <exception cref="IOException"/>
        public static bool IsAeadCipherSuite(int cipherSuite)
        {
            return CipherType.aead == GetCipherType(cipherSuite);
        }

        /// <exception cref="IOException"/>
        public static bool IsBlockCipherSuite(int cipherSuite)
        {
            return CipherType.block == GetCipherType(cipherSuite);
        }

        /// <exception cref="IOException"/>
        public static bool IsStreamCipherSuite(int cipherSuite)
        {
            return CipherType.stream == GetCipherType(cipherSuite);
        }

        /// <returns>Whether a server can select the specified cipher suite given the available signature algorithms
        /// for ServerKeyExchange.</returns>
        public static bool IsValidCipherSuiteForSignatureAlgorithms(int cipherSuite, IList<short> sigAlgs)
        {
            int keyExchangeAlgorithm = GetKeyExchangeAlgorithm(cipherSuite);

            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.DHE_RSA:
            case KeyExchangeAlgorithm.ECDHE_ECDSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
            case KeyExchangeAlgorithm.NULL:
            case KeyExchangeAlgorithm.SRP_RSA:
            case KeyExchangeAlgorithm.SRP_DSS:
                break;

            default:
                return true;
            }

            foreach (short signatureAlgorithm in sigAlgs)
            {
                if (IsValidSignatureAlgorithmForServerKeyExchange(signatureAlgorithm, keyExchangeAlgorithm))
                    return true;
            }

            return false;
        }

        internal static bool IsValidCipherSuiteSelection(int[] offeredCipherSuites, int cipherSuite)
        {
            return null != offeredCipherSuites
                && Arrays.Contains(offeredCipherSuites, cipherSuite)
                && CipherSuite.TLS_NULL_WITH_NULL_NULL != cipherSuite
                && !CipherSuite.IsScsv(cipherSuite);
        }

        internal static bool IsValidKeyShareSelection(ProtocolVersion negotiatedVersion, int[] clientSupportedGroups,
            IDictionary<int, TlsAgreement> clientAgreements, int keyShareGroup)
        {
            return null != clientSupportedGroups
                && Arrays.Contains(clientSupportedGroups, keyShareGroup)
                && !clientAgreements.ContainsKey(keyShareGroup)
                && NamedGroup.CanBeNegotiated(keyShareGroup, negotiatedVersion);
        }

        internal static bool IsValidSignatureAlgorithmForServerKeyExchange(short signatureAlgorithm,
            int keyExchangeAlgorithm)
        {
            // TODO[tls13]

            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DHE_RSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
            case KeyExchangeAlgorithm.SRP_RSA:
                switch (signatureAlgorithm)
                {
                case SignatureAlgorithm.rsa:
                case SignatureAlgorithm.rsa_pss_rsae_sha256:
                case SignatureAlgorithm.rsa_pss_rsae_sha384:
                case SignatureAlgorithm.rsa_pss_rsae_sha512:
                case SignatureAlgorithm.rsa_pss_pss_sha256:
                case SignatureAlgorithm.rsa_pss_pss_sha384:
                case SignatureAlgorithm.rsa_pss_pss_sha512:
                    return true;
                default:
                    return false;
                }

            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.SRP_DSS:
                return SignatureAlgorithm.dsa == signatureAlgorithm;

            case KeyExchangeAlgorithm.ECDHE_ECDSA:
                switch (signatureAlgorithm)
                {
                case SignatureAlgorithm.ecdsa:
                case SignatureAlgorithm.ed25519:
                case SignatureAlgorithm.ed448:
                    return true;
                default:
                    return false;
                }

            case KeyExchangeAlgorithm.NULL:
                return SignatureAlgorithm.anonymous != signatureAlgorithm;

            default:
                return false;
            }
        }

        public static bool IsValidSignatureSchemeForServerKeyExchange(int signatureScheme, int keyExchangeAlgorithm)
        {
            short signatureAlgorithm = SignatureScheme.GetSignatureAlgorithm(signatureScheme);

            return IsValidSignatureAlgorithmForServerKeyExchange(signatureAlgorithm, keyExchangeAlgorithm);
        }

        public static bool IsValidVersionForCipherSuite(int cipherSuite, ProtocolVersion version)
        {
            version = version.GetEquivalentTlsVersion();

            ProtocolVersion minimumVersion = GetMinimumVersion(cipherSuite);
            if (minimumVersion == version)
                return true;

            if (!minimumVersion.IsEarlierVersionOf(version))
                return false;

            return ProtocolVersion.TLSv13.IsEqualOrEarlierVersionOf(minimumVersion)
                || ProtocolVersion.TLSv13.IsLaterVersionOf(version);
        }

        /// <exception cref="IOException"/>
        public static SignatureAndHashAlgorithm ChooseSignatureAndHashAlgorithm(TlsContext context,
            IList<SignatureAndHashAlgorithm> sigHashAlgs, short signatureAlgorithm)
        {
            return ChooseSignatureAndHashAlgorithm(context.ServerVersion, sigHashAlgs, signatureAlgorithm);
        }

        /// <exception cref="IOException"/>
        public static SignatureAndHashAlgorithm ChooseSignatureAndHashAlgorithm(ProtocolVersion negotiatedVersion,
            IList<SignatureAndHashAlgorithm> sigHashAlgs, short signatureAlgorithm)
        {
            if (!IsTlsV12(negotiatedVersion))
                return null;

            if (sigHashAlgs == null)
            {
                /*
                 * TODO[tls13] RFC 8446 4.2.3 Clients which desire the server to authenticate itself via
                 * a certificate MUST send the "signature_algorithms" extension.
                 */

                sigHashAlgs = GetDefaultSignatureAlgorithms(signatureAlgorithm);
            }

            SignatureAndHashAlgorithm result = null;
            foreach (SignatureAndHashAlgorithm sigHashAlg in sigHashAlgs)
            {
                if (sigHashAlg.Signature != signatureAlgorithm)
                    continue;

                short hash = sigHashAlg.Hash;
                if (hash < MinimumHashStrict)
                    continue;

                if (result == null)
                {
                    result = sigHashAlg;
                    continue;
                }

                short current = result.Hash;
                if (current < MinimumHashPreferred)
                {
                    if (hash > current)
                    {
                        result = sigHashAlg;
                    }
                }
                else if (hash >= MinimumHashPreferred)
                {
                    if (hash < current)
                    {
                        result = sigHashAlg;
                    }
                }
            }
            if (result == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return result;
        }

        public static IList<short> GetUsableSignatureAlgorithms(IList<SignatureAndHashAlgorithm> sigHashAlgs)
        {
            if (sigHashAlgs == null)
                return new List<short>(){ SignatureAlgorithm.rsa, SignatureAlgorithm.dsa, SignatureAlgorithm.ecdsa };

            var v = new List<short>();
            foreach (SignatureAndHashAlgorithm sigHashAlg in sigHashAlgs)
            {
                if (sigHashAlg.Hash >= MinimumHashStrict)
                {
                    short sigAlg = sigHashAlg.Signature;
                    if (!v.Contains(sigAlg))
                    {
                        // TODO Check for crypto support before choosing (or pass in cached list?)
                        v.Add(sigAlg);
                    }
                }
            }
            return v;
        }

        public static int GetCommonCipherSuite13(ProtocolVersion negotiatedVersion, int[] peerCipherSuites,
            int[] localCipherSuites, bool useLocalOrder)
        {
            int[] ordered = peerCipherSuites, unordered = localCipherSuites;
            if (useLocalOrder)
            {
                ordered = localCipherSuites;
                unordered = peerCipherSuites;
            }

            for (int i = 0; i < ordered.Length; ++i)
            {
                int candidate = ordered[i];
                if (Arrays.Contains(unordered, candidate) &&
                    IsValidVersionForCipherSuite(candidate, negotiatedVersion))
                {
                    return candidate;
                }
            }

            return -1;
        }

        public static int[] GetCommonCipherSuites(int[] peerCipherSuites, int[] localCipherSuites, bool useLocalOrder)
        {
            int[] ordered = peerCipherSuites, unordered = localCipherSuites;
            if (useLocalOrder)
            {
                ordered = localCipherSuites;
                unordered = peerCipherSuites;
            }

            int count = 0, limit = System.Math.Min(ordered.Length, unordered.Length);
            int[] candidates = new int[limit];
            for (int i = 0; i < ordered.Length; ++i)
            {
                int candidate = ordered[i];
                if (!Contains(candidates, 0, count, candidate)
                    && Arrays.Contains(unordered, candidate))
                {
                    candidates[count++] = candidate;
                }
            }

            if (count < limit)
            {
                candidates = Arrays.CopyOf(candidates, count);
            }

            return candidates;
        }

        public static int[] GetSupportedCipherSuites(TlsCrypto crypto, int[] suites)
        {
            return GetSupportedCipherSuites(crypto, suites, 0, suites.Length);
        }

        public static int[] GetSupportedCipherSuites(TlsCrypto crypto, int[] suites, int suitesOff, int suitesCount)
        {
            int[] supported = new int[suitesCount];
            int count = 0;

            for (int i = 0; i < suitesCount; ++i)
            {
                int suite = suites[suitesOff + i];
                if (IsSupportedCipherSuite(crypto, suite))
                {
                    supported[count++] = suite;
                }
            }

            if (count < suitesCount)
            {
                supported = Arrays.CopyOf(supported, count);
            }

            return supported;
        }

        public static bool IsSupportedCipherSuite(TlsCrypto crypto, int cipherSuite)
        {
            int keyExchangeAlgorithm = GetKeyExchangeAlgorithm(cipherSuite);
            if (!IsSupportedKeyExchange(crypto, keyExchangeAlgorithm))
                return false;

            int encryptionAlgorithm = GetEncryptionAlgorithm(cipherSuite);
            if (encryptionAlgorithm < 0 || !crypto.HasEncryptionAlgorithm(encryptionAlgorithm))
                return false;

            int macAlgorithm = GetMacAlgorithm(cipherSuite);
            if (macAlgorithm != MacAlgorithm.cls_null)
            {
                if (macAlgorithm < 0 || !crypto.HasMacAlgorithm(macAlgorithm))
                    return false;
            }

            return true;
        }

        public static bool IsSupportedKeyExchange(TlsCrypto crypto, int keyExchangeAlgorithm)
        {
            switch (keyExchangeAlgorithm)
            {
            case KeyExchangeAlgorithm.DH_anon:
            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DH_RSA:
            case KeyExchangeAlgorithm.DHE_PSK:
                return crypto.HasDHAgreement();

            case KeyExchangeAlgorithm.DHE_DSS:
                return crypto.HasDHAgreement()
                    && crypto.HasSignatureAlgorithm(SignatureAlgorithm.dsa);

            case KeyExchangeAlgorithm.DHE_RSA:
                return crypto.HasDHAgreement()
                    && HasAnyRsaSigAlgs(crypto);

            case KeyExchangeAlgorithm.ECDH_anon:
            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
            case KeyExchangeAlgorithm.ECDHE_PSK:
                return crypto.HasECDHAgreement();

            case KeyExchangeAlgorithm.ECDHE_ECDSA:
                return crypto.HasECDHAgreement()
                    && (crypto.HasSignatureAlgorithm(SignatureAlgorithm.ecdsa)
                        || crypto.HasSignatureAlgorithm(SignatureAlgorithm.ed25519)
                        || crypto.HasSignatureAlgorithm(SignatureAlgorithm.ed448));

            case KeyExchangeAlgorithm.ECDHE_RSA:
                return crypto.HasECDHAgreement()
                    && HasAnyRsaSigAlgs(crypto);

            case KeyExchangeAlgorithm.NULL:
            case KeyExchangeAlgorithm.PSK:
                return true;

            case KeyExchangeAlgorithm.RSA:
            case KeyExchangeAlgorithm.RSA_PSK:
                return crypto.HasRsaEncryption();

            case KeyExchangeAlgorithm.SRP:
                return crypto.HasSrpAuthentication();

            case KeyExchangeAlgorithm.SRP_DSS:
                return crypto.HasSrpAuthentication()
                    && crypto.HasSignatureAlgorithm(SignatureAlgorithm.dsa);

            case KeyExchangeAlgorithm.SRP_RSA:
                return crypto.HasSrpAuthentication()
                    && HasAnyRsaSigAlgs(crypto);

            default:
                return false;
            }
        }

        internal static bool HasAnyRsaSigAlgs(TlsCrypto crypto)
        {
            return crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_rsae_sha256)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_rsae_sha384)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_rsae_sha512)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_pss_sha256)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_pss_sha384)
                || crypto.HasSignatureAlgorithm(SignatureAlgorithm.rsa_pss_pss_sha512);
        }

        internal static byte[] GetCurrentPrfHash(TlsHandshakeHash handshakeHash)
        {
            return handshakeHash.ForkPrfHash().CalculateHash();
        }

        private static TlsHash CreateHash(TlsCrypto crypto, short hashAlgorithm)
        {
            return crypto.CreateHash(TlsCryptoUtilities.GetHash(hashAlgorithm));
        }

        private static TlsHash CreateHash(TlsCrypto crypto, SignatureAndHashAlgorithm signatureAndHashAlgorithm)
        {
            return crypto.CreateHash(SignatureScheme.GetCryptoHashAlgorithm(signatureAndHashAlgorithm));
        }

        /// <exception cref="IOException"/>
        private static TlsKeyExchange CreateKeyExchangeClient(TlsClient client, int keyExchange)
        {
            TlsKeyExchangeFactory factory = client.GetKeyExchangeFactory();

            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DH_anon:
                return factory.CreateDHanonKeyExchangeClient(keyExchange, client.GetDHGroupVerifier());

            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DH_RSA:
                return factory.CreateDHKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.DHE_RSA:
                return factory.CreateDheKeyExchangeClient(keyExchange, client.GetDHGroupVerifier());

            case KeyExchangeAlgorithm.ECDH_anon:
                return factory.CreateECDHanonKeyExchangeClient(keyExchange);

            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
                return factory.CreateECDHKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.ECDHE_ECDSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
                return factory.CreateECDheKeyExchangeClient(keyExchange);

            case KeyExchangeAlgorithm.RSA:
                return factory.CreateRsaKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.DHE_PSK:
                return factory.CreatePskKeyExchangeClient(keyExchange, client.GetPskIdentity(),
                    client.GetDHGroupVerifier());

            case KeyExchangeAlgorithm.ECDHE_PSK:
            case KeyExchangeAlgorithm.PSK:
            case KeyExchangeAlgorithm.RSA_PSK:
                return factory.CreatePskKeyExchangeClient(keyExchange, client.GetPskIdentity(), null);

            case KeyExchangeAlgorithm.SRP:
            case KeyExchangeAlgorithm.SRP_DSS:
            case KeyExchangeAlgorithm.SRP_RSA:
                return factory.CreateSrpKeyExchangeClient(keyExchange, client.GetSrpIdentity(),
                    client.GetSrpConfigVerifier());

            default:
                /*
                 * Note: internal error here; the TlsProtocol implementation verifies that the
                 * server-selected cipher suite was in the list of client-offered cipher suites, so if
                 * we now can't produce an implementation, we shouldn't have offered it!
                 */
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        /// <exception cref="IOException"/>
        private static TlsKeyExchange CreateKeyExchangeServer(TlsServer server, int keyExchange)
        {
            TlsKeyExchangeFactory factory = server.GetKeyExchangeFactory();

            switch (keyExchange)
            {
            case KeyExchangeAlgorithm.DH_anon:
                return factory.CreateDHanonKeyExchangeServer(keyExchange, server.GetDHConfig());

            case KeyExchangeAlgorithm.DH_DSS:
            case KeyExchangeAlgorithm.DH_RSA:
                return factory.CreateDHKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.DHE_DSS:
            case KeyExchangeAlgorithm.DHE_RSA:
                return factory.CreateDheKeyExchangeServer(keyExchange, server.GetDHConfig());

            case KeyExchangeAlgorithm.ECDH_anon:
                return factory.CreateECDHanonKeyExchangeServer(keyExchange, server.GetECDHConfig());

            case KeyExchangeAlgorithm.ECDH_ECDSA:
            case KeyExchangeAlgorithm.ECDH_RSA:
                return factory.CreateECDHKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.ECDHE_ECDSA:
            case KeyExchangeAlgorithm.ECDHE_RSA:
                return factory.CreateECDheKeyExchangeServer(keyExchange, server.GetECDHConfig());

            case KeyExchangeAlgorithm.RSA:
                return factory.CreateRsaKeyExchange(keyExchange);

            case KeyExchangeAlgorithm.DHE_PSK:
                return factory.CreatePskKeyExchangeServer(keyExchange, server.GetPskIdentityManager(),
                    server.GetDHConfig(), null);

            case KeyExchangeAlgorithm.ECDHE_PSK:
                return factory.CreatePskKeyExchangeServer(keyExchange, server.GetPskIdentityManager(), null,
                    server.GetECDHConfig());

            case KeyExchangeAlgorithm.PSK:
            case KeyExchangeAlgorithm.RSA_PSK:
                return factory.CreatePskKeyExchangeServer(keyExchange, server.GetPskIdentityManager(), null, null);

            case KeyExchangeAlgorithm.SRP:
            case KeyExchangeAlgorithm.SRP_DSS:
            case KeyExchangeAlgorithm.SRP_RSA:
                return factory.CreateSrpKeyExchangeServer(keyExchange, server.GetSrpLoginParameters());

            default:
                /*
                 * Note: internal error here; the TlsProtocol implementation verifies that the
                 * server-selected cipher suite was in the list of client-offered cipher suites, so if
                 * we now can't produce an implementation, we shouldn't have offered it!
                 */
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }
        }

        /// <exception cref="IOException"/>
        internal static TlsKeyExchange InitKeyExchangeClient(TlsClientContext clientContext, TlsClient client)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            TlsKeyExchange keyExchange = CreateKeyExchangeClient(client, securityParameters.KeyExchangeAlgorithm);
            keyExchange.Init(clientContext);
            return keyExchange;
        }

        /// <exception cref="IOException"/>
        internal static TlsKeyExchange InitKeyExchangeServer(TlsServerContext serverContext, TlsServer server)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;
            TlsKeyExchange keyExchange = CreateKeyExchangeServer(server, securityParameters.KeyExchangeAlgorithm);
            keyExchange.Init(serverContext);
            return keyExchange;
        }

        internal static TlsCipher InitCipher(TlsContext context)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            int cipherSuite = securityParameters.CipherSuite;
            int encryptionAlgorithm = GetEncryptionAlgorithm(cipherSuite);
            int macAlgorithm = GetMacAlgorithm(cipherSuite);

            if (encryptionAlgorithm < 0 || macAlgorithm < 0)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return context.Crypto.CreateCipher(new TlsCryptoParameters(context), encryptionAlgorithm, macAlgorithm);
        }

        /// <summary>Check the signature algorithm for certificates in the peer's CertPath as specified in RFC 5246
        /// 7.4.2, 7.4.4, 7.4.6 and similar rules for earlier TLS versions.</summary>
        /// <remarks>
        /// The supplied CertPath should include the trust anchor (its signature algorithm isn't checked, but in the
        /// general case checking a certificate requires the issuer certificate).
        /// </remarks>
        /// <exception cref="IOException">if any certificate in the CertPath (excepting the trust anchor) has a
        /// signature algorithm that is not one of the locally supported signature algorithms.</exception>
        public static void CheckPeerSigAlgs(TlsContext context, TlsCertificate[] peerCertPath)
        {
            if (context.IsServer)
            {
                CheckSigAlgOfClientCerts(context, peerCertPath);
            }
            else
            {
                CheckSigAlgOfServerCerts(context, peerCertPath);
            }
        }

        private static void CheckSigAlgOfClientCerts(TlsContext context, TlsCertificate[] clientCertPath)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            short[] clientCertTypes = securityParameters.ClientCertTypes;
            var serverSigAlgsCert = securityParameters.ServerSigAlgsCert;

            int trustAnchorPos = clientCertPath.Length - 1;
            for (int i = 0; i < trustAnchorPos; ++i)
            {
                TlsCertificate subjectCert = clientCertPath[i];
                TlsCertificate issuerCert = clientCertPath[i + 1];

                SignatureAndHashAlgorithm sigAndHashAlg = GetCertSigAndHashAlg(subjectCert, issuerCert);

                bool valid = false;
                if (null == sigAndHashAlg)
                {
                    // We don't recognize the 'signatureAlgorithm' of the certificate
                }
                else if (null == serverSigAlgsCert)
                {
                    // TODO Review this (legacy) logic with RFC 4346 (7.4?.2?)
                    if (null != clientCertTypes)
                    {
                        for (int j = 0; j < clientCertTypes.Length; ++j)
                        {
                            short signatureAlgorithm = GetLegacySignatureAlgorithmClientCert(clientCertTypes[j]);
                            if (sigAndHashAlg.Signature == signatureAlgorithm)
                            {
                                valid = true;
                                break;
                            }
                        }
                    }
                }
                else
                {
                    /*
                     * RFC 5246 7.4.4 Any certificates provided by the client MUST be signed using a
                     * hash/signature algorithm pair found in supported_signature_algorithms.
                     */
                    valid = ContainsSignatureAlgorithm(serverSigAlgsCert, sigAndHashAlg);
                }

                if (!valid)
                {
                    throw new TlsFatalAlert(AlertDescription.bad_certificate);
                }
            }
        }

        private static void CheckSigAlgOfServerCerts(TlsContext context, TlsCertificate[] serverCertPath)
        {
            SecurityParameters securityParameters = context.SecurityParameters;
            var clientSigAlgsCert = securityParameters.ClientSigAlgsCert;
            var clientSigAlgs = securityParameters.ClientSigAlgs;

            /*
             * NOTE: For TLS 1.2, we'll check 'signature_algorithms' too (if it's distinct), since
             * there's no way of knowing whether the server understood 'signature_algorithms_cert'.
             */
            if (clientSigAlgs == clientSigAlgsCert || IsTlsV13(securityParameters.NegotiatedVersion))
            {
                clientSigAlgs = null;
            }

            int trustAnchorPos = serverCertPath.Length - 1;
            for (int i = 0; i < trustAnchorPos; ++i)
            {
                TlsCertificate subjectCert = serverCertPath[i];
                TlsCertificate issuerCert = serverCertPath[i + 1];

                SignatureAndHashAlgorithm sigAndHashAlg = GetCertSigAndHashAlg(subjectCert, issuerCert);

                bool valid = false;
                if (null == sigAndHashAlg)
                {
                    // We don't recognize the 'signatureAlgorithm' of the certificate
                }
                else if (null == clientSigAlgsCert)
                {
                    /*
                     * RFC 4346 7.4.2. Unless otherwise specified, the signing algorithm for the
                     * certificate MUST be the same as the algorithm for the certificate key.
                     */
                    short signatureAlgorithm = GetLegacySignatureAlgorithmServerCert(
                        securityParameters.KeyExchangeAlgorithm);

                    valid = (signatureAlgorithm == sigAndHashAlg.Signature); 
                }
                else
                {
                    /*
                     * RFC 5246 7.4.2. If the client provided a "signature_algorithms" extension, then
                     * all certificates provided by the server MUST be signed by a hash/signature algorithm
                     * pair that appears in that extension.
                     */
                    valid = ContainsSignatureAlgorithm(clientSigAlgsCert, sigAndHashAlg)
                        || (null != clientSigAlgs && ContainsSignatureAlgorithm(clientSigAlgs, sigAndHashAlg));
                }

                if (!valid)
                    throw new TlsFatalAlert(AlertDescription.bad_certificate);
            }
        }

        internal static void CheckTlsFeatures(Certificate serverCertificate, IDictionary<int, byte[]> clientExtensions,
            IDictionary<int, byte[]> serverExtensions)
        {
            /*
             * RFC 7633 4.3.3. A client MUST treat a certificate with a TLS feature extension as an
             * invalid certificate if the features offered by the server do not contain all features
             * present in both the client's ClientHello message and the TLS feature extension.
             */
            byte[] tlsFeatures = serverCertificate.GetCertificateAt(0).GetExtension(TlsObjectIdentifiers.id_pe_tlsfeature);
            if (tlsFeatures != null)
            {
                // TODO[tls] Proper ASN.1 type class for this extension?
                Asn1Sequence tlsFeaturesSeq = (Asn1Sequence)ReadAsn1Object(tlsFeatures);
                for (int i = 0; i < tlsFeaturesSeq.Count; ++i)
                {
                    if (!(tlsFeaturesSeq[i] is DerInteger))
                        throw new TlsFatalAlert(AlertDescription.bad_certificate);
                }

                RequireDerEncoding(tlsFeaturesSeq, tlsFeatures);

                foreach (DerInteger tlsExtensionElement in tlsFeaturesSeq)
                {
                    BigInteger tlsExtension = tlsExtensionElement.PositiveValue;
                    if (tlsExtension.BitLength <= 16)
                    {
                        int extensionType = tlsExtension.IntValueExact;

                        if (clientExtensions.ContainsKey(extensionType) && !serverExtensions.ContainsKey(extensionType))
                            throw new TlsFatalAlert(AlertDescription.certificate_unknown);
                    }
                }
            }
        }

        internal static void ProcessClientCertificate(TlsServerContext serverContext, Certificate clientCertificate,
            TlsKeyExchange keyExchange, TlsServer server)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;
            if (null != securityParameters.PeerCertificate)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            bool isTlsV13 = IsTlsV13(securityParameters.NegotiatedVersion);
            if (isTlsV13)
            {
                // 'keyExchange' not used
            }
            else if (clientCertificate.IsEmpty)
            {
                /*
                 * NOTE: We tolerate SSLv3 clients sending an empty chain, although "If no suitable
                 * certificate is available, the client should send a no_certificate alert instead".
                 */

                keyExchange.SkipClientCredentials();
            }
            else
            {
                keyExchange.ProcessClientCertificate(clientCertificate);
            }

            securityParameters.m_peerCertificate = clientCertificate;

            /*
             * RFC 5246 7.4.6. If the client does not send any certificates, the server MAY at its
             * discretion either continue the handshake without client authentication, or respond with a
             * fatal handshake_failure alert. Also, if some aspect of the certificate chain was
             * unacceptable (e.g., it was not signed by a known, trusted CA), the server MAY at its
             * discretion either continue the handshake (considering the client unauthenticated) or send
             * a fatal alert.
             */
            server.NotifyClientCertificate(clientCertificate);
        }

        internal static void ProcessServerCertificate(TlsClientContext clientContext,
            CertificateStatus serverCertificateStatus, TlsKeyExchange keyExchange,
            TlsAuthentication clientAuthentication, IDictionary<int, byte[]> clientExtensions,
            IDictionary<int, byte[]> serverExtensions)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            bool isTlsV13 = IsTlsV13(securityParameters.NegotiatedVersion);

            if (null == clientAuthentication)
            {
                if (isTlsV13)
                    throw new TlsFatalAlert(AlertDescription.internal_error);

                // There was no server certificate message; check it's OK
                keyExchange.SkipServerCredentials();
                securityParameters.m_tlsServerEndPoint = EmptyBytes;
                return;
            }

            Certificate serverCertificate = securityParameters.PeerCertificate;

            CheckTlsFeatures(serverCertificate, clientExtensions, serverExtensions);

            if (!isTlsV13)
            {
                keyExchange.ProcessServerCertificate(serverCertificate);
            }

            clientAuthentication.NotifyServerCertificate(
                new TlsServerCertificateImpl(serverCertificate, serverCertificateStatus));
        }

        internal static SignatureAndHashAlgorithm GetCertSigAndHashAlg(TlsCertificate subjectCert, TlsCertificate issuerCert)
        {
            string sigAlgOid = subjectCert.SigAlgOid;

            if (null != sigAlgOid)
            {
                if (!PkcsObjectIdentifiers.IdRsassaPss.Id.Equals(sigAlgOid))
                    return CollectionUtilities.GetValueOrNull(CertSigAlgOids, sigAlgOid);

                RsassaPssParameters pssParams = RsassaPssParameters.GetInstance(subjectCert.GetSigAlgParams());
                if (null != pssParams)
                {
                    DerObjectIdentifier hashOid = pssParams.HashAlgorithm.Algorithm;
                    if (NistObjectIdentifiers.IdSha256.Equals(hashOid))
                    {
                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_pss_sha256))
                            return SignatureAndHashAlgorithm.rsa_pss_pss_sha256;

                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_rsae_sha256))
                            return SignatureAndHashAlgorithm.rsa_pss_rsae_sha256;
                    }
                    else if (NistObjectIdentifiers.IdSha384.Equals(hashOid))
                    {
                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_pss_sha384))
                            return SignatureAndHashAlgorithm.rsa_pss_pss_sha384;

                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_rsae_sha384))
                            return SignatureAndHashAlgorithm.rsa_pss_rsae_sha384;
                    }
                    else if (NistObjectIdentifiers.IdSha512.Equals(hashOid))
                    {
                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_pss_sha512))
                            return SignatureAndHashAlgorithm.rsa_pss_pss_sha512;

                        if (issuerCert.SupportsSignatureAlgorithmCA(SignatureAlgorithm.rsa_pss_rsae_sha512))
                            return SignatureAndHashAlgorithm.rsa_pss_rsae_sha512;
                    }
                }
            }

            return null;
        }

        internal static CertificateRequest ValidateCertificateRequest(CertificateRequest certificateRequest,
            TlsKeyExchange keyExchange)
        {
            short[] validClientCertificateTypes = keyExchange.GetClientCertificateTypes();
            if (IsNullOrEmpty(validClientCertificateTypes))
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            certificateRequest = NormalizeCertificateRequest(certificateRequest, validClientCertificateTypes);
            if (certificateRequest == null)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            return certificateRequest;
        }

        internal static CertificateRequest NormalizeCertificateRequest(CertificateRequest certificateRequest,
            short[] validClientCertificateTypes)
        {
            if (ContainsAll(validClientCertificateTypes, certificateRequest.CertificateTypes))
                return certificateRequest;

            short[] retained = RetainAll(certificateRequest.CertificateTypes, validClientCertificateTypes);
            if (retained.Length < 1)
                return null;

            // TODO Filter for unique sigAlgs/CAs only
            return new CertificateRequest(retained, certificateRequest.SupportedSignatureAlgorithms,
                certificateRequest.CertificateAuthorities);
        }

        internal static bool Contains(int[] buf, int off, int len, int value)
        {
            for (int i = 0; i < len; ++i)
            {
                if (value == buf[off + i])
                    return true;
            }
            return false;
        }

        internal static bool ContainsAll(short[] container, short[] elements)
        {
            for (int i = 0; i < elements.Length; ++i)
            {
                if (!Arrays.Contains(container, elements[i]))
                    return false;
            }
            return true;
        }

        internal static short[] RetainAll(short[] retainer, short[] elements)
        {
            short[] retained = new short[System.Math.Min(retainer.Length, elements.Length)];

            int count = 0;
            for (int i = 0; i < elements.Length; ++i)
            {
                if (Arrays.Contains(retainer, elements[i]))
                {
                    retained[count++] = elements[i];
                }
            }

            return Truncate(retained, count);
        }

        internal static short[] Truncate(short[] a, int n)
        {
            if (n >= a.Length)
                return a;

            short[] t = new short[n];
            Array.Copy(a, 0, t, 0, n);
            return t;
        }

        internal static int[] Truncate(int[] a, int n)
        {
            if (n >= a.Length)
                return a;

            int[] t = new int[n];
            Array.Copy(a, 0, t, 0, n);
            return t;
        }

        /// <exception cref="IOException"/>
        internal static TlsCredentialedAgreement RequireAgreementCredentials(TlsCredentials credentials)
        {
            if (!(credentials is TlsCredentialedAgreement))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return (TlsCredentialedAgreement)credentials;
        }

        /// <exception cref="IOException"/>
        internal static TlsCredentialedDecryptor RequireDecryptorCredentials(TlsCredentials credentials)
        {
            if (!(credentials is TlsCredentialedDecryptor))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return (TlsCredentialedDecryptor)credentials;
        }

        /// <exception cref="IOException"/>
        internal static TlsCredentialedSigner RequireSignerCredentials(TlsCredentials credentials)
        {
            if (!(credentials is TlsCredentialedSigner))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return (TlsCredentialedSigner)credentials;
        }

        /// <exception cref="IOException"/>
        private static void CheckClientCertificateType(CertificateRequest certificateRequest,
            short clientCertificateType, short alertDescription)
        {
            if (clientCertificateType < 0
                || !Arrays.Contains(certificateRequest.CertificateTypes, clientCertificateType))
            {
                throw new TlsFatalAlert(alertDescription);
            }
        }

        private static void CheckDowngradeMarker(byte[] randomBlock, byte[] downgradeMarker)
        {
            int len = downgradeMarker.Length;
            if (ConstantTimeAreEqual(len, downgradeMarker, 0, randomBlock, randomBlock.Length - len))
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);
        }

        internal static void CheckDowngradeMarker(ProtocolVersion version, byte[] randomBlock)
        {
            version = version.GetEquivalentTlsVersion();

            if (version.IsEqualOrEarlierVersionOf(ProtocolVersion.TLSv11))
            {
                CheckDowngradeMarker(randomBlock, DowngradeTlsV11);
            }
            if (version.IsEqualOrEarlierVersionOf(ProtocolVersion.TLSv12))
            {
                CheckDowngradeMarker(randomBlock, DowngradeTlsV12);
            }
        }

        internal static void WriteDowngradeMarker(ProtocolVersion version, byte[] randomBlock)
        {
            version = version.GetEquivalentTlsVersion();

            byte[] marker;
            if (ProtocolVersion.TLSv12 == version)
            {
                marker = DowngradeTlsV12;
            }
            else if (version.IsEqualOrEarlierVersionOf(ProtocolVersion.TLSv11))
            {
                marker = DowngradeTlsV11;
            }
            else
            {
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            Array.Copy(marker, 0, randomBlock, randomBlock.Length - marker.Length, marker.Length);
        }

        internal static TlsAuthentication ReceiveServerCertificate(TlsClientContext clientContext, TlsClient client,
            MemoryStream buf)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            if (KeyExchangeAlgorithm.IsAnonymous(securityParameters.KeyExchangeAlgorithm)
                || null != securityParameters.PeerCertificate)
            {
                throw new TlsFatalAlert(AlertDescription.unexpected_message);
            }

            MemoryStream endPointHash = new MemoryStream();

            Certificate.ParseOptions options = new Certificate.ParseOptions()
                .SetMaxChainLength(client.GetMaxCertificateChainLength());

            Certificate serverCertificate = Certificate.Parse(options, clientContext, buf, endPointHash);

            TlsProtocol.AssertEmpty(buf);

            if (serverCertificate.IsEmpty)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            securityParameters.m_peerCertificate = serverCertificate;
            securityParameters.m_tlsServerEndPoint = endPointHash.ToArray();

            TlsAuthentication authentication = client.GetAuthentication();
            if (null == authentication)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return authentication;
        }

        internal static TlsAuthentication Receive13ServerCertificate(TlsClientContext clientContext, TlsClient client,
            MemoryStream buf)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            if (null != securityParameters.PeerCertificate)
                throw new TlsFatalAlert(AlertDescription.unexpected_message);

            Certificate.ParseOptions options = new Certificate.ParseOptions()
                .SetMaxChainLength(client.GetMaxCertificateChainLength());

            Certificate serverCertificate = Certificate.Parse(options, clientContext, buf, null);

            TlsProtocol.AssertEmpty(buf);

            if (serverCertificate.GetCertificateRequestContext().Length > 0)
                throw new TlsFatalAlert(AlertDescription.illegal_parameter);

            if (serverCertificate.IsEmpty)
                throw new TlsFatalAlert(AlertDescription.decode_error);

            securityParameters.m_peerCertificate = serverCertificate;
            securityParameters.m_tlsServerEndPoint = null;

            TlsAuthentication authentication = client.GetAuthentication();
            if (null == authentication)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return authentication;
        }

        internal static TlsAuthentication Skip13ServerCertificate(TlsClientContext clientContext)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            if (null != securityParameters.PeerCertificate)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            securityParameters.m_peerCertificate = null;
            securityParameters.m_tlsServerEndPoint = null;

            return null;
        }

        public static bool ContainsNonAscii(byte[] bs)
        {
            for (int i = 0; i < bs.Length; ++i)
            {
                int c = bs[i];
                if (c >= 0x80)
                    return true;
            }
            return false;
        }

        public static bool ContainsNonAscii(string s)
        {
            for (int i = 0; i < s.Length; ++i)
            {
                int c = s[i];
                if (c >= 0x80)
                    return true;
            }
            return false;
        }

        internal static IDictionary<int, TlsAgreement> AddKeyShareToClientHello(TlsClientContext clientContext,
            TlsClient client, IDictionary<int, byte[]> clientExtensions)
        {
            /*
             * RFC 8446 9.2. If containing a "supported_groups" extension, it MUST also contain a
             * "key_share" extension, and vice versa. An empty KeyShare.client_shares vector is
             * permitted.
             */
            if (!IsTlsV13(clientContext.ClientVersion)
                || !clientExtensions.ContainsKey(ExtensionType.supported_groups))
            {
                return null;
            }

            var supportedGroups = TlsExtensionsUtilities.GetSupportedGroupsExtension(clientExtensions);
            var keyShareGroups = client.GetEarlyKeyShareGroups();
            var clientAgreements = new Dictionary<int, TlsAgreement>(3);
            var clientShares = new List<KeyShareEntry>(2);

            CollectKeyShares(clientContext.Crypto, supportedGroups, keyShareGroups, clientAgreements, clientShares);

            // TODO[tls13-psk] When clientShares empty, consider not adding extension if pre_shared_key in use
            TlsExtensionsUtilities.AddKeyShareClientHello(clientExtensions, clientShares);

            return clientAgreements;
        }

        internal static IDictionary<int, TlsAgreement> AddKeyShareToClientHelloRetry(TlsClientContext clientContext,
            IDictionary<int, byte[]> clientExtensions, int keyShareGroup)
        {
            int[] supportedGroups = new int[]{ keyShareGroup };
            var keyShareGroups = VectorOfOne(keyShareGroup);
            var clientAgreements = new Dictionary<int, TlsAgreement>(1);
            var clientShares = new List<KeyShareEntry>(1);

            CollectKeyShares(clientContext.Crypto, supportedGroups, keyShareGroups, clientAgreements, clientShares);

            TlsExtensionsUtilities.AddKeyShareClientHello(clientExtensions, clientShares);

            if (clientAgreements.Count < 1 || clientShares.Count < 1)
            {
                // NOTE: Probable cause is declaring an unsupported NamedGroup in supported_groups extension 
                throw new TlsFatalAlert(AlertDescription.internal_error);
            }

            return clientAgreements;
        }

        private static void CollectKeyShares(TlsCrypto crypto, int[] supportedGroups, IList<int> keyShareGroups,
            IDictionary<int, TlsAgreement> clientAgreements, IList<KeyShareEntry> clientShares)
        {
            if (IsNullOrEmpty(supportedGroups))
                return;

            if (null == keyShareGroups || keyShareGroups.Count < 1)
                return;

            for (int i = 0; i < supportedGroups.Length; ++i)
            {
                int supportedGroup = supportedGroups[i];

                if (!keyShareGroups.Contains(supportedGroup)
                    || clientAgreements.ContainsKey(supportedGroup)
                    || !crypto.HasNamedGroup(supportedGroup))
                {
                    continue;
                }

                TlsAgreement agreement = null;
                if (NamedGroup.RefersToASpecificCurve(supportedGroup))
                {
                    if (crypto.HasECDHAgreement())
                    {
                        agreement = crypto.CreateECDomain(new TlsECConfig(supportedGroup)).CreateECDH();
                    }
                }
                else if (NamedGroup.RefersToASpecificFiniteField(supportedGroup))
                {
                    if (crypto.HasDHAgreement())
                    {
                        agreement = crypto.CreateDHDomain(new TlsDHConfig(supportedGroup, true)).CreateDH();
                    }
                }

                if (null != agreement)
                {
                    byte[] key_exchange = agreement.GenerateEphemeral();
                    KeyShareEntry clientShare = new KeyShareEntry(supportedGroup, key_exchange);

                    clientShares.Add(clientShare);
                    clientAgreements[supportedGroup] = agreement;
                }
            }
        }

        internal static KeyShareEntry SelectKeyShare(IList<KeyShareEntry> clientShares, int keyShareGroup)
        {
            if (null != clientShares && 1 == clientShares.Count)
            {
                KeyShareEntry clientShare = (KeyShareEntry)clientShares[0];
                if (null != clientShare && clientShare.NamedGroup == keyShareGroup)
                {
                    return clientShare;
                }
            }
            return null;
        }

        internal static KeyShareEntry SelectKeyShare(TlsCrypto crypto, ProtocolVersion negotiatedVersion,
            IList<KeyShareEntry> clientShares, int[] clientSupportedGroups, int[] serverSupportedGroups)
        {
            if (null != clientShares && !IsNullOrEmpty(clientSupportedGroups) && !IsNullOrEmpty(serverSupportedGroups))
            {
                foreach (KeyShareEntry clientShare in clientShares)
                {
                    int group = clientShare.NamedGroup;

                    if (!NamedGroup.CanBeNegotiated(group, negotiatedVersion))
                        continue;

                    if (!Arrays.Contains(serverSupportedGroups, group) ||
                        !Arrays.Contains(clientSupportedGroups, group))
                    {
                        continue;
                    }

                    if (!crypto.HasNamedGroup(group))
                        continue;

                    if ((NamedGroup.RefersToASpecificCurve(group) && !crypto.HasECDHAgreement()) ||
                        (NamedGroup.RefersToASpecificFiniteField(group) && !crypto.HasDHAgreement())) 
                    {
                        continue;
                    }

                    return clientShare;
                }
            }
            return null;
        }

        internal static int SelectKeyShareGroup(TlsCrypto crypto, ProtocolVersion negotiatedVersion,
            int[] clientSupportedGroups, int[] serverSupportedGroups)
        {
            if (!IsNullOrEmpty(clientSupportedGroups) && !IsNullOrEmpty(serverSupportedGroups))
            {
                foreach (int group in clientSupportedGroups)
                {
                    if (!NamedGroup.CanBeNegotiated(group, negotiatedVersion))
                        continue;

                    if (!Arrays.Contains(serverSupportedGroups, group))
                        continue;

                    if (!crypto.HasNamedGroup(group))
                        continue;

                    if ((NamedGroup.RefersToASpecificCurve(group) && !crypto.HasECDHAgreement()) ||
                        (NamedGroup.RefersToASpecificFiniteField(group) && !crypto.HasDHAgreement())) 
                    {
                        continue;
                    }

                    return group;
                }
            }
            return -1;
        }

        internal static byte[] ReadEncryptedPms(TlsContext context, Stream input)
        {
            if (IsSsl(context))
                return Ssl3Utilities.ReadEncryptedPms(input);

            return ReadOpaque16(input);
        }

        internal static void WriteEncryptedPms(TlsContext context, byte[] encryptedPms, Stream output)
        {
            if (IsSsl(context))
            {
                Ssl3Utilities.WriteEncryptedPms(encryptedPms, output);
            }
            else
            {
                WriteOpaque16(encryptedPms, output);
            }
        }

        internal static byte[] GetSessionID(TlsSession tlsSession)
        {
            if (null != tlsSession)
            {
                byte[] sessionID = tlsSession.SessionID;
                if (null != sessionID
                    && sessionID.Length > 0
                    && sessionID.Length <= 32)
                {
                    return sessionID;
                }
            }
            return EmptyBytes;
        }

        internal static void AdjustTranscriptForRetry(TlsHandshakeHash handshakeHash)
        {
            byte[] clientHelloHash = GetCurrentPrfHash(handshakeHash);
            handshakeHash.Reset();

            int length = clientHelloHash.Length;
            CheckUint8(length);

            byte[] synthetic = new byte[4 + length];
            WriteUint8(HandshakeType.message_hash, synthetic, 0);
            WriteUint24(length, synthetic, 1);
            Array.Copy(clientHelloHash, 0, synthetic, 4, length);

            handshakeHash.Update(synthetic, 0, synthetic.Length);
        }

        internal static TlsCredentials EstablishClientCredentials(TlsAuthentication clientAuthentication,
            CertificateRequest certificateRequest)
        {
            return ValidateCredentials(clientAuthentication.GetClientCredentials(certificateRequest));
        }

        internal static TlsCredentialedSigner Establish13ClientCredentials(TlsAuthentication clientAuthentication,
            CertificateRequest certificateRequest)
        {
            return Validate13Credentials(clientAuthentication.GetClientCredentials(certificateRequest));
        }

        internal static void EstablishClientSigAlgs(SecurityParameters securityParameters,
            IDictionary<int, byte[]> clientExtensions)
        {
            securityParameters.m_clientSigAlgs = TlsExtensionsUtilities.GetSignatureAlgorithmsExtension(
                clientExtensions);
            securityParameters.m_clientSigAlgsCert = TlsExtensionsUtilities.GetSignatureAlgorithmsCertExtension(
                clientExtensions);
        }

        internal static TlsCredentials EstablishServerCredentials(TlsServer server)
        {
            return ValidateCredentials(server.GetCredentials());
        }

        internal static TlsCredentialedSigner Establish13ServerCredentials(TlsServer server)
        {
            return Validate13Credentials(server.GetCredentials());
        }

        internal static void EstablishServerSigAlgs(SecurityParameters securityParameters,
            CertificateRequest certificateRequest)
        {
            securityParameters.m_clientCertTypes = certificateRequest.CertificateTypes;
            securityParameters.m_serverSigAlgs = certificateRequest.SupportedSignatureAlgorithms;
            securityParameters.m_serverSigAlgsCert = certificateRequest.SupportedSignatureAlgorithmsCert;

            if (null == securityParameters.ServerSigAlgsCert)
            {
                securityParameters.m_serverSigAlgsCert = securityParameters.ServerSigAlgs;
            }
        }

        internal static TlsCredentials ValidateCredentials(TlsCredentials credentials)
        {
            if (null != credentials)
            {
                int count = 0;
                count += (credentials is TlsCredentialedAgreement) ? 1 : 0;
                count += (credentials is TlsCredentialedDecryptor) ? 1 : 0;
                count += (credentials is TlsCredentialedSigner) ? 1 : 0;
                if (count != 1)
                    throw new TlsFatalAlert(AlertDescription.internal_error);
            }
            return credentials;
        }

        internal static TlsCredentialedSigner Validate13Credentials(TlsCredentials credentials)
        {
            if (null == credentials)
                return null;

            if (!(credentials is TlsCredentialedSigner))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return (TlsCredentialedSigner)credentials;
        }

        internal static void NegotiatedCipherSuite(SecurityParameters securityParameters, int cipherSuite)
        {
            securityParameters.m_cipherSuite = cipherSuite;
            securityParameters.m_keyExchangeAlgorithm = GetKeyExchangeAlgorithm(cipherSuite);

            int prfAlgorithm = GetPrfAlgorithm(securityParameters, cipherSuite);
            securityParameters.m_prfAlgorithm = prfAlgorithm;

            switch (prfAlgorithm)
            {
            case PrfAlgorithm.ssl_prf_legacy:
            case PrfAlgorithm.tls_prf_legacy:
            {
                securityParameters.m_prfCryptoHashAlgorithm = -1;
                securityParameters.m_prfHashLength = -1;
                break;
            }
            default:
            {
                int prfCryptoHashAlgorithm = TlsCryptoUtilities.GetHashForPrf(prfAlgorithm);

                securityParameters.m_prfCryptoHashAlgorithm = prfCryptoHashAlgorithm;
                securityParameters.m_prfHashLength = TlsCryptoUtilities.GetHashOutputSize(prfCryptoHashAlgorithm);
                break;
            }
            }

            /*
             * TODO[tls13] We're slowly moving towards negotiating cipherSuite THEN version. We could
             * move this to "after parameter negotiation" i.e. after ServerHello/EncryptedExtensions.
             */
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;
            if (IsTlsV13(negotiatedVersion))
            {
                securityParameters.m_verifyDataLength = securityParameters.PrfHashLength;
            }
            else
            {
                securityParameters.m_verifyDataLength = negotiatedVersion.IsSsl ? 36 : 12;
            }
        }

        internal static void NegotiatedVersion(SecurityParameters securityParameters)
        {
            if (!IsSignatureAlgorithmsExtensionAllowed(securityParameters.NegotiatedVersion))
            {
                securityParameters.m_clientSigAlgs = null;
                securityParameters.m_clientSigAlgsCert = null;
                return;
            }

            if (null == securityParameters.ClientSigAlgs)
            {
                securityParameters.m_clientSigAlgs = GetLegacySupportedSignatureAlgorithms();
            }

            if (null == securityParameters.ClientSigAlgsCert)
            {
                securityParameters.m_clientSigAlgsCert = securityParameters.ClientSigAlgs;
            }
        }

        internal static void NegotiatedVersionDtlsClient(TlsClientContext clientContext, TlsClient client)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (!ProtocolVersion.IsSupportedDtlsVersionClient(negotiatedVersion))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            NegotiatedVersion(securityParameters);

            client.NotifyServerVersion(negotiatedVersion);
        }

        internal static void NegotiatedVersionDtlsServer(TlsServerContext serverContext)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (!ProtocolVersion.IsSupportedDtlsVersionServer(negotiatedVersion))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            NegotiatedVersion(securityParameters);
        }

        internal static void NegotiatedVersionTlsClient(TlsClientContext clientContext, TlsClient client)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (!ProtocolVersion.IsSupportedTlsVersionClient(negotiatedVersion))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            NegotiatedVersion(securityParameters);

            client.NotifyServerVersion(negotiatedVersion);
        }

        internal static void NegotiatedVersionTlsServer(TlsServerContext serverContext)
        {
            SecurityParameters securityParameters = serverContext.SecurityParameters;
            ProtocolVersion negotiatedVersion = securityParameters.NegotiatedVersion;

            if (!ProtocolVersion.IsSupportedTlsVersionServer(negotiatedVersion))
                throw new TlsFatalAlert(AlertDescription.internal_error);

            NegotiatedVersion(securityParameters);
        }

        internal static TlsSecret DeriveSecret(SecurityParameters securityParameters, TlsSecret secret, string label,
            byte[] transcriptHash)
        {
            int prfCryptoHashAlgorithm = securityParameters.PrfCryptoHashAlgorithm;
            int prfHashLength = securityParameters.PrfHashLength;

            return DeriveSecret(prfCryptoHashAlgorithm, prfHashLength, secret, label, transcriptHash);
        }

        internal static TlsSecret DeriveSecret(int prfCryptoHashAlgorithm, int prfHashLength, TlsSecret secret,
            string label, byte[] transcriptHash)
        {
            if (transcriptHash.Length != prfHashLength)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsCryptoUtilities.HkdfExpandLabel(secret, prfCryptoHashAlgorithm, label, transcriptHash,
                prfHashLength);
        }

        internal static TlsSecret GetSessionMasterSecret(TlsCrypto crypto, TlsSecret masterSecret)
        {
            if (null != masterSecret)
            {
                lock (masterSecret)
                {
                    if (masterSecret.IsAlive())
                        return crypto.AdoptSecret(masterSecret);
                }
            }

            return null;
        }

        internal static bool IsPermittedExtensionType13(int handshakeType, int extensionType)
        {
            switch (extensionType)
            {
            case ExtensionType.server_name:
            case ExtensionType.max_fragment_length:
            case ExtensionType.supported_groups:
            case ExtensionType.use_srtp:
            case ExtensionType.heartbeat:
            case ExtensionType.application_layer_protocol_negotiation:
            case ExtensionType.client_certificate_type:
            case ExtensionType.server_certificate_type:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.encrypted_extensions:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.status_request:
            case ExtensionType.signed_certificate_timestamp:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.certificate_request:
                case HandshakeType.certificate:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.signature_algorithms:
            case ExtensionType.compress_certificate:
            case ExtensionType.certificate_authorities:
            case ExtensionType.signature_algorithms_cert:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.certificate_request:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.padding:
            case ExtensionType.psk_key_exchange_modes:
            case ExtensionType.post_handshake_auth:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.key_share:
            case ExtensionType.supported_versions:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.server_hello:
                case HandshakeType.hello_retry_request:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.pre_shared_key:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.server_hello:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.early_data:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.encrypted_extensions:
                case HandshakeType.new_session_ticket:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.cookie:
            {
                switch (handshakeType)
                {
                case HandshakeType.client_hello:
                case HandshakeType.hello_retry_request:
                    return true;
                default:
                    return false;
                }
            }
            case ExtensionType.oid_filters:
            {
                switch (handshakeType)
                {
                case HandshakeType.certificate_request:
                    return true;
                default:
                    return false;
                }
            }
            default:
            {
                return !ExtensionType.IsRecognized(extensionType);
            }
            }
        }

        /// <exception cref="IOException"/>
        internal static void CheckExtensionData13(IDictionary<int, byte[]> extensions, int handshakeType,
            short alertDescription)
        {
            foreach (int extensionType in extensions.Keys)
            {
                if (!IsPermittedExtensionType13(handshakeType, extensionType))
                    throw new TlsFatalAlert(alertDescription, "Invalid extension: "
                        + ExtensionType.GetText(extensionType));
            }
        }

        /// <summary>Generate a pre_master_secret and send it encrypted to the server.</summary>
        /// <exception cref="IOException"/>
        public static TlsSecret GenerateEncryptedPreMasterSecret(TlsContext context, TlsEncryptor encryptor,
            Stream output)
        {
            ProtocolVersion version = context.RsaPreMasterSecretVersion;
            TlsSecret preMasterSecret = context.Crypto.GenerateRsaPreMasterSecret(version);
            byte[] encryptedPreMasterSecret = preMasterSecret.Encrypt(encryptor);
            WriteEncryptedPms(context, encryptedPreMasterSecret, output);
            return preMasterSecret;
        }

        public static bool IsTimeout(SocketException e)
        {
            return SocketError.TimedOut == e.SocketErrorCode;
        }

        /// <exception cref="IOException"/>
        internal static void AddPreSharedKeyToClientExtensions(TlsPsk[] psks, IDictionary<int, byte[]> clientExtensions)
        {
            var identities = new List<PskIdentity>(psks.Length);
            for (int i = 0; i < psks.Length; ++i)
            {
                TlsPsk psk = psks[i];

                // TODO[tls13-psk] Handle obfuscated_ticket_age for resumption PSKs
                identities.Add(new PskIdentity(psk.Identity, 0L));
            }

            TlsExtensionsUtilities.AddPreSharedKeyClientHello(clientExtensions, new OfferedPsks(identities));
        }

        /// <exception cref="IOException"/>
        internal static OfferedPsks.BindersConfig AddPreSharedKeyToClientHello(TlsClientContext clientContext,
            TlsClient client, IDictionary<int, byte[]> clientExtensions, int[] offeredCipherSuites)
        {
            if (!IsTlsV13(clientContext.ClientVersion))
                return null;

            TlsPskExternal[] pskExternals = GetPskExternalsClient(client, offeredCipherSuites);
            if (null == pskExternals)
                return null;

            short[] pskKeyExchangeModes = client.GetPskKeyExchangeModes();
            if (IsNullOrEmpty(pskKeyExchangeModes))
                throw new TlsFatalAlert(AlertDescription.internal_error,
                    "External PSKs configured but no PskKeyExchangeMode available");

            TlsSecret[] pskEarlySecrets = GetPskEarlySecrets(clientContext.Crypto, pskExternals);

            int bindersSize = OfferedPsks.GetBindersSize(pskExternals);

            AddPreSharedKeyToClientExtensions(pskExternals, clientExtensions);
            TlsExtensionsUtilities.AddPskKeyExchangeModesExtension(clientExtensions, pskKeyExchangeModes);

            return new OfferedPsks.BindersConfig(pskExternals, pskKeyExchangeModes, pskEarlySecrets, bindersSize);
        }

        /// <exception cref="IOException"/>
        internal static OfferedPsks.BindersConfig AddPreSharedKeyToClientHelloRetry(TlsClientContext clientContext,
            OfferedPsks.BindersConfig clientBinders, IDictionary<int, byte[]> clientExtensions)
        {
            SecurityParameters securityParameters = clientContext.SecurityParameters;

            int prfAlgorithm = GetPrfAlgorithm13(securityParameters.CipherSuite);

            var pskIndices = GetPskIndices(clientBinders.m_psks, prfAlgorithm);
            if (pskIndices.Count < 1)
                return null;

            OfferedPsks.BindersConfig result = clientBinders;

            int count = pskIndices.Count;
            if (count < clientBinders.m_psks.Length)
            {
                TlsPsk[] psks = new TlsPsk[count];
                TlsSecret[] earlySecrets = new TlsSecret[count];

                for (int i = 0; i < count; ++i)
                {
                    int j = (int)pskIndices[i];

                    psks[i] = clientBinders.m_psks[j];
                    earlySecrets[i] = clientBinders.m_earlySecrets[j];
                }

                int bindersSize = OfferedPsks.GetBindersSize(psks);

                result = new OfferedPsks.BindersConfig(psks, clientBinders.m_pskKeyExchangeModes, earlySecrets,
                    bindersSize);
            }

            AddPreSharedKeyToClientExtensions(result.m_psks, clientExtensions);
            // NOTE: psk_key_exchange_modes should already be in 'clientExtensions' from the ClientHello

            return result;
        }

        internal static OfferedPsks.SelectedConfig SelectPreSharedKey(TlsServerContext serverContext, TlsServer server,
            IDictionary<int, byte[]> clientHelloExtensions, HandshakeMessageInput clientHelloMessage,
            TlsHandshakeHash handshakeHash, bool afterHelloRetryRequest)
        {
            bool handshakeHashUpdated = false;

            OfferedPsks offeredPsks = TlsExtensionsUtilities.GetPreSharedKeyClientHello(clientHelloExtensions);
            if (null != offeredPsks)
            {
                short[] pskKeyExchangeModes = TlsExtensionsUtilities.GetPskKeyExchangeModesExtension(
                    clientHelloExtensions);
                if (IsNullOrEmpty(pskKeyExchangeModes))
                    throw new TlsFatalAlert(AlertDescription.missing_extension);

                // TODO[tls13] Add support for psk_ke?
                if (Arrays.Contains(pskKeyExchangeModes, PskKeyExchangeMode.psk_dhe_ke))
                {
                    // TODO[tls13] Prefer to get the exact index from the server?
                    TlsPskExternal psk = server.GetExternalPsk(offeredPsks.Identities);
                    if (null != psk)
                    {
                        int index = offeredPsks.GetIndexOfIdentity(new PskIdentity(psk.Identity, 0L));
                        if (index >= 0)
                        {
                            byte[] binder = (byte[])offeredPsks.Binders[index];

                            TlsCrypto crypto = serverContext.Crypto;
                            TlsSecret earlySecret = GetPskEarlySecret(crypto, psk);

                            // TODO[tls13-psk] Handle resumption PSKs
                            bool isExternalPsk = true;
                            int pskCryptoHashAlgorithm = TlsCryptoUtilities.GetHashForPrf(psk.PrfAlgorithm);

                            byte[] transcriptHash;
                            {
                                handshakeHashUpdated = true;
                                int bindersSize = offeredPsks.BindersSize;
                                clientHelloMessage.UpdateHashPrefix(handshakeHash, bindersSize);

                                if (afterHelloRetryRequest)
                                {
                                    transcriptHash = handshakeHash.GetFinalHash(pskCryptoHashAlgorithm);
                                }
                                else
                                {
                                    TlsHash hash = crypto.CreateHash(pskCryptoHashAlgorithm);
                                    handshakeHash.CopyBufferTo(new TlsHashSink(hash));
                                    transcriptHash = hash.CalculateHash();
                                }

                                clientHelloMessage.UpdateHashSuffix(handshakeHash, bindersSize);
                            }

                            byte[] calculatedBinder = CalculatePskBinder(crypto, isExternalPsk, pskCryptoHashAlgorithm,
                                earlySecret, transcriptHash);

                            if (Arrays.ConstantTimeAreEqual(calculatedBinder, binder))
                                return new OfferedPsks.SelectedConfig(index, psk, pskKeyExchangeModes, earlySecret);
                        }
                    }
                }
            }

            if (!handshakeHashUpdated)
            {
                clientHelloMessage.UpdateHash(handshakeHash);
            }

            return null;
        }

        internal static TlsSecret GetPskEarlySecret(TlsCrypto crypto, TlsPsk psk)
        {
            int cryptoHashAlgorithm = TlsCryptoUtilities.GetHashForPrf(psk.PrfAlgorithm);

            return crypto
                .HkdfInit(cryptoHashAlgorithm)
                .HkdfExtract(cryptoHashAlgorithm, psk.Key);
        }

        internal static TlsSecret[] GetPskEarlySecrets(TlsCrypto crypto, TlsPsk[] psks)
        {
            int count = psks.Length;
            TlsSecret[] earlySecrets = new TlsSecret[count];
            for (int i = 0; i < count; ++i)
            {
                earlySecrets[i] = GetPskEarlySecret(crypto, psks[i]);
            }
            return earlySecrets;
        }

        /// <exception cref="IOException"/>
        internal static TlsPskExternal[] GetPskExternalsClient(TlsClient client, int[] offeredCipherSuites)
        {
            var externalPsks = client.GetExternalPsks();
            if (IsNullOrEmpty(externalPsks))
                return null;

            int[] prfAlgorithms = GetPrfAlgorithms13(offeredCipherSuites);

            int count = externalPsks.Count;
            TlsPskExternal[] result = new TlsPskExternal[count];

            for (int i = 0; i < count; ++i)
            {
                TlsPskExternal pskExternal = externalPsks[i] as TlsPskExternal;
                if (null == pskExternal)
                    throw new TlsFatalAlert(AlertDescription.internal_error,
                        "External PSKs element is not a TlsPSKExternal");

                if (!Arrays.Contains(prfAlgorithms, pskExternal.PrfAlgorithm))
                    throw new TlsFatalAlert(AlertDescription.internal_error,
                        "External PSK incompatible with offered cipher suites");

                result[i] = pskExternal;
            }

            return result;
        }

        internal static IList<int> GetPskIndices(TlsPsk[] psks, int prfAlgorithm)
        {
            var v = new List<int>(psks.Length);
            for (int i = 0; i < psks.Length; ++i)
            {
                if (psks[i].PrfAlgorithm == prfAlgorithm)
                {
                    v.Add(i);
                }
            }
            return v;
        }
    }
}
