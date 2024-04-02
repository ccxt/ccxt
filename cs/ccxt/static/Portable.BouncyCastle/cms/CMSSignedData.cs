using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
	/**
	* general class for handling a pkcs7-signature message.
	*
	* A simple example of usage - note, in the example below the validity of
	* the certificate isn't verified, just the fact that one of the certs
	* matches the given signer...
	*
	* <pre>
	*  IX509Store              certs = s.GetCertificates();
	*  SignerInformationStore  signers = s.GetSignerInfos();
	*
	*  foreach (SignerInformation signer in signers.GetSigners())
	*  {
	*      ArrayList       certList = new ArrayList(certs.GetMatches(signer.SignerID));
	*      X509Certificate cert = (X509Certificate) certList[0];
	*
	*      if (signer.Verify(cert.GetPublicKey()))
	*      {
	*          verified++;
	*      }
	*  }
	* </pre>
	*/
	public class CmsSignedData
	{
		private static readonly CmsSignedHelper Helper = CmsSignedHelper.Instance;

		private readonly CmsProcessable	signedContent;
		private SignedData				signedData;
		private ContentInfo				contentInfo;
		private SignerInformationStore	signerInfoStore;
		private IDictionary<string, byte[]> m_hashes;

		private CmsSignedData(CmsSignedData c)
		{
			this.signedData = c.signedData;
			this.contentInfo = c.contentInfo;
			this.signedContent = c.signedContent;
			this.signerInfoStore = c.signerInfoStore;
		}

		public CmsSignedData(byte[] sigBlock)
			: this(CmsUtilities.ReadContentInfo(new MemoryStream(sigBlock, false)))
		{
		}

		public CmsSignedData(CmsProcessable signedContent, byte[] sigBlock)
			: this(signedContent, CmsUtilities.ReadContentInfo(new MemoryStream(sigBlock, false)))
		{
		}

		/**
		 * Content with detached signature, digests precomputed
		 *
		 * @param hashes a map of precomputed digests for content indexed by name of hash.
		 * @param sigBlock the signature object.
		 */
		public CmsSignedData(IDictionary<string, byte[]> hashes, byte[] sigBlock)
			: this(hashes, CmsUtilities.ReadContentInfo(sigBlock))
		{
		}

		/**
		* base constructor - content with detached signature.
		*
		* @param signedContent the content that was signed.
		* @param sigData the signature object.
		*/
		public CmsSignedData(CmsProcessable signedContent, Stream sigData)
			: this(signedContent, CmsUtilities.ReadContentInfo(sigData))
		{
		}

		/**
		* base constructor - with encapsulated content
		*/
		public CmsSignedData(Stream sigData)
			: this(CmsUtilities.ReadContentInfo(sigData))
		{
		}

		public CmsSignedData(CmsProcessable signedContent, ContentInfo sigData)
		{
			this.signedContent = signedContent;
			this.contentInfo = sigData;
			this.signedData = SignedData.GetInstance(contentInfo.Content);
		}

		public CmsSignedData(IDictionary<string, byte[]> hashes, ContentInfo sigData)
		{
			this.m_hashes = hashes;
			this.contentInfo = sigData;
			this.signedData = SignedData.GetInstance(contentInfo.Content);
		}

		public CmsSignedData(ContentInfo sigData)
		{
			this.contentInfo = sigData;
			this.signedData = SignedData.GetInstance(contentInfo.Content);

			//
			// this can happen if the signed message is sent simply to send a
			// certificate chain.
			//
			if (signedData.EncapContentInfo.Content != null)
			{
				this.signedContent = new CmsProcessableByteArray(
					((Asn1OctetString)(signedData.EncapContentInfo.Content)).GetOctets());
			}
//			else
//			{
//				this.signedContent = null;
//			}
		}

		/// <summary>Return the version number for this object.</summary>
		public int Version
		{
			get { return signedData.Version.IntValueExact; }
		}

        /**
		* return the collection of signers that are associated with the
		* signatures for the message.
		*/
        public SignerInformationStore GetSignerInfos()
		{
			if (signerInfoStore == null)
			{
				var signerInfos = new List<SignerInformation>();
				Asn1Set s = signedData.SignerInfos;

				foreach (object obj in s)
				{
					SignerInfo info = SignerInfo.GetInstance(obj);
					DerObjectIdentifier contentType = signedData.EncapContentInfo.ContentType;

					if (m_hashes == null)
					{
						signerInfos.Add(new SignerInformation(info, contentType, signedContent, null));
					}
					else if (m_hashes.TryGetValue(info.DigestAlgorithm.Algorithm.Id, out var hash))
					{
						signerInfos.Add(new SignerInformation(info, contentType, null, new BaseDigestCalculator(hash)));
					}
					else
                    {
						throw new InvalidOperationException();
                    }
				}

				signerInfoStore = new SignerInformationStore(signerInfos);
			}

			return signerInfoStore;
		}

		/**
		 * return a X509Store containing the attribute certificates, if any, contained
		 * in this message.
		 *
		 * @param type type of store to create
		 * @return a store of attribute certificates
		 * @exception NoSuchStoreException if the store type isn't available.
		 * @exception CmsException if a general exception prevents creation of the X509Store
		 */
		public IStore<X509V2AttributeCertificate> GetAttributeCertificates()
		{
			return Helper.GetAttributeCertificates(signedData.Certificates);
		}

		/**
		 * return a X509Store containing the public key certificates, if any, contained in this message.
		 *
		 * @return a store of public key certificates
		 * @exception NoSuchStoreException if the store type isn't available.
		 * @exception CmsException if a general exception prevents creation of the X509Store
		 */
		public IStore<X509Certificate> GetCertificates()
		{
			return Helper.GetCertificates(signedData.Certificates);
		}

		/**
		* return a X509Store containing CRLs, if any, contained in this message.
		*
		* @return a store of CRLs
		* @exception NoSuchStoreException if the store type isn't available.
		* @exception CmsException if a general exception prevents creation of the X509Store
		*/
		public IStore<X509Crl> GetCrls()
		{
			return Helper.GetCrls(signedData.CRLs);
		}

		/// <summary>
		/// Return the <c>DerObjectIdentifier</c> associated with the encapsulated
		/// content info structure carried in the signed data.
		/// </summary>
		public DerObjectIdentifier SignedContentType
		{
			get { return signedData.EncapContentInfo.ContentType; }
		}

		public CmsProcessable SignedContent
		{
			get { return signedContent; }
		}

		/**
		 * return the ContentInfo
		 */
		public ContentInfo ContentInfo
		{
			get { return contentInfo; }
		}

		/**
		* return the ASN.1 encoded representation of this object.
		*/
		public byte[] GetEncoded()
		{
			return contentInfo.GetEncoded();
		}

        /**
         * return the ASN.1 encoded representation of this object using the specified encoding.
         *
         * @param encoding the ASN.1 encoding format to use ("BER" or "DER").
         */
        public byte[] GetEncoded(string encoding)
        {
            return contentInfo.GetEncoded(encoding);
        }

		/**
		* Replace the signerinformation store associated with this
		* CmsSignedData object with the new one passed in. You would
		* probably only want to do this if you wanted to change the unsigned
		* attributes associated with a signer, or perhaps delete one.
		*
		* @param signedData the signed data object to be used as a base.
		* @param signerInformationStore the new signer information store to use.
		* @return a new signed data object.
		*/
		public static CmsSignedData ReplaceSigners(
			CmsSignedData           signedData,
			SignerInformationStore  signerInformationStore)
		{
			//
			// copy
			//
			CmsSignedData cms = new CmsSignedData(signedData);

			//
			// replace the store
			//
			cms.signerInfoStore = signerInformationStore;

			//
			// replace the signers in the SignedData object
			//
			Asn1EncodableVector digestAlgs = new Asn1EncodableVector();
			Asn1EncodableVector vec = new Asn1EncodableVector();

			foreach (SignerInformation signer in signerInformationStore.GetSigners())
			{
				digestAlgs.Add(Helper.FixAlgID(signer.DigestAlgorithmID));
				vec.Add(signer.ToSignerInfo());
			}

			Asn1Set digests = new DerSet(digestAlgs);
			Asn1Set signers = new DerSet(vec);
			Asn1Sequence sD = (Asn1Sequence)signedData.signedData.ToAsn1Object();

			//
			// signers are the last item in the sequence.
			//
			vec = new Asn1EncodableVector(
				sD[0], // version
				digests);

			for (int i = 2; i != sD.Count - 1; i++)
			{
				vec.Add(sD[i]);
			}

			vec.Add(signers);

			cms.signedData = SignedData.GetInstance(new BerSequence(vec));

			//
			// replace the contentInfo with the new one
			//
			cms.contentInfo = new ContentInfo(cms.contentInfo.ContentType, cms.signedData);

			return cms;
		}

		/**
		* Replace the certificate and CRL information associated with this
		* CmsSignedData object with the new one passed in.
		*
		* @param signedData the signed data object to be used as a base.
		* @param x509Certs the new certificates to be used.
		* @param x509Crls the new CRLs to be used.
		* @return a new signed data object.
		* @exception CmsException if there is an error processing the stores
		*/
		public static CmsSignedData ReplaceCertificatesAndCrls(CmsSignedData signedData, IStore<X509Certificate> x509Certs,
			IStore<X509Crl> x509Crls, IStore<X509V2AttributeCertificate> x509AttrCerts)
		{
			//
			// copy
			//
			CmsSignedData cms = new CmsSignedData(signedData);

			//
			// replace the certs and crls in the SignedData object
			//
			Asn1Set certSet = null;
			Asn1Set crlSet = null;

			if (x509Certs != null || x509AttrCerts != null)
			{
				var certs = new List<Asn1Encodable>();

				if (x509Certs != null)
				{
					certs.AddRange(CmsUtilities.GetCertificatesFromStore(x509Certs));
				}
				if (x509AttrCerts != null)
				{
					certs.AddRange(CmsUtilities.GetAttributeCertificatesFromStore(x509AttrCerts));
				}

				Asn1Set berSet = CmsUtilities.CreateBerSetFromList(certs);
				if (berSet.Count > 0)
				{
					certSet = berSet;
				}
			}

			if (x509Crls != null)
			{
				var crls = CmsUtilities.GetCrlsFromStore(x509Crls);

				Asn1Set berSet = CmsUtilities.CreateBerSetFromList(crls);
				if (berSet.Count > 0)
				{
					crlSet = berSet;
				}
			}

			//
			// replace the CMS structure.
			//
			SignedData old = signedData.signedData;
			cms.signedData = new SignedData(
				old.DigestAlgorithms,
				old.EncapContentInfo,
				certSet,
				crlSet,
				old.SignerInfos);

			//
			// replace the contentInfo with the new one
			//
			cms.contentInfo = new ContentInfo(cms.contentInfo.ContentType, cms.signedData);

			return cms;
		}
	}
}
