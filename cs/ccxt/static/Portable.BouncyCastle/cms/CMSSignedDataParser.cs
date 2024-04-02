using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.IO;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
	/**
	* Parsing class for an CMS Signed Data object from an input stream.
	* <p>
	* Note: that because we are in a streaming mode only one signer can be tried and it is important
	* that the methods on the parser are called in the appropriate order.
	* </p>
	* <p>
	* A simple example of usage for an encapsulated signature.
	* </p>
	* <p>
	* Two notes: first, in the example below the validity of
	* the certificate isn't verified, just the fact that one of the certs
	* matches the given signer, and, second, because we are in a streaming
	* mode the order of the operations is important.
	* </p>
	* <pre>
	*      CmsSignedDataParser     sp = new CmsSignedDataParser(encapSigData);
	*
	*      sp.GetSignedContent().Drain();
	*
	*      IX509Store              certs = sp.GetCertificates();
	*      SignerInformationStore  signers = sp.GetSignerInfos();
	*
	*      foreach (SignerInformation signer in signers.GetSigners())
	*      {
	*          ArrayList       certList = new ArrayList(certs.GetMatches(signer.SignerID));
	*          X509Certificate cert = (X509Certificate) certList[0];
	*
	*          Console.WriteLine("verify returns: " + signer.Verify(cert));
	*      }
	* </pre>
	*  Note also: this class does not introduce buffering - if you are processing large files you should create
	*  the parser with:
	*  <pre>
	*          CmsSignedDataParser     ep = new CmsSignedDataParser(new BufferedInputStream(encapSigData, bufSize));
	*  </pre>
	*  where bufSize is a suitably large buffer size.
	*/
	public class CmsSignedDataParser
		: CmsContentInfoParser
	{
		private static readonly CmsSignedHelper Helper = CmsSignedHelper.Instance;

		private SignedDataParser        _signedData;
		private DerObjectIdentifier		_signedContentType;
		private CmsTypedStream          _signedContent;
		private IDictionary<string, IDigest> m_digests;
		private HashSet<string>			_digestOids;

		private SignerInformationStore  _signerInfoStore;
		private Asn1Set                 _certSet, _crlSet;
		private bool					_isCertCrlParsed;

		public CmsSignedDataParser(
			byte[] sigBlock)
			: this(new MemoryStream(sigBlock, false))
		{
		}

		public CmsSignedDataParser(
			CmsTypedStream	signedContent,
			byte[]			sigBlock)
			: this(signedContent, new MemoryStream(sigBlock, false))
		{
		}

		/**
		* base constructor - with encapsulated content
		*/
		public CmsSignedDataParser(
			Stream sigData)
			: this(null, sigData)
		{
		}

		/**
		* base constructor
		*
		* @param signedContent the content that was signed.
		* @param sigData the signature object.
		*/
		public CmsSignedDataParser(
			CmsTypedStream	signedContent,
			Stream			sigData)
			: base(sigData)
		{
			try
			{
				this._signedContent = signedContent;
				this._signedData = SignedDataParser.GetInstance(this.contentInfo.GetContent(Asn1Tags.Sequence));
				this.m_digests = new Dictionary<string, IDigest>(StringComparer.OrdinalIgnoreCase);
				this._digestOids = new HashSet<string>();

				Asn1SetParser digAlgs = _signedData.GetDigestAlgorithms();
				IAsn1Convertible o;

				while ((o = digAlgs.ReadObject()) != null)
				{
					AlgorithmIdentifier id = AlgorithmIdentifier.GetInstance(o.ToAsn1Object());

					try
					{
                        string digestOid = id.Algorithm.Id;
						string digestName = Helper.GetDigestAlgName(digestOid);

						if (!this.m_digests.ContainsKey(digestName))
						{
							this.m_digests[digestName] = Helper.GetDigestInstance(digestName);
							this._digestOids.Add(digestOid);
						}
					}
					catch (SecurityUtilityException)
					{
						// TODO Should do something other than ignore it
					}
				}

				//
				// If the message is simply a certificate chain message GetContent() may return null.
				//
				ContentInfoParser cont = _signedData.GetEncapContentInfo();
				Asn1OctetStringParser octs = (Asn1OctetStringParser)
					cont.GetContent(Asn1Tags.OctetString);

				if (octs != null)
				{
					CmsTypedStream ctStr = new CmsTypedStream(
						cont.ContentType.Id, octs.GetOctetStream());

					if (_signedContent == null)
					{
						this._signedContent = ctStr;
					}
					else
					{
						//
						// content passed in, need to read past empty encapsulated content info object if present
						//
						ctStr.Drain();
					}
				}

				_signedContentType = _signedContent == null
					?	cont.ContentType
					:	new DerObjectIdentifier(_signedContent.ContentType);
			}
			catch (IOException e)
			{
				throw new CmsException("io exception: " + e.Message, e);
			}
		}

		/**
		 * Return the version number for the SignedData object
		 *
		 * @return the version number
		 */
		public int Version
		{
			get { return _signedData.Version.IntValueExact; }
		}

		public ISet<string> DigestOids
		{
			get { return new HashSet<string>(_digestOids); }
		}

		/**
		* return the collection of signers that are associated with the
		* signatures for the message.
		* @throws CmsException
		*/
		public SignerInformationStore GetSignerInfos()
		{
			if (_signerInfoStore == null)
			{
				PopulateCertCrlSets();

				var signerInfos = new List<SignerInformation>();
                var hashes = new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase);

				foreach (var digest in m_digests)
				{
					hashes[digest.Key] = DigestUtilities.DoFinal(digest.Value);
				}

				try
				{
					Asn1SetParser s = _signedData.GetSignerInfos();
					IAsn1Convertible o;

					while ((o = s.ReadObject()) != null)
					{
						SignerInfo info = SignerInfo.GetInstance(o.ToAsn1Object());
						string digestName = Helper.GetDigestAlgName(info.DigestAlgorithm.Algorithm.Id);

						byte[] hash = hashes[digestName];

						signerInfos.Add(new SignerInformation(info, _signedContentType, null, new BaseDigestCalculator(hash)));
					}
				}
				catch (IOException e)
				{
					throw new CmsException("io exception: " + e.Message, e);
				}

				_signerInfoStore = new SignerInformationStore(signerInfos);
			}

			return _signerInfoStore;
		}

		/**
		 * return a X509Store containing the attribute certificates, if any, contained
		 * in this message.
		 *
		 * @param type type of store to create
		 * @return a store of attribute certificates
		 * @exception org.bouncycastle.x509.NoSuchStoreException if the store type isn't available.
		 * @exception CmsException if a general exception prevents creation of the X509Store
		 */
		public IStore<X509V2AttributeCertificate> GetAttributeCertificates()
		{
			PopulateCertCrlSets();

			return Helper.GetAttributeCertificates(_certSet);
		}

		/**
		* return a X509Store containing the public key certificates, if any, contained
		* in this message.
		*
		* @param type type of store to create
		* @return a store of public key certificates
		* @exception NoSuchStoreException if the store type isn't available.
		* @exception CmsException if a general exception prevents creation of the X509Store
		*/
		public IStore<X509Certificate> GetCertificates()
		{
			PopulateCertCrlSets();

			return Helper.GetCertificates(_certSet);
		}

		/**
		* return a X509Store containing CRLs, if any, contained
		* in this message.
		*
		* @param type type of store to create
		* @return a store of CRLs
		* @exception NoSuchStoreException if the store type isn't available.
		* @exception CmsException if a general exception prevents creation of the X509Store
		*/
		public IStore<X509Crl> GetCrls()
		{
			PopulateCertCrlSets();

			return Helper.GetCrls(_crlSet);
		}

		private void PopulateCertCrlSets()
		{
			if (_isCertCrlParsed)
				return;

			_isCertCrlParsed = true;

			try
			{
				// care! Streaming - Must process the GetCertificates() result before calling GetCrls()
				_certSet = GetAsn1Set(_signedData.GetCertificates());
				_crlSet = GetAsn1Set(_signedData.GetCrls());
			}
			catch (IOException e)
			{
				throw new CmsException("problem parsing cert/crl sets", e);
			}
		}

		/// <summary>
		/// Return the <c>DerObjectIdentifier</c> associated with the encapsulated
		/// content info structure carried in the signed data.
		/// </summary>
		public DerObjectIdentifier SignedContentType
		{
			get { return _signedContentType; }
		}

		public CmsTypedStream GetSignedContent()
		{
			if (_signedContent == null)
			{
				return null;
			}

			Stream digStream = _signedContent.ContentStream;

			foreach (var digest in m_digests.Values)
			{
				digStream = new DigestStream(digStream, digest, null);
			}

			return new CmsTypedStream(_signedContent.ContentType, digStream);
		}

		/**
		 * Replace the signerinformation store associated with the passed
		 * in message contained in the stream original with the new one passed in.
		 * You would probably only want to do this if you wanted to change the unsigned
		 * attributes associated with a signer, or perhaps delete one.
		 * <p>
		 * The output stream is returned unclosed.
		 * </p>
		 * @param original the signed data stream to be used as a base.
		 * @param signerInformationStore the new signer information store to use.
		 * @param out the stream to Write the new signed data object to.
		 * @return out.
		 */
		public static Stream ReplaceSigners(
			Stream					original,
			SignerInformationStore	signerInformationStore,
			Stream					outStr)
		{
			// NB: SecureRandom would be ignored since using existing signatures only
			CmsSignedDataStreamGenerator gen = new CmsSignedDataStreamGenerator();
			CmsSignedDataParser parser = new CmsSignedDataParser(original);

//			gen.AddDigests(parser.DigestOids);
			gen.AddSigners(signerInformationStore);

			CmsTypedStream signedContent = parser.GetSignedContent();
			bool encapsulate = (signedContent != null);
			Stream contentOut = gen.Open(outStr, parser.SignedContentType.Id, encapsulate);
			if (encapsulate)
			{
				Streams.PipeAll(signedContent.ContentStream, contentOut);
			}

			gen.AddAttributeCertificates(parser.GetAttributeCertificates());
			gen.AddCertificates(parser.GetCertificates());
			gen.AddCrls(parser.GetCrls());

//			gen.AddSigners(parser.GetSignerInfos());

            Platform.Dispose(contentOut);

			return outStr;
		}

		/**
		 * Replace the certificate and CRL information associated with this
		 * CMSSignedData object with the new one passed in.
		 * <p>
		 * The output stream is returned unclosed.
		 * </p>
		 * @param original the signed data stream to be used as a base.
		 * @param certsAndCrls the new certificates and CRLs to be used.
		 * @param out the stream to Write the new signed data object to.
		 * @return out.
		 * @exception CmsException if there is an error processing the CertStore
		 */
		public static Stream ReplaceCertificatesAndCrls(Stream original, IStore<X509Certificate> x509Certs,
			IStore<X509Crl> x509Crls, IStore<X509V2AttributeCertificate> x509AttrCerts, Stream outStr)
		{
			// NB: SecureRandom would be ignored since using existing signatures only
			CmsSignedDataStreamGenerator gen = new CmsSignedDataStreamGenerator();
			CmsSignedDataParser parser = new CmsSignedDataParser(original);

			gen.AddDigests(parser.DigestOids);

			CmsTypedStream signedContent = parser.GetSignedContent();
			bool encapsulate = (signedContent != null);
			Stream contentOut = gen.Open(outStr, parser.SignedContentType.Id, encapsulate);
			if (encapsulate)
			{
				Streams.PipeAll(signedContent.ContentStream, contentOut);
			}

			if (x509AttrCerts != null)
            {
				gen.AddAttributeCertificates(x509AttrCerts);
			}
			if (x509Certs != null)
            {
				gen.AddCertificates(x509Certs);
			}
			if (x509Crls != null)
            {
				gen.AddCrls(x509Crls);
			}

			gen.AddSigners(parser.GetSignerInfos());

            Platform.Dispose(contentOut);

            return outStr;
		}

        private static Asn1Set GetAsn1Set(
			Asn1SetParser asn1SetParser)
		{
			return asn1SetParser == null
				?	null
				:	Asn1Set.GetInstance(asn1SetParser.ToAsn1Object());
		}
	}
}
