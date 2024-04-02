using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.EdEC;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.X509
{
    /// <summary>
    /// A factory to produce Public Key Info Objects.
    /// </summary>
    public sealed class SubjectPublicKeyInfoFactory
    {
        private SubjectPublicKeyInfoFactory()
        {
        }

        /// <summary>
        /// Create a Subject Public Key Info object for a given public key.
        /// </summary>
        /// <param name="publicKey">One of ElGammalPublicKeyParameters, DSAPublicKeyParameter, DHPublicKeyParameters, RsaKeyParameters or ECPublicKeyParameters</param>
        /// <returns>A subject public key info object.</returns>
        /// <exception cref="Exception">Throw exception if object provided is not one of the above.</exception>
        public static SubjectPublicKeyInfo CreateSubjectPublicKeyInfo(
            AsymmetricKeyParameter publicKey)
        {
            if (publicKey == null)
                throw new ArgumentNullException("publicKey");
            if (publicKey.IsPrivate)
                throw new ArgumentException("Private key passed - public key expected.", "publicKey");

            if (publicKey is ElGamalPublicKeyParameters)
            {
                ElGamalPublicKeyParameters _key = (ElGamalPublicKeyParameters)publicKey;
                ElGamalParameters kp = _key.Parameters;

                SubjectPublicKeyInfo info = new SubjectPublicKeyInfo(
                    new AlgorithmIdentifier(
                        OiwObjectIdentifiers.ElGamalAlgorithm,
                        new ElGamalParameter(kp.P, kp.G).ToAsn1Object()),
                        new DerInteger(_key.Y));

                return info;
            }

            if (publicKey is DsaPublicKeyParameters)
            {
                DsaPublicKeyParameters _key = (DsaPublicKeyParameters) publicKey;
                DsaParameters kp = _key.Parameters;
                Asn1Encodable ae = kp == null
                    ?	null
                    :	new DsaParameter(kp.P, kp.Q, kp.G).ToAsn1Object();

                return new SubjectPublicKeyInfo(
                    new AlgorithmIdentifier(X9ObjectIdentifiers.IdDsa, ae),
                    new DerInteger(_key.Y));
            }

            if (publicKey is DHPublicKeyParameters)
            {
                DHPublicKeyParameters _key = (DHPublicKeyParameters) publicKey;
                DHParameters kp = _key.Parameters;

                SubjectPublicKeyInfo info = new SubjectPublicKeyInfo(
                    new AlgorithmIdentifier(
                        _key.AlgorithmOid,
                        new DHParameter(kp.P, kp.G, kp.L).ToAsn1Object()),
                        new DerInteger(_key.Y));

                return info;
            } // End of DH

            if (publicKey is RsaKeyParameters)
            {
                RsaKeyParameters _key = (RsaKeyParameters) publicKey;

                SubjectPublicKeyInfo info = new SubjectPublicKeyInfo(
                    new AlgorithmIdentifier(PkcsObjectIdentifiers.RsaEncryption, DerNull.Instance),
                    new RsaPublicKeyStructure(_key.Modulus, _key.Exponent).ToAsn1Object());

                return info;
            } // End of RSA.

            if (publicKey is ECPublicKeyParameters)
            {            
               
                ECPublicKeyParameters _key = (ECPublicKeyParameters) publicKey;


                if (_key.Parameters is ECGost3410Parameters)
                {
                    ECGost3410Parameters gostParams = (ECGost3410Parameters)_key.Parameters;

                    BigInteger bX = _key.Q.AffineXCoord.ToBigInteger();
                    BigInteger bY = _key.Q.AffineYCoord.ToBigInteger();
                    bool is512 = (bX.BitLength > 256);

                    Gost3410PublicKeyAlgParameters parameters = new Gost3410PublicKeyAlgParameters(
                        gostParams.PublicKeyParamSet,
                        gostParams.DigestParamSet,
                        gostParams.EncryptionParamSet);

                    int encKeySize;
                    int offset;
                    DerObjectIdentifier algIdentifier;
                    if (is512)
                    {
                        encKeySize = 128;
                        offset = 64;
                        algIdentifier = RosstandartObjectIdentifiers.id_tc26_gost_3410_12_512;
                    }
                    else
                    {
                        encKeySize = 64;
                        offset = 32;
                        algIdentifier = RosstandartObjectIdentifiers.id_tc26_gost_3410_12_256;
                    }

                    byte[] encKey = new byte[encKeySize];
               
                    ExtractBytes(encKey, encKeySize / 2, 0, bX);
                    ExtractBytes(encKey, encKeySize / 2, offset, bY);
                  
                    return new SubjectPublicKeyInfo(new AlgorithmIdentifier(algIdentifier, parameters), new DerOctetString(encKey));
                   

                } // End of ECGOST3410_2012





                if (_key.AlgorithmName == "ECGOST3410")
                {
                    if (_key.PublicKeyParamSet == null)
                        throw new NotImplementedException("Not a CryptoPro parameter set");

                    ECPoint q = _key.Q.Normalize();
                    BigInteger bX = q.AffineXCoord.ToBigInteger();
                    BigInteger bY = q.AffineYCoord.ToBigInteger();

                    byte[] encKey = new byte[64];
                    ExtractBytes(encKey, 0, bX);
                    ExtractBytes(encKey, 32, bY);

                    Gost3410PublicKeyAlgParameters gostParams = new Gost3410PublicKeyAlgParameters(
                        _key.PublicKeyParamSet, CryptoProObjectIdentifiers.GostR3411x94CryptoProParamSet);

                    AlgorithmIdentifier algID = new AlgorithmIdentifier(
                        CryptoProObjectIdentifiers.GostR3410x2001,
                        gostParams.ToAsn1Object());

                    return new SubjectPublicKeyInfo(algID, new DerOctetString(encKey));
                }
                else
                {
                    X962Parameters x962;
                    if (_key.PublicKeyParamSet == null)
                    {
                        ECDomainParameters kp = _key.Parameters;
                        X9ECParameters ecP = new X9ECParameters(kp.Curve, new X9ECPoint(kp.G, false), kp.N, kp.H,
                            kp.GetSeed());

                        x962 = new X962Parameters(ecP);
                    }
                    else
                    {
                        x962 = new X962Parameters(_key.PublicKeyParamSet);
                    }

                    byte[] pubKey = _key.Q.GetEncoded(false);

                    AlgorithmIdentifier algID = new AlgorithmIdentifier(
                        X9ObjectIdentifiers.IdECPublicKey, x962.ToAsn1Object());

                    return new SubjectPublicKeyInfo(algID, pubKey);
                }
            } // End of EC

            if (publicKey is Gost3410PublicKeyParameters)
            {
                Gost3410PublicKeyParameters _key = (Gost3410PublicKeyParameters) publicKey;

                if (_key.PublicKeyParamSet == null)
                    throw new NotImplementedException("Not a CryptoPro parameter set");

                byte[] keyEnc = _key.Y.ToByteArrayUnsigned();
                byte[] keyBytes = new byte[keyEnc.Length];

                for (int i = 0; i != keyBytes.Length; i++)
                {
                    keyBytes[i] = keyEnc[keyEnc.Length - 1 - i]; // must be little endian
                }

                Gost3410PublicKeyAlgParameters algParams = new Gost3410PublicKeyAlgParameters(
                    _key.PublicKeyParamSet, CryptoProObjectIdentifiers.GostR3411x94CryptoProParamSet);

                AlgorithmIdentifier algID = new AlgorithmIdentifier(
                    CryptoProObjectIdentifiers.GostR3410x94,
                    algParams.ToAsn1Object());

                return new SubjectPublicKeyInfo(algID, new DerOctetString(keyBytes));
            }

            if (publicKey is X448PublicKeyParameters)
            {
                X448PublicKeyParameters key = (X448PublicKeyParameters)publicKey;

                return new SubjectPublicKeyInfo(new AlgorithmIdentifier(EdECObjectIdentifiers.id_X448), key.GetEncoded());
            }

            if (publicKey is X25519PublicKeyParameters)
            {
                X25519PublicKeyParameters key = (X25519PublicKeyParameters)publicKey;

                return new SubjectPublicKeyInfo(new AlgorithmIdentifier(EdECObjectIdentifiers.id_X25519), key.GetEncoded());
            }

            if (publicKey is Ed448PublicKeyParameters)
            {
                Ed448PublicKeyParameters key = (Ed448PublicKeyParameters)publicKey;

                return new SubjectPublicKeyInfo(new AlgorithmIdentifier(EdECObjectIdentifiers.id_Ed448), key.GetEncoded());
            }

            if (publicKey is Ed25519PublicKeyParameters)
            {
                Ed25519PublicKeyParameters key = (Ed25519PublicKeyParameters)publicKey;

                return new SubjectPublicKeyInfo(new AlgorithmIdentifier(EdECObjectIdentifiers.id_Ed25519), key.GetEncoded());
            }

            throw new ArgumentException("Class provided no convertible: " + Platform.GetTypeName(publicKey));
        }

        private static void ExtractBytes(
            byte[]		encKey,
            int			offset,
            BigInteger	bI)
        {
            byte[] val = bI.ToByteArray();
            int n = (bI.BitLength + 7) / 8;

            for (int i = 0; i < n; ++i)
            {
                encKey[offset + i] = val[val.Length - 1 - i];
            }
        }


        private static void ExtractBytes(byte[] encKey, int size, int offSet, BigInteger bI)
        {
            byte[] val = bI.ToByteArray();
            if (val.Length < size)
            {
                byte[] tmp = new byte[size];
                Array.Copy(val, 0, tmp, tmp.Length - val.Length, val.Length);
                val = tmp;
            }

            for (int i = 0; i != size; i++)
            {
                encKey[offSet + i] = val[val.Length - 1 - i];
            }
        }
    }
}
