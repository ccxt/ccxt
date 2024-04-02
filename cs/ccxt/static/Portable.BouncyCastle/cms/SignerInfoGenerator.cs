using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    internal interface ISignerInfoGenerator
    {
        SignerInfo Generate(DerObjectIdentifier contentType, AlgorithmIdentifier digestAlgorithm,
            byte[] calculatedDigest);
    }

    public class SignerInfoGenerator
    {
        internal X509Certificate certificate;
        internal ISignatureFactory contentSigner;
        internal SignerIdentifier sigId;
        internal CmsAttributeTableGenerator signedGen;
        internal CmsAttributeTableGenerator unsignedGen;
        private bool isDirectSignature;

        internal SignerInfoGenerator(SignerIdentifier sigId, ISignatureFactory signerFactory): this(sigId, signerFactory, false)
        {

        }

        internal SignerInfoGenerator(SignerIdentifier sigId, ISignatureFactory signerFactory, bool isDirectSignature)
        {
            this.sigId = sigId;
            this.contentSigner = signerFactory;
            this.isDirectSignature = isDirectSignature;
            if (this.isDirectSignature)
            {
                this.signedGen = null;
                this.unsignedGen = null;
            }
            else
            {
                this.signedGen = new DefaultSignedAttributeTableGenerator();
                this.unsignedGen = null;
            }
        }

        internal SignerInfoGenerator(SignerIdentifier sigId, ISignatureFactory contentSigner, CmsAttributeTableGenerator signedGen, CmsAttributeTableGenerator unsignedGen)
        {
            this.sigId = sigId;
            this.contentSigner = contentSigner;
            this.signedGen = signedGen;
            this.unsignedGen = unsignedGen;
            this.isDirectSignature = false;
        }

        internal void setAssociatedCertificate(X509Certificate certificate)
        {
            this.certificate = certificate;
        }

        public SignerInfoGeneratorBuilder NewBuilder()
        {
            SignerInfoGeneratorBuilder builder = new SignerInfoGeneratorBuilder();
            builder.WithSignedAttributeGenerator(signedGen);
            builder.WithUnsignedAttributeGenerator(unsignedGen);
            builder.SetDirectSignature(isDirectSignature);
            return builder;
        }

    }

    public class SignerInfoGeneratorBuilder
    {
        private bool directSignature;
        private CmsAttributeTableGenerator signedGen;
        private CmsAttributeTableGenerator unsignedGen;

        public SignerInfoGeneratorBuilder()
        {
        }
    

        /**
         * If the passed in flag is true, the signer signature will be based on the data, not
         * a collection of signed attributes, and no signed attributes will be included.
         *
         * @return the builder object
         */
        public SignerInfoGeneratorBuilder SetDirectSignature(bool hasNoSignedAttributes)
        {
            this.directSignature = hasNoSignedAttributes;

            return this;
        }

        /**
         *  Provide a custom signed attribute generator.
         *
         * @param signedGen a generator of signed attributes.
         * @return the builder object
         */
        public SignerInfoGeneratorBuilder WithSignedAttributeGenerator(CmsAttributeTableGenerator signedGen)
        {
            this.signedGen = signedGen;

            return this;
        }

        /**
         * Provide a generator of unsigned attributes.
         *
         * @param unsignedGen  a generator for signed attributes.
         * @return the builder object
         */
        public SignerInfoGeneratorBuilder WithUnsignedAttributeGenerator(CmsAttributeTableGenerator unsignedGen)
        {
            this.unsignedGen = unsignedGen;

            return this;
        }

        /**
         * Build a generator with the passed in X.509 certificate issuer and serial number as the signerIdentifier.
         *
         * @param contentSigner  operator for generating the final signature in the SignerInfo with.
         * @param certificate  X.509 certificate related to the contentSigner.
         * @return  a SignerInfoGenerator
         * @throws OperatorCreationException   if the generator cannot be built.
         */
        public SignerInfoGenerator Build(ISignatureFactory contentSigner, X509Certificate certificate)
        {
            SignerIdentifier sigId = new SignerIdentifier(new IssuerAndSerialNumber(certificate.IssuerDN, new DerInteger(certificate.SerialNumber)));

            SignerInfoGenerator sigInfoGen = CreateGenerator(contentSigner, sigId);

            sigInfoGen.setAssociatedCertificate(certificate);

            return sigInfoGen;
        }

        /**
         * Build a generator with the passed in subjectKeyIdentifier as the signerIdentifier. If used  you should
         * try to follow the calculation described in RFC 5280 section 4.2.1.2.
         *
         * @param signerFactory  operator factory for generating the final signature in the SignerInfo with.
         * @param subjectKeyIdentifier    key identifier to identify the public key for verifying the signature.
         * @return  a SignerInfoGenerator
         */
        public SignerInfoGenerator Build(ISignatureFactory signerFactory, byte[] subjectKeyIdentifier)
        {
            SignerIdentifier sigId = new SignerIdentifier(new DerOctetString(subjectKeyIdentifier));

            return CreateGenerator(signerFactory, sigId);
        }

        private SignerInfoGenerator CreateGenerator(ISignatureFactory contentSigner, SignerIdentifier sigId)
        {
            if (directSignature)
            {
                return new SignerInfoGenerator(sigId, contentSigner, true);
            }

            if (signedGen != null || unsignedGen != null)
            {
                if (signedGen == null)
                {
                    signedGen = new DefaultSignedAttributeTableGenerator();
                }

                return new SignerInfoGenerator(sigId, contentSigner, signedGen, unsignedGen);
            }

            return new SignerInfoGenerator(sigId, contentSigner);
        }
    }
}
