using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Cms
{
	/**
	* containing class for an CMS Authenticated Data object
	*/
	public class CmsAuthenticatedData
	{
		internal RecipientInformationStore recipientInfoStore;
		internal ContentInfo contentInfo;

		private AlgorithmIdentifier macAlg;
		private Asn1Set authAttrs;
		private Asn1Set unauthAttrs;
		private byte[] mac;

		public CmsAuthenticatedData(
			byte[] authData)
			: this(CmsUtilities.ReadContentInfo(authData))
		{
		}

		public CmsAuthenticatedData(
			Stream authData)
			: this(CmsUtilities.ReadContentInfo(authData))
		{
		}

		public CmsAuthenticatedData(
			ContentInfo contentInfo)
		{
			this.contentInfo = contentInfo;

			AuthenticatedData authData = AuthenticatedData.GetInstance(contentInfo.Content);

			//
			// read the recipients
			//
			Asn1Set recipientInfos = authData.RecipientInfos;

			this.macAlg = authData.MacAlgorithm;

			//
			// read the authenticated content info
			//
			ContentInfo encInfo = authData.EncapsulatedContentInfo;
			CmsReadable readable = new CmsProcessableByteArray(
				Asn1OctetString.GetInstance(encInfo.Content).GetOctets());
			CmsSecureReadable secureReadable = new CmsEnvelopedHelper.CmsAuthenticatedSecureReadable(
				this.macAlg, readable);

			//
			// build the RecipientInformationStore
			//
			this.recipientInfoStore = CmsEnvelopedHelper.BuildRecipientInformationStore(
				recipientInfos, secureReadable);

			this.authAttrs = authData.AuthAttrs;
			this.mac = authData.Mac.GetOctets();
			this.unauthAttrs = authData.UnauthAttrs;
		}

		public byte[] GetMac()
		{
			return Arrays.Clone(mac);
		}

		public AlgorithmIdentifier MacAlgorithmID
		{
			get { return macAlg; }
		}

		/**
		* return the object identifier for the content MAC algorithm.
		*/
		public string MacAlgOid
		{
            get { return macAlg.Algorithm.Id; }
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
		* return a table of the digested attributes indexed by
		* the OID of the attribute.
		*/
		public Asn1.Cms.AttributeTable GetAuthAttrs()
		{
			if (authAttrs == null)
				return null;

			return new Asn1.Cms.AttributeTable(authAttrs);
		}

		/**
		* return a table of the undigested attributes indexed by
		* the OID of the attribute.
		*/
		public Asn1.Cms.AttributeTable GetUnauthAttrs()
		{
			if (unauthAttrs == null)
				return null;

			return new Asn1.Cms.AttributeTable(unauthAttrs);
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
