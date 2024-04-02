using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Cms
{
    /**
    * containing class for an CMS Enveloped Data object
    */
    public class CmsEnvelopedData
    {
        internal RecipientInformationStore	recipientInfoStore;
        internal ContentInfo				contentInfo;

		private AlgorithmIdentifier	encAlg;
        private Asn1Set				unprotectedAttributes;

		public CmsEnvelopedData(
            byte[] envelopedData)
            : this(CmsUtilities.ReadContentInfo(envelopedData))
        {
        }

        public CmsEnvelopedData(
            Stream envelopedData)
            : this(CmsUtilities.ReadContentInfo(envelopedData))
        {
        }

        public CmsEnvelopedData(
            ContentInfo contentInfo)
        {
            this.contentInfo = contentInfo;

			EnvelopedData envData = EnvelopedData.GetInstance(contentInfo.Content);

			//
			// read the recipients
			//
			Asn1Set recipientInfos = envData.RecipientInfos;

			//
			// read the encrypted content info
			//
			EncryptedContentInfo encInfo = envData.EncryptedContentInfo;
			this.encAlg = encInfo.ContentEncryptionAlgorithm;
			CmsReadable readable = new CmsProcessableByteArray(encInfo.EncryptedContent.GetOctets());
			CmsSecureReadable secureReadable = new CmsEnvelopedHelper.CmsEnvelopedSecureReadable(
				this.encAlg, readable);

			//
			// build the RecipientInformationStore
			//
			this.recipientInfoStore = CmsEnvelopedHelper.BuildRecipientInformationStore(
				recipientInfos, secureReadable);

			this.unprotectedAttributes = envData.UnprotectedAttrs;
        }

		public AlgorithmIdentifier EncryptionAlgorithmID
		{
			get { return encAlg; }
		}

		/**
        * return the object identifier for the content encryption algorithm.
        */
        public string EncryptionAlgOid
        {
            get { return encAlg.Algorithm.Id; }
        }

		/**
        * return a store of the intended recipients for this message
        */
        public RecipientInformationStore GetRecipientInfos()
        {
            return recipientInfoStore;
        }

		/**
		 * return the ContentInfo 
		 */
		public ContentInfo ContentInfo
		{
			get { return contentInfo; }
		}

		/**
        * return a table of the unprotected attributes indexed by
        * the OID of the attribute.
        */
        public Asn1.Cms.AttributeTable GetUnprotectedAttributes()
        {
            if (unprotectedAttributes == null)
                return null;

			return new Asn1.Cms.AttributeTable(unprotectedAttributes);
        }

		/**
        * return the ASN.1 encoded representation of this object.
        */
        public byte[] GetEncoded()
        {
			return contentInfo.GetEncoded();
        }
    }
}
