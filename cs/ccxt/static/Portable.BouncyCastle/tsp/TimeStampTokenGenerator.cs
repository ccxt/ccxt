using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Ess;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Tsp
{
    public enum Resolution
    {
        R_SECONDS, R_TENTHS_OF_SECONDS, R_HUNDREDTHS_OF_SECONDS, R_MILLISECONDS
    }

    public class TimeStampTokenGenerator
    {
        private int accuracySeconds = -1;
        private int accuracyMillis = -1;
        private int accuracyMicros = -1;
        private bool ordering = false;
        private GeneralName tsa = null;
        private DerObjectIdentifier tsaPolicyOID;
    
        private IStore<X509Certificate> x509Certs;
        private IStore<X509Crl> x509Crls;
        private IStore<X509V2AttributeCertificate> x509AttrCerts;
        // TODO Port changes from bc-java
        //private Dictionary<> otherRevoc = new Dictionary<>();
        private SignerInfoGenerator signerInfoGenerator;
        IDigestFactory digestCalculator;

        private Resolution resolution = Resolution.R_SECONDS;
      
        public Resolution Resolution
        {
            get { return resolution; }
            set { resolution = value; }
        }

        /**
		 * basic creation - only the default attributes will be included here.
		 */
        public TimeStampTokenGenerator(
            AsymmetricKeyParameter key,
            X509Certificate cert,
            string digestOID,
            string tsaPolicyOID)
            : this(key, cert, digestOID, tsaPolicyOID, null, null)
        {
        }

        public TimeStampTokenGenerator(
            SignerInfoGenerator signerInfoGen,
            IDigestFactory digestCalculator,
            DerObjectIdentifier tsaPolicy,
            bool isIssuerSerialIncluded)
        {
            this.signerInfoGenerator = signerInfoGen;
            this.digestCalculator = digestCalculator;
            this.tsaPolicyOID = tsaPolicy;

            if (signerInfoGenerator.certificate == null)
                throw new ArgumentException("SignerInfoGenerator must have an associated certificate");

            X509Certificate assocCert = signerInfoGenerator.certificate;
            TspUtil.ValidateCertificate(assocCert);

            try
            {
                IStreamCalculator calculator = digestCalculator.CreateCalculator();
                Stream stream = calculator.Stream;
                byte[] certEnc = assocCert.GetEncoded();
                stream.Write(certEnc, 0, certEnc.Length);
                stream.Flush();
                Platform.Dispose(stream);

                if (((AlgorithmIdentifier)digestCalculator.AlgorithmDetails).Algorithm.Equals(OiwObjectIdentifiers.IdSha1))
                {
                    EssCertID essCertID = new EssCertID(
                       ((IBlockResult)calculator.GetResult()).Collect(),
                       isIssuerSerialIncluded ?
                           new IssuerSerial(
                               new GeneralNames(
                                   new GeneralName(assocCert.IssuerDN)),
                               new DerInteger(assocCert.SerialNumber)) : null);

                    this.signerInfoGenerator = signerInfoGen.NewBuilder()
                        .WithSignedAttributeGenerator(new TableGen(signerInfoGen, essCertID))
                        .Build(signerInfoGen.contentSigner, signerInfoGen.certificate);
                }
                else
                {
                    AlgorithmIdentifier digestAlgID = new AlgorithmIdentifier(
                        ((AlgorithmIdentifier)digestCalculator.AlgorithmDetails).Algorithm);

                    EssCertIDv2 essCertID = new EssCertIDv2(
                        ((IBlockResult)calculator.GetResult()).Collect(),
                        isIssuerSerialIncluded ?
                            new IssuerSerial(
                                new GeneralNames(
                                    new GeneralName(assocCert.IssuerDN)),
                                new DerInteger(assocCert.SerialNumber)) : null);

                    this.signerInfoGenerator = signerInfoGen.NewBuilder()
                        .WithSignedAttributeGenerator(new TableGen2(signerInfoGen, essCertID))
                        .Build(signerInfoGen.contentSigner, signerInfoGen.certificate);
                }
            }
            catch (Exception ex)
            {
                throw new TspException("Exception processing certificate", ex);
            }
        }

        /**
         * create with a signer with extra signed/unsigned attributes.
         */
        public TimeStampTokenGenerator(
           AsymmetricKeyParameter key,
           X509Certificate cert,
           string digestOID,
           string tsaPolicyOID,
           Asn1.Cms.AttributeTable signedAttr,
           Asn1.Cms.AttributeTable unsignedAttr) : this(
               makeInfoGenerator(key, cert, digestOID, signedAttr, unsignedAttr),
               Asn1DigestFactory.Get(OiwObjectIdentifiers.IdSha1),
               tsaPolicyOID != null ? new DerObjectIdentifier(tsaPolicyOID):null, false)
        {
        }

        internal static SignerInfoGenerator makeInfoGenerator(
          AsymmetricKeyParameter key,
          X509Certificate cert,
          string digestOID,
          Asn1.Cms.AttributeTable signedAttr,
          Asn1.Cms.AttributeTable unsignedAttr)
        {
            TspUtil.ValidateCertificate(cert);

            //
            // Add the ESSCertID attribute
            //
            IDictionary<DerObjectIdentifier, object> signedAttrs;
            if (signedAttr != null)
            {
                signedAttrs = signedAttr.ToDictionary();
            }
            else
            {
                signedAttrs = new Dictionary<DerObjectIdentifier, object>();
            }

            //try
            //{
            //    byte[] hash = DigestUtilities.CalculateDigest("SHA-1", cert.GetEncoded());

            //    EssCertID essCertid = new EssCertID(hash);

            //    Asn1.Cms.Attribute attr = new Asn1.Cms.Attribute(
            //        PkcsObjectIdentifiers.IdAASigningCertificate,
            //        new DerSet(new SigningCertificate(essCertid)));

            //    signedAttrs[attr.AttrType] = attr;
            //}
            //catch (CertificateEncodingException e)
            //{
            //    throw new TspException("Exception processing certificate.", e);
            //}
            //catch (SecurityUtilityException e)
            //{
            //    throw new TspException("Can't find a SHA-1 implementation.", e);
            //}

            string digestName = CmsSignedHelper.Instance.GetDigestAlgName(digestOID);
            string signatureName = digestName + "with" + CmsSignedHelper.Instance.GetEncryptionAlgName(CmsSignedHelper.Instance.GetEncOid(key, digestOID));

            Asn1SignatureFactory sigfact = new Asn1SignatureFactory(signatureName, key);
            return new SignerInfoGeneratorBuilder()
             .WithSignedAttributeGenerator(
                new DefaultSignedAttributeTableGenerator(
                    new Asn1.Cms.AttributeTable(signedAttrs)))
              .WithUnsignedAttributeGenerator(
                new SimpleAttributeTableGenerator(unsignedAttr))
                .Build(sigfact, cert);
        }

        public void SetAttributeCertificates(IStore<X509V2AttributeCertificate> attributeCertificates)
        {
            this.x509AttrCerts = attributeCertificates;
        }

        public void SetCertificates(IStore<X509Certificate> certificates)
        {
            this.x509Certs = certificates;
        }

        public void SetCrls(IStore<X509Crl> crls)
        {
            this.x509Crls = crls;
        }

        public void SetAccuracySeconds(
            int accuracySeconds)
        {
            this.accuracySeconds = accuracySeconds;
        }

        public void SetAccuracyMillis(
            int accuracyMillis)
        {
            this.accuracyMillis = accuracyMillis;
        }

        public void SetAccuracyMicros(
            int accuracyMicros)
        {
            this.accuracyMicros = accuracyMicros;
        }

        public void SetOrdering(
            bool ordering)
        {
            this.ordering = ordering;
        }

        public void SetTsa(
            GeneralName tsa)
        {
            this.tsa = tsa;
        }

        //------------------------------------------------------------------------------

        public TimeStampToken Generate(
           TimeStampRequest request,
           BigInteger serialNumber,
           DateTime genTime)
        {
            return Generate(request, serialNumber, genTime, null);
        }


        public TimeStampToken Generate(
            TimeStampRequest request,
            BigInteger serialNumber,
            DateTime genTime, X509Extensions additionalExtensions)
        {
            DerObjectIdentifier digestAlgOID = new DerObjectIdentifier(request.MessageImprintAlgOid);

            AlgorithmIdentifier algID = new AlgorithmIdentifier(digestAlgOID, DerNull.Instance);
            MessageImprint messageImprint = new MessageImprint(algID, request.GetMessageImprintDigest());

            Accuracy accuracy = null;
            if (accuracySeconds > 0 || accuracyMillis > 0 || accuracyMicros > 0)
            {
                DerInteger seconds = null;
                if (accuracySeconds > 0)
                {
                    seconds = new DerInteger(accuracySeconds);
                }

                DerInteger millis = null;
                if (accuracyMillis > 0)
                {
                    millis = new DerInteger(accuracyMillis);
                }

                DerInteger micros = null;
                if (accuracyMicros > 0)
                {
                    micros = new DerInteger(accuracyMicros);
                }

                accuracy = new Accuracy(seconds, millis, micros);
            }

            DerBoolean derOrdering = null;
            if (ordering)
            {
                derOrdering = DerBoolean.GetInstance(ordering);
            }

            DerInteger nonce = null;
            if (request.Nonce != null)
            {
                nonce = new DerInteger(request.Nonce);
            }
 
            DerObjectIdentifier tsaPolicy = tsaPolicyOID;
            if (request.ReqPolicy != null)
            {
                tsaPolicy = new DerObjectIdentifier(request.ReqPolicy);
            }

            if (tsaPolicy == null)
            { 
                throw new TspValidationException("request contains no policy", PkiFailureInfo.UnacceptedPolicy);
            }

            X509Extensions respExtensions = request.Extensions;
            if (additionalExtensions != null)
            {
                X509ExtensionsGenerator extGen = new X509ExtensionsGenerator();

                if (respExtensions != null)
                {                    
                    foreach(object oid in respExtensions.ExtensionOids)
                    {
                        DerObjectIdentifier id = DerObjectIdentifier.GetInstance(oid);
                        extGen.AddExtension(id, respExtensions.GetExtension(DerObjectIdentifier.GetInstance(id)));
                    }                   
                }

                foreach (object oid in additionalExtensions.ExtensionOids)
                {
                    DerObjectIdentifier id = DerObjectIdentifier.GetInstance(oid);
                    extGen.AddExtension(id, additionalExtensions.GetExtension(DerObjectIdentifier.GetInstance(id)));

                }
           
                respExtensions = extGen.Generate();
            }



            DerGeneralizedTime generalizedTime;
            if (resolution != Resolution.R_SECONDS)
            {
                generalizedTime = new DerGeneralizedTime(createGeneralizedTime(genTime));
            } 
            else
            {
                generalizedTime = new DerGeneralizedTime(genTime);
            }


            TstInfo tstInfo = new TstInfo(tsaPolicy, messageImprint,
                new DerInteger(serialNumber), generalizedTime, accuracy,
                derOrdering, nonce, tsa, respExtensions);

            try
            {
                CmsSignedDataGenerator signedDataGenerator = new CmsSignedDataGenerator();

                byte[] derEncodedTstInfo = tstInfo.GetDerEncoded();

                if (request.CertReq)
                {
                    signedDataGenerator.AddCertificates(x509Certs);
                    signedDataGenerator.AddAttributeCertificates(x509AttrCerts);
                }

                signedDataGenerator.AddCrls(x509Crls);

                signedDataGenerator.AddSignerInfoGenerator(signerInfoGenerator);

                CmsSignedData signedData = signedDataGenerator.Generate(
                    PkcsObjectIdentifiers.IdCTTstInfo.Id,
                    new CmsProcessableByteArray(derEncodedTstInfo),
                    true);

                return new TimeStampToken(signedData);
            }
            catch (CmsException cmsEx)
            {
                throw new TspException("Error generating time-stamp token", cmsEx);
            }
            catch (IOException e)
            {
                throw new TspException("Exception encoding info", e);
            }
            //			catch (InvalidAlgorithmParameterException e)
            //			{
            //				throw new TspException("Exception handling CertStore CRLs", e);
            //			}
        }

        private string createGeneralizedTime(DateTime genTime)
        {
            string format = "yyyyMMddHHmmss.fff";
           
            StringBuilder sBuild = new StringBuilder(genTime.ToString(format));
            int dotIndex = sBuild.ToString().IndexOf(".");

            if (dotIndex <0)
            {
                sBuild.Append("Z");
                return sBuild.ToString();
            }

            switch(resolution)
            {
                case Resolution.R_TENTHS_OF_SECONDS:
                    if (sBuild.Length > dotIndex + 2)
                    {
                        sBuild.Remove(dotIndex + 2, sBuild.Length-(dotIndex+2));
                    }
                    break;
                case Resolution.R_HUNDREDTHS_OF_SECONDS:
                    if (sBuild.Length > dotIndex + 3)
                    {
                        sBuild.Remove(dotIndex + 3, sBuild.Length-(dotIndex+3));
                    }
                    break;


                case Resolution.R_SECONDS:
                case Resolution.R_MILLISECONDS:
                    // do nothing.
                    break;
             
            }

           
            while (sBuild[sBuild.Length - 1] == '0')
            {
                sBuild.Remove(sBuild.Length - 1,1);
            }

            if (sBuild.Length - 1 == dotIndex)
            {
                sBuild.Remove(sBuild.Length - 1, 1);
            }

            sBuild.Append("Z");
            return sBuild.ToString();
        }

        private class TableGen
            : CmsAttributeTableGenerator
        {
            private readonly SignerInfoGenerator infoGen;
            private readonly EssCertID essCertID;


            public TableGen(SignerInfoGenerator infoGen, EssCertID essCertID)
            {
                this.infoGen = infoGen;
                this.essCertID = essCertID;
            }

            public Asn1.Cms.AttributeTable GetAttributes(IDictionary<CmsAttributeTableParameter, object> parameters)
            {
                Asn1.Cms.AttributeTable tab = infoGen.signedGen.GetAttributes(parameters);
                if (tab[PkcsObjectIdentifiers.IdAASigningCertificate] == null)
                {
                    return tab.Add(PkcsObjectIdentifiers.IdAASigningCertificate, new SigningCertificate(essCertID));
                }
                return tab;
            }
        }

        private class TableGen2
            : CmsAttributeTableGenerator
        {
            private readonly SignerInfoGenerator infoGen;
            private readonly EssCertIDv2 essCertID;


            public TableGen2(SignerInfoGenerator infoGen, EssCertIDv2 essCertID)
            {
                this.infoGen = infoGen;
                this.essCertID = essCertID;
            }

            public Asn1.Cms.AttributeTable GetAttributes(IDictionary<CmsAttributeTableParameter, object> parameters)
            {
                Asn1.Cms.AttributeTable tab = infoGen.signedGen.GetAttributes(parameters);
                if (tab[PkcsObjectIdentifiers.IdAASigningCertificateV2] == null)
                {
                    return tab.Add(PkcsObjectIdentifiers.IdAASigningCertificateV2, new SigningCertificateV2(essCertID));
                }
                return tab;
            }
        }
    }
}
