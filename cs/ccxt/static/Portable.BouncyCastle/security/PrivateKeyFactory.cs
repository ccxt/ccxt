using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.EdEC;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.Sec;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Security
{
    public sealed class PrivateKeyFactory
    {
        private PrivateKeyFactory()
        {
        }

        public static AsymmetricKeyParameter CreateKey(
            byte[] privateKeyInfoData)
        {
            return CreateKey(
                PrivateKeyInfo.GetInstance(
                    Asn1Object.FromByteArray(privateKeyInfoData)));
        }

        public static AsymmetricKeyParameter CreateKey(
            Stream inStr)
        {
            return CreateKey(
                PrivateKeyInfo.GetInstance(
                    Asn1Object.FromStream(inStr)));
        }

        public static AsymmetricKeyParameter CreateKey(
            PrivateKeyInfo keyInfo)
        {
            AlgorithmIdentifier algID = keyInfo.PrivateKeyAlgorithm;
            DerObjectIdentifier algOid = algID.Algorithm;

            // TODO See RSAUtil.isRsaOid in Java build
            if (algOid.Equals(PkcsObjectIdentifiers.RsaEncryption)
                || algOid.Equals(X509ObjectIdentifiers.IdEARsa)
                || algOid.Equals(PkcsObjectIdentifiers.IdRsassaPss)
                || algOid.Equals(PkcsObjectIdentifiers.IdRsaesOaep))
            {
                RsaPrivateKeyStructure keyStructure = RsaPrivateKeyStructure.GetInstance(keyInfo.ParsePrivateKey());

                return new RsaPrivateCrtKeyParameters(
                    keyStructure.Modulus,
                    keyStructure.PublicExponent,
                    keyStructure.PrivateExponent,
                    keyStructure.Prime1,
                    keyStructure.Prime2,
                    keyStructure.Exponent1,
                    keyStructure.Exponent2,
                    keyStructure.Coefficient);
            }
            // TODO?
            //			else if (algOid.Equals(X9ObjectIdentifiers.DHPublicNumber))
            else if (algOid.Equals(PkcsObjectIdentifiers.DhKeyAgreement))
            {
                DHParameter para = new DHParameter(
                    Asn1Sequence.GetInstance(algID.Parameters.ToAsn1Object()));
                DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();

                BigInteger lVal = para.L;
                int l = lVal == null ? 0 : lVal.IntValue;
                DHParameters dhParams = new DHParameters(para.P, para.G, null, l);

                return new DHPrivateKeyParameters(derX.Value, dhParams, algOid);
            }
            else if (algOid.Equals(OiwObjectIdentifiers.ElGamalAlgorithm))
            {
                ElGamalParameter para = new ElGamalParameter(
                    Asn1Sequence.GetInstance(algID.Parameters.ToAsn1Object()));
                DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();

                return new ElGamalPrivateKeyParameters(
                    derX.Value,
                    new ElGamalParameters(para.P, para.G));
            }
            else if (algOid.Equals(X9ObjectIdentifiers.IdDsa))
            {
                DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();
                Asn1Encodable ae = algID.Parameters;

                DsaParameters parameters = null;
                if (ae != null)
                {
                    DsaParameter para = DsaParameter.GetInstance(ae.ToAsn1Object());
                    parameters = new DsaParameters(para.P, para.Q, para.G);
                }

                return new DsaPrivateKeyParameters(derX.Value, parameters);
            }
            else if (algOid.Equals(X9ObjectIdentifiers.IdECPublicKey))
            {
                X962Parameters para = X962Parameters.GetInstance(algID.Parameters.ToAsn1Object());

                X9ECParameters x9;
                if (para.IsNamedCurve)
                {
                    x9 = ECKeyPairGenerator.FindECCurveByOid((DerObjectIdentifier)para.Parameters);
                }
                else
                {
                    x9 = new X9ECParameters((Asn1Sequence)para.Parameters);
                }

                ECPrivateKeyStructure ec = ECPrivateKeyStructure.GetInstance(keyInfo.ParsePrivateKey());
                BigInteger d = ec.GetKey();

                if (para.IsNamedCurve)
                {
                    return new ECPrivateKeyParameters("EC", d, (DerObjectIdentifier)para.Parameters);
                }

                ECDomainParameters dParams = new ECDomainParameters(x9.Curve, x9.G, x9.N, x9.H, x9.GetSeed());
                return new ECPrivateKeyParameters(d, dParams);
            }
            else if (algOid.Equals(CryptoProObjectIdentifiers.GostR3410x2001))
            {
                Gost3410PublicKeyAlgParameters gostParams = Gost3410PublicKeyAlgParameters.GetInstance(
                    algID.Parameters.ToAsn1Object());

                X9ECParameters ecP = ECGost3410NamedCurves.GetByOid(gostParams.PublicKeyParamSet);

                if (ecP == null)
                    throw new ArgumentException("Unrecognized curve OID for GostR3410x2001 private key");

                Asn1Object privKey = keyInfo.ParsePrivateKey();
                ECPrivateKeyStructure ec;

                if (privKey is DerInteger)
                {
                    ec = new ECPrivateKeyStructure(ecP.N.BitLength, ((DerInteger)privKey).PositiveValue);
                }
                else
                {
                    ec = ECPrivateKeyStructure.GetInstance(privKey);
                }

                return new ECPrivateKeyParameters("ECGOST3410", ec.GetKey(), gostParams.PublicKeyParamSet);
            }
            else if (algOid.Equals(CryptoProObjectIdentifiers.GostR3410x94))
            {
                Gost3410PublicKeyAlgParameters gostParams = Gost3410PublicKeyAlgParameters.GetInstance(algID.Parameters);

                Asn1Object privKey = keyInfo.ParsePrivateKey();
                BigInteger x;

                if (privKey is DerInteger)
                {
                    x = DerInteger.GetInstance(privKey).PositiveValue;
                }
                else
                {
                    x = new BigInteger(1, Arrays.Reverse(Asn1OctetString.GetInstance(privKey).GetOctets()));
                }

                return new Gost3410PrivateKeyParameters(x, gostParams.PublicKeyParamSet);
            }
            else if (algOid.Equals(EdECObjectIdentifiers.id_X25519))
            {
                return new X25519PrivateKeyParameters(GetRawKey(keyInfo));
            }
            else if (algOid.Equals(EdECObjectIdentifiers.id_X448))
            {
                return new X448PrivateKeyParameters(GetRawKey(keyInfo));
            }
            else if (algOid.Equals(EdECObjectIdentifiers.id_Ed25519))
            {
                return new Ed25519PrivateKeyParameters(GetRawKey(keyInfo));
            }
            else if (algOid.Equals(EdECObjectIdentifiers.id_Ed448))
            {
                return new Ed448PrivateKeyParameters(GetRawKey(keyInfo));
            }
            else if (algOid.Equals(RosstandartObjectIdentifiers.id_tc26_gost_3410_12_512)
                     || algOid.Equals(RosstandartObjectIdentifiers.id_tc26_gost_3410_12_256))
            {
                Gost3410PublicKeyAlgParameters gostParams = Gost3410PublicKeyAlgParameters.GetInstance(keyInfo.PrivateKeyAlgorithm.Parameters);
                ECGost3410Parameters ecSpec;
                BigInteger d;
                Asn1Object p = keyInfo.PrivateKeyAlgorithm.Parameters.ToAsn1Object();
                if (p is Asn1Sequence && (Asn1Sequence.GetInstance(p).Count == 2 || Asn1Sequence.GetInstance(p).Count == 3))
                {

                    X9ECParameters ecP = ECGost3410NamedCurves.GetByOid(gostParams.PublicKeyParamSet);

                    ecSpec = new ECGost3410Parameters(
                        new ECNamedDomainParameters(
                            gostParams.PublicKeyParamSet, ecP),
                            gostParams.PublicKeyParamSet,
                            gostParams.DigestParamSet,
                            gostParams.EncryptionParamSet);

                    Asn1OctetString privEnc = keyInfo.PrivateKeyData;
                    if (privEnc.GetOctets().Length == 32 || privEnc.GetOctets().Length == 64)
                    {
                        byte[] dVal = Arrays.Reverse(privEnc.GetOctets());
                        d = new BigInteger(1, dVal);
                    }
                    else
                    {
                        Asn1Encodable privKey = keyInfo.ParsePrivateKey();
                        if (privKey is DerInteger)
                        {
                            d = DerInteger.GetInstance(privKey).PositiveValue;
                        }
                        else
                        {
                            byte[] dVal = Arrays.Reverse(Asn1OctetString.GetInstance(privKey).GetOctets());
                            d = new BigInteger(1, dVal);
                        }
                    }
                }
                else
                {
                    X962Parameters parameters = X962Parameters.GetInstance(keyInfo.PrivateKeyAlgorithm.Parameters);

                    if (parameters.IsNamedCurve)
                    {
                        DerObjectIdentifier oid = DerObjectIdentifier.GetInstance(parameters.Parameters);
                        X9ECParameters ecP = ECKeyPairGenerator.FindECCurveByOid(oid);

                        ecSpec = new ECGost3410Parameters(new ECNamedDomainParameters(oid, ecP),
                            gostParams.PublicKeyParamSet, gostParams.DigestParamSet,
                            gostParams.EncryptionParamSet);
                    }
                    else if (parameters.IsImplicitlyCA)
                    {
                        ecSpec = null;
                    }
                    else
                    {
                        X9ECParameters ecP = X9ECParameters.GetInstance(parameters.Parameters);
                        ecSpec = new ECGost3410Parameters(new ECNamedDomainParameters(algOid, ecP),
                            gostParams.PublicKeyParamSet, gostParams.DigestParamSet,
                            gostParams.EncryptionParamSet);
                    }

                    Asn1Encodable privKey = keyInfo.ParsePrivateKey();
                    if (privKey is DerInteger)
                    {
                        DerInteger derD = DerInteger.GetInstance(privKey);
                        d = derD.Value;
                    }
                    else
                    {
                        ECPrivateKeyStructure ec = ECPrivateKeyStructure.GetInstance(privKey);
                        d = ec.GetKey();
                    }
                }

                return new ECPrivateKeyParameters(
                    d,
                    new ECGost3410Parameters(
                        ecSpec,
                        gostParams.PublicKeyParamSet,
                        gostParams.DigestParamSet,
                        gostParams.EncryptionParamSet));

            }
            else
            {
                throw new SecurityUtilityException("algorithm identifier in private key not recognised");
            }
        }

        private static byte[] GetRawKey(PrivateKeyInfo keyInfo)
        {
            return Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
        }

        public static AsymmetricKeyParameter DecryptKey(
            char[] passPhrase,
            EncryptedPrivateKeyInfo encInfo)
        {
            return CreateKey(PrivateKeyInfoFactory.CreatePrivateKeyInfo(passPhrase, encInfo));
        }

        public static AsymmetricKeyParameter DecryptKey(
            char[] passPhrase,
            byte[] encryptedPrivateKeyInfoData)
        {
            return DecryptKey(passPhrase, Asn1Object.FromByteArray(encryptedPrivateKeyInfoData));
        }

        public static AsymmetricKeyParameter DecryptKey(
            char[] passPhrase,
            Stream encryptedPrivateKeyInfoStream)
        {
            return DecryptKey(passPhrase, Asn1Object.FromStream(encryptedPrivateKeyInfoStream));
        }

        private static AsymmetricKeyParameter DecryptKey(
            char[] passPhrase,
            Asn1Object asn1Object)
        {
            return DecryptKey(passPhrase, EncryptedPrivateKeyInfo.GetInstance(asn1Object));
        }

        public static byte[] EncryptKey(
            DerObjectIdentifier algorithm,
            char[] passPhrase,
            byte[] salt,
            int iterationCount,
            AsymmetricKeyParameter key)
        {
            return EncryptedPrivateKeyInfoFactory.CreateEncryptedPrivateKeyInfo(
                algorithm, passPhrase, salt, iterationCount, key).GetEncoded();
        }

        public static byte[] EncryptKey(
            string algorithm,
            char[] passPhrase,
            byte[] salt,
            int iterationCount,
            AsymmetricKeyParameter key)
        {
            return EncryptedPrivateKeyInfoFactory.CreateEncryptedPrivateKeyInfo(
                algorithm, passPhrase, salt, iterationCount, key).GetEncoded();
        }
    }
}
