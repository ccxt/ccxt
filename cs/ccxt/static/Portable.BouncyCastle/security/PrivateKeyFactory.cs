using System;
using System.IO;

using Org.BouncyCastle.Asn1;
// using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.EdEC;
// using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
// using Org.BouncyCastle.Asn1.Rosstandart;
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

            // if (algOid.Equals(PkcsObjectIdentifiers.DhKeyAgreement))
            // {
            //     DHParameter para = new DHParameter(
            //         Asn1Sequence.GetInstance(algID.Parameters.ToAsn1Object()));
            //     DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();

            //     BigInteger lVal = para.L;
            //     int l = lVal == null ? 0 : lVal.IntValue;
            //     DHParameters dhParams = new DHParameters(para.P, para.G, null, l);

            //     return new DHPrivateKeyParameters(derX.Value, dhParams, algOid);
            // }
            // else if (algOid.Equals(OiwObjectIdentifiers.ElGamalAlgorithm))
            // {
            //     ElGamalParameter para = new ElGamalParameter(
            //         Asn1Sequence.GetInstance(algID.Parameters.ToAsn1Object()));
            //     DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();

            //     return new ElGamalPrivateKeyParameters(
            //         derX.Value,
            //         new ElGamalParameters(para.P, para.G));
            // }
            // else if (algOid.Equals(X9ObjectIdentifiers.IdDsa))
            // {
            //     DerInteger derX = (DerInteger)keyInfo.ParsePrivateKey();
            //     Asn1Encodable ae = algID.Parameters;

            //     DsaParameters parameters = null;
            //     if (ae != null)
            //     {
            //         DsaParameter para = DsaParameter.GetInstance(ae.ToAsn1Object());
            //         parameters = new DsaParameters(para.P, para.Q, para.G);
            //     }

            //     return new DsaPrivateKeyParameters(derX.Value, parameters);
            // }
            if (algOid.Equals(X9ObjectIdentifiers.IdECPublicKey))
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
            else if (algOid.Equals(EdECObjectIdentifiers.id_Ed25519))
            {
                return new Ed25519PrivateKeyParameters(GetRawKey(keyInfo));
            }
            throw new SecurityUtilityException("algorithm identifier in private key not recognised");

        }

        private static byte[] GetRawKey(PrivateKeyInfo keyInfo)
        {
            return Asn1OctetString.GetInstance(keyInfo.ParsePrivateKey()).GetOctets();
        }

        // public static AsymmetricKeyParameter DecryptKey(
        //     char[] passPhrase,
        //     EncryptedPrivateKeyInfo encInfo)
        // {
        //     return CreateKey(PrivateKeyInfoFactory.CreatePrivateKeyInfo(passPhrase, encInfo));
        // }

    }
}
