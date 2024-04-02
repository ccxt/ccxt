using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;
using Org.BouncyCastle.Utilities.IO.Pem;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.OpenSsl
{
    /**
    * PEM generator for the original set of PEM objects used in Open SSL.
    */
    public class MiscPemGenerator
        : PemObjectGenerator
    {
        private readonly object obj;
        private readonly string algorithm;
        private readonly char[] password;
        private readonly SecureRandom random;

        public MiscPemGenerator(object obj)
        {
            this.obj = obj;
        }

        public MiscPemGenerator(
            object			obj,
            string			algorithm,
            char[]			password,
            SecureRandom	random)
        {
            this.obj = obj;
            this.algorithm = algorithm;
            this.password = password;
            this.random = random;
        }

        private static PemObject CreatePemObject(object obj)
        {
            if (obj == null)
                throw new ArgumentNullException("obj");

            if (obj is AsymmetricCipherKeyPair keyPair)
            {
                return CreatePemObject(keyPair.Private);
            }

            string type;
            byte[] encoding;

            if (obj is PemObject pemObject)
                return pemObject;

            if (obj is PemObjectGenerator pemObjectGenerator)
                return pemObjectGenerator.Generate();

            if (obj is X509Certificate certificate)
            {
                // TODO Should we prefer "X509 CERTIFICATE" here?
                type = "CERTIFICATE";
                try
                {
                    encoding = certificate.GetEncoded();
                }
                catch (CertificateEncodingException e)
                {
                    throw new IOException("Cannot Encode object: " + e.ToString());
                }
            }
            else if (obj is X509Crl crl)
            {
                type = "X509 CRL";
                try
                {
                    encoding = crl.GetEncoded();
                }
                catch (CrlException e)
                {
                    throw new IOException("Cannot Encode object: " + e.ToString());
                }
            }
            else if (obj is AsymmetricKeyParameter akp)
            {
                if (akp.IsPrivate)
                {
                    encoding = EncodePrivateKey(akp, out type);
                }
                else
                {
                    type = "PUBLIC KEY";

                    encoding = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(akp).GetDerEncoded();
                }
            }
            else if (obj is X509V2AttributeCertificate attrCert)
            {
                type = "ATTRIBUTE CERTIFICATE";
                encoding = attrCert.GetEncoded();
            }
            else if (obj is Pkcs10CertificationRequest certReq)
            {
                type = "CERTIFICATE REQUEST";
                encoding = certReq.GetEncoded();
            }
            else if (obj is Asn1.Cms.ContentInfo contentInfo)
            {
                type = "PKCS7";
                encoding = contentInfo.GetEncoded();
            }
            else
            {
                throw new PemGenerationException("Object type not supported: " + Platform.GetTypeName(obj));
            }

            return new PemObject(type, encoding);
        }

//		private string GetHexEncoded(byte[] bytes)
//		{
//			bytes = Hex.Encode(bytes);
//
//			char[] chars = new char[bytes.Length];
//
//			for (int i = 0; i != bytes.Length; i++)
//			{
//				chars[i] = (char)bytes[i];
//			}
//
//			return new string(chars);
//		}

        private static PemObject CreatePemObject(
            object			obj,
            string			algorithm,
            char[]			password,
            SecureRandom	random)
        {
            if (obj == null)
                throw new ArgumentNullException("obj");
            if (algorithm == null)
                throw new ArgumentNullException("algorithm");
            if (password == null)
                throw new ArgumentNullException("password");
            if (random == null)
                throw new ArgumentNullException("random");

            if (obj is AsymmetricCipherKeyPair keyPair)
            {
                return CreatePemObject(keyPair.Private, algorithm, password, random);
            }

            string type = null;
            byte[] keyData = null;

            if (obj is AsymmetricKeyParameter akp)
            {
                if (akp.IsPrivate)
                {
                    keyData = EncodePrivateKey(akp, out type);
                }
            }

            if (type == null || keyData == null)
            {
                // TODO Support other types?
                throw new PemGenerationException("Object type not supported: " + Platform.GetTypeName(obj));
            }


            string dekAlgName = algorithm.ToUpperInvariant();

            // Note: For backward compatibility
            if (dekAlgName == "DESEDE")
            {
                dekAlgName = "DES-EDE3-CBC";
            }

            int ivLength = Platform.StartsWith(dekAlgName, "AES-") ? 16 : 8;

            byte[] iv = new byte[ivLength];
            random.NextBytes(iv);

            byte[] encData = PemUtilities.Crypt(true, keyData, password, dekAlgName, iv);

            var headers = new List<PemHeader>(2);
            headers.Add(new PemHeader("Proc-Type", "4,ENCRYPTED"));
            headers.Add(new PemHeader("DEK-Info", dekAlgName + "," + Hex.ToHexString(iv).ToUpperInvariant()));

            return new PemObject(type, headers, encData);
        }

        private static byte[] EncodePrivateKey(
            AsymmetricKeyParameter	akp,
            out string				keyType)
        {
            PrivateKeyInfo info = PrivateKeyInfoFactory.CreatePrivateKeyInfo(akp);
            AlgorithmIdentifier algID = info.PrivateKeyAlgorithm;
            DerObjectIdentifier oid = algID.Algorithm;

            if (oid.Equals(X9ObjectIdentifiers.IdDsa))
            {
                keyType = "DSA PRIVATE KEY";

                DsaParameter p = DsaParameter.GetInstance(algID.Parameters);

                BigInteger x = ((DsaPrivateKeyParameters) akp).X;
                BigInteger y = p.G.ModPow(x, p.P);

                // TODO Create an ASN1 object somewhere for this?
                return new DerSequence(
                    new DerInteger(0),
                    new DerInteger(p.P),
                    new DerInteger(p.Q),
                    new DerInteger(p.G),
                    new DerInteger(y),
                    new DerInteger(x)).GetEncoded();
            }

            if (oid.Equals(PkcsObjectIdentifiers.RsaEncryption))
            {
                keyType = "RSA PRIVATE KEY";

                return info.ParsePrivateKey().GetEncoded();
            }
            else if (oid.Equals(CryptoProObjectIdentifiers.GostR3410x2001)
                || oid.Equals(X9ObjectIdentifiers.IdECPublicKey))
            {
                keyType = "EC PRIVATE KEY";

                return info.ParsePrivateKey().GetEncoded();
            }
            else
            {
                keyType = "PRIVATE KEY";

                return info.GetEncoded();
            }
        }

        public PemObject Generate()
        {
            try
            {
                if (algorithm != null)
                {
                    return CreatePemObject(obj, algorithm, password, random);
                }

                return CreatePemObject(obj);
            }
            catch (IOException e)
            {
                throw new PemGenerationException("encoding exception", e);
            }
        }
    }
}
