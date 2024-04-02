using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Kisa;
using Org.BouncyCastle.Asn1.Misc;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Ntt;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Paddings;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Utilities
{
    public class CipherFactory
    {
        private CipherFactory()
        {
        }

        private static readonly short[] rc2Ekb =
        {
            0x5d, 0xbe, 0x9b, 0x8b, 0x11, 0x99, 0x6e, 0x4d, 0x59, 0xf3, 0x85, 0xa6, 0x3f, 0xb7, 0x83, 0xc5,
            0xe4, 0x73, 0x6b, 0x3a, 0x68, 0x5a, 0xc0, 0x47, 0xa0, 0x64, 0x34, 0x0c, 0xf1, 0xd0, 0x52, 0xa5,
            0xb9, 0x1e, 0x96, 0x43, 0x41, 0xd8, 0xd4, 0x2c, 0xdb, 0xf8, 0x07, 0x77, 0x2a, 0xca, 0xeb, 0xef,
            0x10, 0x1c, 0x16, 0x0d, 0x38, 0x72, 0x2f, 0x89, 0xc1, 0xf9, 0x80, 0xc4, 0x6d, 0xae, 0x30, 0x3d,
            0xce, 0x20, 0x63, 0xfe, 0xe6, 0x1a, 0xc7, 0xb8, 0x50, 0xe8, 0x24, 0x17, 0xfc, 0x25, 0x6f, 0xbb,
            0x6a, 0xa3, 0x44, 0x53, 0xd9, 0xa2, 0x01, 0xab, 0xbc, 0xb6, 0x1f, 0x98, 0xee, 0x9a, 0xa7, 0x2d,
            0x4f, 0x9e, 0x8e, 0xac, 0xe0, 0xc6, 0x49, 0x46, 0x29, 0xf4, 0x94, 0x8a, 0xaf, 0xe1, 0x5b, 0xc3,
            0xb3, 0x7b, 0x57, 0xd1, 0x7c, 0x9c, 0xed, 0x87, 0x40, 0x8c, 0xe2, 0xcb, 0x93, 0x14, 0xc9, 0x61,
            0x2e, 0xe5, 0xcc, 0xf6, 0x5e, 0xa8, 0x5c, 0xd6, 0x75, 0x8d, 0x62, 0x95, 0x58, 0x69, 0x76, 0xa1,
            0x4a, 0xb5, 0x55, 0x09, 0x78, 0x33, 0x82, 0xd7, 0xdd, 0x79, 0xf5, 0x1b, 0x0b, 0xde, 0x26, 0x21,
            0x28, 0x74, 0x04, 0x97, 0x56, 0xdf, 0x3c, 0xf0, 0x37, 0x39, 0xdc, 0xff, 0x06, 0xa4, 0xea, 0x42,
            0x08, 0xda, 0xb4, 0x71, 0xb0, 0xcf, 0x12, 0x7a, 0x4e, 0xfa, 0x6c, 0x1d, 0x84, 0x00, 0xc8, 0x7f,
            0x91, 0x45, 0xaa, 0x2b, 0xc2, 0xb1, 0x8f, 0xd5, 0xba, 0xf2, 0xad, 0x19, 0xb2, 0x67, 0x36, 0xf7,
            0x0f, 0x0a, 0x92, 0x7d, 0xe3, 0x9d, 0xe9, 0x90, 0x3e, 0x23, 0x27, 0x66, 0x13, 0xec, 0x81, 0x15,
            0xbd, 0x22, 0xbf, 0x9f, 0x7e, 0xa9, 0x51, 0x4b, 0x4c, 0xfb, 0x02, 0xd3, 0x70, 0x86, 0x31, 0xe7,
            0x3b, 0x05, 0x03, 0x54, 0x60, 0x48, 0x65, 0x18, 0xd2, 0xcd, 0x5f, 0x32, 0x88, 0x0e, 0x35, 0xfd
        };

        public static object CreateContentCipher(bool forEncryption, ICipherParameters encKey,
            AlgorithmIdentifier encryptionAlgID)
        {
            DerObjectIdentifier encAlg = encryptionAlgID.Algorithm;

            if (encAlg.Equals(PkcsObjectIdentifiers.rc4))
            {
                IStreamCipher cipher = new RC4Engine();
                cipher.Init(forEncryption, encKey);
                return cipher;
            }
            else
            {
                BufferedBlockCipher cipher = CreateCipher(encryptionAlgID.Algorithm);
                Asn1Object sParams = encryptionAlgID.Parameters.ToAsn1Object();

                if (sParams != null && !(sParams is DerNull))
                {
                    if (encAlg.Equals(PkcsObjectIdentifiers.DesEde3Cbc)
                        || encAlg.Equals(AlgorithmIdentifierFactory.IDEA_CBC)
                        || encAlg.Equals(NistObjectIdentifiers.IdAes128Cbc)
                        || encAlg.Equals(NistObjectIdentifiers.IdAes192Cbc)
                        || encAlg.Equals(NistObjectIdentifiers.IdAes256Cbc)
                        || encAlg.Equals(NttObjectIdentifiers.IdCamellia128Cbc)
                        || encAlg.Equals(NttObjectIdentifiers.IdCamellia192Cbc)
                        || encAlg.Equals(NttObjectIdentifiers.IdCamellia256Cbc)
                        || encAlg.Equals(KisaObjectIdentifiers.IdSeedCbc)
                        || encAlg.Equals(OiwObjectIdentifiers.DesCbc))
                    {
                        cipher.Init(forEncryption, new ParametersWithIV(encKey,
                            Asn1OctetString.GetInstance(sParams).GetOctets()));
                    }
                    else if (encAlg.Equals(AlgorithmIdentifierFactory.CAST5_CBC))
                    {
                        Cast5CbcParameters cbcParams = Cast5CbcParameters.GetInstance(sParams);

                        cipher.Init(forEncryption, new ParametersWithIV(encKey, cbcParams.GetIV()));
                    }
                    else if (encAlg.Equals(PkcsObjectIdentifiers.RC2Cbc))
                    {
                        RC2CbcParameter cbcParams = RC2CbcParameter.GetInstance(sParams);

                        cipher.Init(forEncryption, new ParametersWithIV(new RC2Parameters(((KeyParameter)encKey).GetKey(), rc2Ekb[cbcParams.RC2ParameterVersion.IntValue]), cbcParams.GetIV()));
                    }
                    else
                    {
                        throw new InvalidOperationException("cannot match parameters");
                    }
                }
                else
                {
                    if (encAlg.Equals(PkcsObjectIdentifiers.DesEde3Cbc)
                        || encAlg.Equals(AlgorithmIdentifierFactory.IDEA_CBC)
                        || encAlg.Equals(AlgorithmIdentifierFactory.CAST5_CBC))
                    {
                        cipher.Init(forEncryption, new ParametersWithIV(encKey, new byte[8]));
                    }
                    else
                    {
                        cipher.Init(forEncryption, encKey);
                    }
                }

                return cipher;
            }
        }

        private static BufferedBlockCipher CreateCipher(DerObjectIdentifier algorithm)
        {
            IBlockCipherMode cipher;

            if (NistObjectIdentifiers.IdAes128Cbc.Equals(algorithm)
                || NistObjectIdentifiers.IdAes192Cbc.Equals(algorithm)
                || NistObjectIdentifiers.IdAes256Cbc.Equals(algorithm))
            {
                cipher = new CbcBlockCipher(AesUtilities.CreateEngine());
            }
            else if (PkcsObjectIdentifiers.DesEde3Cbc.Equals(algorithm))
            {
                cipher = new CbcBlockCipher(new DesEdeEngine());
            }
            else if (OiwObjectIdentifiers.DesCbc.Equals(algorithm))
            {
                cipher = new CbcBlockCipher(new DesEngine());
            }
            else if (PkcsObjectIdentifiers.RC2Cbc.Equals(algorithm))
            {
                cipher = new CbcBlockCipher(new RC2Engine());
            }
            else if (MiscObjectIdentifiers.cast5CBC.Equals(algorithm))
            {
                cipher = new CbcBlockCipher(new Cast5Engine());
            }
            else
            {
                throw new InvalidOperationException("cannot recognise cipher: " + algorithm);
            }

            return new PaddedBufferedBlockCipher(cipher, new Pkcs7Padding());
        }
    }
}
