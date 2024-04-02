using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Sec;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;
using Org.BouncyCastle.Utilities.IO.Pem;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.OpenSsl
{
    /**
    * Class for reading OpenSSL PEM encoded streams containing 
    * X509 certificates, PKCS8 encoded keys and PKCS7 objects.
    * <p>
    * In the case of PKCS7 objects the reader will return a CMS ContentInfo object. Keys and
    * Certificates will be returned using the appropriate java.security type.</p>
    */
    public class PemReader
        : Org.BouncyCastle.Utilities.IO.Pem.PemReader
    {
        //private static readonly Dictionary<string, PemObjectParser> Parsers = new Dictionary<string, PemObjectParser>();

        static PemReader()
        {
//			Parsers.Add("CERTIFICATE REQUEST", new PKCS10CertificationRequestParser());
//			Parsers.Add("NEW CERTIFICATE REQUEST", new PKCS10CertificationRequestParser());
//			Parsers.Add("CERTIFICATE", new X509CertificateParser(provider));
//			Parsers.Add("X509 CERTIFICATE", new X509CertificateParser(provider));
//			Parsers.Add("X509 CRL", new X509CRLParser(provider));
//			Parsers.Add("PKCS7", new PKCS7Parser());
//			Parsers.Add("ATTRIBUTE CERTIFICATE", new X509AttributeCertificateParser());
//			Parsers.Add("EC PARAMETERS", new ECNamedCurveSpecParser());
//			Parsers.Add("PUBLIC KEY", new PublicKeyParser(provider));
//			Parsers.Add("RSA PUBLIC KEY", new RSAPublicKeyParser(provider));
//			Parsers.Add("RSA PRIVATE KEY", new RSAKeyPairParser(provider));
//			Parsers.Add("DSA PRIVATE KEY", new DSAKeyPairParser(provider));
//			Parsers.Add("EC PRIVATE KEY", new ECDSAKeyPairParser(provider));
//			Parsers.Add("ENCRYPTED PRIVATE KEY", new EncryptedPrivateKeyParser(provider));
//			Parsers.Add("PRIVATE KEY", new PrivateKeyParser(provider));
        }

        private readonly IPasswordFinder pFinder;

        /**
        * Create a new PemReader
        *
        * @param reader the Reader
        */
        public PemReader(
            TextReader reader)
            : this(reader, null)
        {
        }

        /**
        * Create a new PemReader with a password finder
        *
        * @param reader the Reader
        * @param pFinder the password finder
        */
        public PemReader(
            TextReader		reader,
            IPasswordFinder	pFinder)
            : base(reader)
        {
            this.pFinder = pFinder;
        }

        public object ReadObject()
        {
            PemObject obj = ReadPemObject();

            if (obj == null)
                return null;

            // TODO Follow Java build and map to parser objects?
//			if (parsers.Contains(obj.Type))
//				return ((PemObjectParser)parsers[obj.Type]).ParseObject(obj);

            if (Platform.EndsWith(obj.Type, "PRIVATE KEY"))
                return ReadPrivateKey(obj);

            switch (obj.Type)
            {
                case "PUBLIC KEY":
                    return ReadPublicKey(obj);
                case "RSA PUBLIC KEY":
                    return ReadRsaPublicKey(obj);
                case "CERTIFICATE REQUEST":
                case "NEW CERTIFICATE REQUEST":
                    return ReadCertificateRequest(obj);
                case "CERTIFICATE":
                case "X509 CERTIFICATE":
                    return ReadCertificate(obj);
                case "PKCS7":
                case "CMS":
                    return ReadPkcs7(obj);
                case "X509 CRL":
                    return ReadCrl(obj);
                case "ATTRIBUTE CERTIFICATE":
                    return ReadAttributeCertificate(obj);
                // TODO Add back in when tests done, and return type issue resolved
                //case "EC PARAMETERS":
                //	return ReadECParameters(obj);
                default:
                    throw new IOException("unrecognised object: " + obj.Type);
            }
        }

        private AsymmetricKeyParameter ReadRsaPublicKey(PemObject pemObject)
        {
            RsaPublicKeyStructure rsaPubStructure = RsaPublicKeyStructure.GetInstance(
                Asn1Object.FromByteArray(pemObject.Content));

            return new RsaKeyParameters(
                false, // not private
                rsaPubStructure.Modulus, 
                rsaPubStructure.PublicExponent);
        }

        private AsymmetricKeyParameter ReadPublicKey(PemObject pemObject)
        {
            return PublicKeyFactory.CreateKey(pemObject.Content);
        }

        /**
        * Reads in a X509Certificate.
        *
        * @return the X509Certificate
        * @throws IOException if an I/O error occured
        */
        private X509Certificate ReadCertificate(PemObject pemObject)
        {
            try
            {
                return new X509CertificateParser().ReadCertificate(pemObject.Content);
            }
            catch (Exception e)
            {
                throw new PemException("problem parsing cert: " + e.ToString());
            }
        }

        /**
        * Reads in a X509CRL.
        *
        * @return the X509Certificate
        * @throws IOException if an I/O error occured
        */
        private X509Crl ReadCrl(PemObject pemObject)
        {
            try
            {
                return new X509CrlParser().ReadCrl(pemObject.Content);
            }
            catch (Exception e)
            {
                throw new PemException("problem parsing cert: " + e.ToString());
            }
        }

        /**
        * Reads in a PKCS10 certification request.
        *
        * @return the certificate request.
        * @throws IOException if an I/O error occured
        */
        private Pkcs10CertificationRequest ReadCertificateRequest(PemObject pemObject)
        {
            try
            {
                return new Pkcs10CertificationRequest(pemObject.Content);
            }
            catch (Exception e)
            {
                throw new PemException("problem parsing cert: " + e.ToString());
            }
        }

        /**
        * Reads in a X509 Attribute Certificate.
        *
        * @return the X509 Attribute Certificate
        * @throws IOException if an I/O error occured
        */
        private X509V2AttributeCertificate ReadAttributeCertificate(PemObject pemObject)
        {
            return new X509V2AttributeCertificate(pemObject.Content);
        }

        /**
        * Reads in a PKCS7 object. This returns a ContentInfo object suitable for use with the CMS
        * API.
        *
        * @return the X509Certificate
        * @throws IOException if an I/O error occured
        */
        // TODO Consider returning Asn1.Pkcs.ContentInfo
        private Asn1.Cms.ContentInfo ReadPkcs7(PemObject pemObject)
        {
            try
            {
                return Asn1.Cms.ContentInfo.GetInstance(
                    Asn1Object.FromByteArray(pemObject.Content));
            }
            catch (Exception e)
            {
                throw new PemException("problem parsing PKCS7 object: " + e.ToString());
            }
        }

        /**
        * Read a Key Pair
        */
        private object ReadPrivateKey(PemObject pemObject)
        {
            //
            // extract the key
            //
            Debug.Assert(Platform.EndsWith(pemObject.Type, "PRIVATE KEY"));

            string type = pemObject.Type.Substring(0, pemObject.Type.Length - "PRIVATE KEY".Length).Trim();
            byte[] keyBytes = pemObject.Content;

            var fields = new Dictionary<string, string>();
            foreach (PemHeader header in pemObject.Headers)
            {
                fields[header.Name] = header.Value;
            }

            string procType = CollectionUtilities.GetValueOrNull(fields, "Proc-Type");

            if (procType == "4,ENCRYPTED")
            {
                if (pFinder == null)
                    throw new PasswordException("No password finder specified, but a password is required");

                char[] password = pFinder.GetPassword();
                if (password == null)
                    throw new PasswordException("Password is null, but a password is required");

                if (!fields.TryGetValue("DEK-Info", out var dekInfo))
                    throw new PemException("missing DEK-info");

                string[] tknz = dekInfo.Split(',');

                string dekAlgName = tknz[0].Trim();
                byte[] iv = Hex.Decode(tknz[1].Trim());

                keyBytes = PemUtilities.Crypt(false, keyBytes, password, dekAlgName, iv);
            }

            try
            {
                AsymmetricKeyParameter pubSpec, privSpec;
                Asn1Sequence seq = Asn1Sequence.GetInstance(keyBytes);

                switch (type)
                {
                    case "RSA":
                    {
                        if (seq.Count != 9)
                            throw new PemException("malformed sequence in RSA private key");

                        RsaPrivateKeyStructure rsa = RsaPrivateKeyStructure.GetInstance(seq);

                        pubSpec = new RsaKeyParameters(false, rsa.Modulus, rsa.PublicExponent);
                        privSpec = new RsaPrivateCrtKeyParameters(
                            rsa.Modulus, rsa.PublicExponent, rsa.PrivateExponent,
                            rsa.Prime1, rsa.Prime2, rsa.Exponent1, rsa.Exponent2,
                            rsa.Coefficient);

                        break;
                    }

                    case "DSA":
                    {
                        if (seq.Count != 6)
                            throw new PemException("malformed sequence in DSA private key");

                        // TODO Create an ASN1 object somewhere for this?
                        //DerInteger v = (DerInteger)seq[0];
                        DerInteger p = (DerInteger)seq[1];
                        DerInteger q = (DerInteger)seq[2];
                        DerInteger g = (DerInteger)seq[3];
                        DerInteger y = (DerInteger)seq[4];
                        DerInteger x = (DerInteger)seq[5];

                        DsaParameters parameters = new DsaParameters(p.Value, q.Value, g.Value);

                        privSpec = new DsaPrivateKeyParameters(x.Value, parameters);
                        pubSpec = new DsaPublicKeyParameters(y.Value, parameters);

                        break;
                    }

                    case "EC":
                    {
                        ECPrivateKeyStructure pKey = ECPrivateKeyStructure.GetInstance(seq);
                        AlgorithmIdentifier algId = new AlgorithmIdentifier(
                            X9ObjectIdentifiers.IdECPublicKey, pKey.GetParameters());

                        PrivateKeyInfo privInfo = new PrivateKeyInfo(algId, pKey.ToAsn1Object());

                        // TODO Are the keys returned here ECDSA, as Java version forces?
                        privSpec = PrivateKeyFactory.CreateKey(privInfo);

                        DerBitString pubKey = pKey.GetPublicKey();
                        if (pubKey != null)
                        {
                            SubjectPublicKeyInfo pubInfo = new SubjectPublicKeyInfo(algId, pubKey.GetBytes());

                            // TODO Are the keys returned here ECDSA, as Java version forces?
                            pubSpec = PublicKeyFactory.CreateKey(pubInfo);
                        }
                        else
                        {
                            pubSpec = ECKeyPairGenerator.GetCorrespondingPublicKey(
                                (ECPrivateKeyParameters)privSpec);
                        }

                        break;
                    }

                    case "ENCRYPTED":
                    {
                        char[] password = pFinder.GetPassword();

                        if (password == null)
                            throw new PasswordException("Password is null, but a password is required");

                        return PrivateKeyFactory.DecryptKey(password, EncryptedPrivateKeyInfo.GetInstance(seq));
                    }

                    case "":
                    {
                        return PrivateKeyFactory.CreateKey(PrivateKeyInfo.GetInstance(seq));
                    }

                    default:
                        throw new ArgumentException("Unknown key type: " + type, "type");
                }

                return new AsymmetricCipherKeyPair(pubSpec, privSpec);
            }
            catch (IOException e)
            {
                throw e;
            }
            catch (Exception e)
            {
                throw new PemException(
                    "problem creating " + type + " private key: " + e.ToString());
            }
        }

        // TODO Add an equivalent class for ECNamedCurveParameterSpec?
        //private ECNamedCurveParameterSpec ReadECParameters(
//		private X9ECParameters ReadECParameters(PemObject pemObject)
//		{
//			DerObjectIdentifier oid = (DerObjectIdentifier)Asn1Object.FromByteArray(pemObject.Content);
//
//			//return ECNamedCurveTable.getParameterSpec(oid.Id);
//			return GetCurveParameters(oid.Id);
//		}

        private static X9ECParameters GetCurveParameters(string name)
        {
            X9ECParameters ecP = ECKeyPairGenerator.FindECCurveByName(name);
            if (ecP == null)
                throw new Exception("unknown curve name: " + name);

            return ecP;
        }
    }
}
