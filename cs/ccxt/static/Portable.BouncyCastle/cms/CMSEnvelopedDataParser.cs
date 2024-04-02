using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Cms
{
	/**
	* Parsing class for an CMS Enveloped Data object from an input stream.
	* <p>
	* Note: that because we are in a streaming mode only one recipient can be tried and it is important
	* that the methods on the parser are called in the appropriate order.
	* </p>
	* <p>
	* Example of use - assuming the first recipient matches the private key we have.
	* <pre>
	*      CmsEnvelopedDataParser     ep = new CmsEnvelopedDataParser(inputStream);
	*
	*      RecipientInformationStore  recipients = ep.GetRecipientInfos();
	*
	*      Collection  c = recipients.getRecipients();
	*      Iterator    it = c.iterator();
	*
	*      if (it.hasNext())
	*      {
	*          RecipientInformation   recipient = (RecipientInformation)it.next();
	*
	*          CMSTypedStream recData = recipient.getContentStream(privateKey);
	*
	*          processDataStream(recData.getContentStream());
	*      }
	*  </pre>
	*  Note: this class does not introduce buffering - if you are processing large files you should create
	*  the parser with:
	*  <pre>
	*          CmsEnvelopedDataParser     ep = new CmsEnvelopedDataParser(new BufferedInputStream(inputStream, bufSize));
	*  </pre>
	*  where bufSize is a suitably large buffer size.
	* </p>
	*/
	public class CmsEnvelopedDataParser
		: CmsContentInfoParser
	{
		internal RecipientInformationStore	recipientInfoStore;
		internal EnvelopedDataParser		envelopedData;

		private AlgorithmIdentifier			_encAlg;
		private Asn1.Cms.AttributeTable		_unprotectedAttributes;
		private bool						_attrNotRead;

		public CmsEnvelopedDataParser(
			byte[] envelopedData)
			: this(new MemoryStream(envelopedData, false))
		{
		}

		public CmsEnvelopedDataParser(
			Stream envelopedData)
			: base(envelopedData)
		{
			this._attrNotRead = true;
			this.envelopedData = new EnvelopedDataParser(
				(Asn1SequenceParser)this.contentInfo.GetContent(Asn1Tags.Sequence));

			// TODO Validate version?
			//DerInteger version = this.envelopedData.Version;

			//
			// read the recipients
			//
			Asn1Set recipientInfos = Asn1Set.GetInstance(this.envelopedData.GetRecipientInfos().ToAsn1Object());

			//
			// read the encrypted content info
			//
			EncryptedContentInfoParser encInfo = this.envelopedData.GetEncryptedContentInfo();
			this._encAlg = encInfo.ContentEncryptionAlgorithm;
			CmsReadable readable = new CmsProcessableInputStream(
				((Asn1OctetStringParser)encInfo.GetEncryptedContent(Asn1Tags.OctetString)).GetOctetStream());
			CmsSecureReadable secureReadable = new CmsEnvelopedHelper.CmsEnvelopedSecureReadable(
				this._encAlg, readable);

			//
			// build the RecipientInformationStore
			//
			this.recipientInfoStore = CmsEnvelopedHelper.BuildRecipientInformationStore(
				recipientInfos, secureReadable);
		}

		public AlgorithmIdentifier EncryptionAlgorithmID
		{
			get { return _encAlg; }
		}

		/**
		 * return the object identifier for the content encryption algorithm.
		 */
		public string EncryptionAlgOid
		{
            get { return _encAlg.Algorithm.Id; }
		}

		/**
		 * return the ASN.1 encoded encryption algorithm parameters, or null if
		 * there aren't any.
		 */
		public Asn1Object EncryptionAlgParams
		{
			get
			{
				Asn1Encodable ae = _encAlg.Parameters;

				return ae == null ? null : ae.ToAsn1Object();
			}
		}

		/**
		 * return a store of the intended recipients for this message
		 */
		public RecipientInformationStore GetRecipientInfos()
		{
			return this.recipientInfoStore;
		}

		/**
		 * return a table of the unprotected attributes indexed by
		 * the OID of the attribute.
		 * @throws IOException
		 */
		public Asn1.Cms.AttributeTable GetUnprotectedAttributes()
		{
			if (_unprotectedAttributes == null && _attrNotRead)
			{
				Asn1SetParser asn1Set = this.envelopedData.GetUnprotectedAttrs();

				_attrNotRead = false;

				if (asn1Set != null)
				{
					Asn1EncodableVector v = new Asn1EncodableVector();
					IAsn1Convertible o;

					while ((o = asn1Set.ReadObject()) != null)
					{
						Asn1SequenceParser seq = (Asn1SequenceParser)o;

						v.Add(seq.ToAsn1Object());
					}

					_unprotectedAttributes = new Asn1.Cms.AttributeTable(new DerSet(v));
				}
			}

			return _unprotectedAttributes;
		}
	}
}
