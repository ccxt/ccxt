using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    /**
    * General class for generating a pkcs7-signature message stream.
    * <p>
    * A simple example of usage.
    * </p>
    * <pre>
    *      IX509Store                   certs...
    *      CmsSignedDataStreamGenerator gen = new CmsSignedDataStreamGenerator();
    *
    *      gen.AddSigner(privateKey, cert, CmsSignedDataStreamGenerator.DIGEST_SHA1);
    *
    *      gen.AddCertificates(certs);
    *
    *      Stream sigOut = gen.Open(bOut);
    *
    *      sigOut.Write(Encoding.UTF8.GetBytes("Hello World!"));
    *
    *      sigOut.Close();
    * </pre>
    */
    public class CmsSignedDataStreamGenerator
        : CmsSignedGenerator
    {
		private static readonly CmsSignedHelper Helper = CmsSignedHelper.Instance;

		private readonly IList<DigestAndSignerInfoGeneratorHolder> _signerInfs =
			new List<DigestAndSignerInfoGeneratorHolder>();
		private readonly HashSet<string> _messageDigestOids = new HashSet<string>();
		private readonly IDictionary<string, IDigest> m_messageDigests =
			new Dictionary<string, IDigest>(StringComparer.OrdinalIgnoreCase);
		private readonly IDictionary<string, byte[]> m_messageHashes =
			new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase);
		private bool _messageDigestsLocked;
        private int _bufferSize;

		private class DigestAndSignerInfoGeneratorHolder
		{
			internal readonly ISignerInfoGenerator	signerInf;
			internal readonly string				digestOID;

			internal DigestAndSignerInfoGeneratorHolder(ISignerInfoGenerator signerInf, string digestOID)
			{
				this.signerInf = signerInf;
				this.digestOID = digestOID;
			}

			internal AlgorithmIdentifier DigestAlgorithm
			{
				get { return new AlgorithmIdentifier(new DerObjectIdentifier(this.digestOID), DerNull.Instance); }
			}
		}

		private class SignerInfoGeneratorImpl : ISignerInfoGenerator
        {
			private readonly CmsSignedDataStreamGenerator outer;

			private readonly SignerIdentifier			_signerIdentifier;
			private readonly string						_digestOID;
			private readonly string						_encOID;
			private readonly CmsAttributeTableGenerator	_sAttr;
			private readonly CmsAttributeTableGenerator	_unsAttr;
			private readonly string						_encName;
			private readonly ISigner					_sig;

			internal SignerInfoGeneratorImpl(
				CmsSignedDataStreamGenerator	outer,
				AsymmetricKeyParameter			key,
				SignerIdentifier				signerIdentifier,
				string							digestOID,
				string							encOID,
				CmsAttributeTableGenerator		sAttr,
				CmsAttributeTableGenerator		unsAttr)
			{
				this.outer = outer;

				_signerIdentifier = signerIdentifier;
				_digestOID = digestOID;
				_encOID = encOID;
				_sAttr = sAttr;
				_unsAttr = unsAttr;
				_encName = Helper.GetEncryptionAlgName(_encOID);

				string digestName = Helper.GetDigestAlgName(_digestOID);
				string signatureName = digestName + "with" + _encName;

				if (_sAttr != null)
				{
            		_sig = Helper.GetSignatureInstance(signatureName);
				}
				else
				{
					// Note: Need to use raw signatures here since we have already calculated the digest
					if (_encName.Equals("RSA"))
					{
						_sig = Helper.GetSignatureInstance("RSA");
					}
					else if (_encName.Equals("DSA"))
					{
						_sig = Helper.GetSignatureInstance("NONEwithDSA");
					}
					// TODO Add support for raw PSS
//					else if (_encName.equals("RSAandMGF1"))
//					{
//						_sig = CMSSignedHelper.INSTANCE.getSignatureInstance("NONEWITHRSAPSS", _sigProvider);
//						try
//						{
//							// Init the params this way to avoid having a 'raw' version of each PSS algorithm
//							Signature sig2 = CMSSignedHelper.INSTANCE.getSignatureInstance(signatureName, _sigProvider);
//							PSSParameterSpec spec = (PSSParameterSpec)sig2.getParameters().getParameterSpec(PSSParameterSpec.class);
//							_sig.setParameter(spec);
//						}
//						catch (Exception e)
//						{
//							throw new SignatureException("algorithm: " + _encName + " could not be configured.");
//						}
//					}
					else
					{
						throw new SignatureException("algorithm: " + _encName + " not supported in base signatures.");
					}
				}

				_sig.Init(true, new ParametersWithRandom(key, outer.rand));
			}

			public SignerInfo Generate(DerObjectIdentifier contentType, AlgorithmIdentifier digestAlgorithm,
        		byte[] calculatedDigest)
			{
				try
				{
					string digestName = Helper.GetDigestAlgName(_digestOID);
					string signatureName = digestName + "with" + _encName;

//					AlgorithmIdentifier digAlgId = DigestAlgorithmID;
//
//					byte[] hash = (byte[])outer._messageHashes[Helper.GetDigestAlgName(this._digestOID)];
//					outer._digests[_digestOID] = hash.Clone();

					byte[] bytesToSign = calculatedDigest;

					/* RFC 3852 5.4
					 * The result of the message digest calculation process depends on
					 * whether the signedAttrs field is present.  When the field is absent,
					 * the result is just the message digest of the content as described
					 *
					 * above.  When the field is present, however, the result is the message
					 * digest of the complete DER encoding of the SignedAttrs value
					 * contained in the signedAttrs field.
					 */
					Asn1Set signedAttr = null;
					if (_sAttr != null)
					{
						var parameters = outer.GetBaseParameters(contentType, digestAlgorithm, calculatedDigest);

//						Asn1.Cms.AttributeTable signed = _sAttr.GetAttributes(Collections.unmodifiableMap(parameters));
						Asn1.Cms.AttributeTable signed = _sAttr.GetAttributes(parameters);

                        if (contentType == null) //counter signature
                        {
                            if (signed != null && signed[CmsAttributes.ContentType] != null)
                            {
								signed = signed.Remove(CmsAttributes.ContentType);
                            }
                        }

                        signedAttr = outer.GetAttributeSet(signed);

                		// sig must be composed from the DER encoding.
						bytesToSign = signedAttr.GetEncoded(Asn1Encodable.Der);
					}
					else
					{
						// Note: Need to use raw signatures here since we have already calculated the digest
						if (_encName.Equals("RSA"))
						{
							DigestInfo dInfo = new DigestInfo(digestAlgorithm, calculatedDigest);
							bytesToSign = dInfo.GetEncoded(Asn1Encodable.Der);
						}
					}

					_sig.BlockUpdate(bytesToSign, 0, bytesToSign.Length);
					byte[] sigBytes = _sig.GenerateSignature();

					Asn1Set unsignedAttr = null;
					if (_unsAttr != null)
					{
						var parameters = outer.GetBaseParameters(contentType, digestAlgorithm, calculatedDigest);
						parameters[CmsAttributeTableParameter.Signature] = sigBytes.Clone();

//						Asn1.Cms.AttributeTable unsigned = _unsAttr.getAttributes(Collections.unmodifiableMap(parameters));
						Asn1.Cms.AttributeTable unsigned = _unsAttr.GetAttributes(parameters);

						unsignedAttr = outer.GetAttributeSet(unsigned);
					}

					// TODO[RSAPSS] Need the ability to specify non-default parameters
					Asn1Encodable sigX509Parameters = SignerUtilities.GetDefaultX509Parameters(signatureName);
					AlgorithmIdentifier digestEncryptionAlgorithm = Helper.GetEncAlgorithmIdentifier(
						new DerObjectIdentifier(_encOID), sigX509Parameters);

					return new SignerInfo(_signerIdentifier, digestAlgorithm,
						signedAttr, digestEncryptionAlgorithm, new DerOctetString(sigBytes), unsignedAttr);
				}
	            catch (IOException e)
	            {
	                throw new CmsStreamException("encoding error.", e);
	            }
	            catch (SignatureException e)
	            {
	                throw new CmsStreamException("error creating signature.", e);
	            }
            }
        }

		public CmsSignedDataStreamGenerator()
        {
        }

		/// <summary>Constructor allowing specific source of randomness</summary>
		/// <param name="rand">Instance of <c>SecureRandom</c> to use.</param>
		public CmsSignedDataStreamGenerator(
			SecureRandom rand)
			: base(rand)
		{
		}

		/**
        * Set the underlying string size for encapsulated data
        *
        * @param bufferSize length of octet strings to buffer the data.
        */
        public void SetBufferSize(int bufferSize)
        {
            _bufferSize = bufferSize;
        }

		public void AddDigests(params string[] digestOids)
		{
			foreach (string digestOid in digestOids)
			{
				ConfigureDigest(digestOid);
			}
		}

		public void AddDigests(IEnumerable<string> digestOids)
		{
			foreach (string digestOid in digestOids)
			{
				ConfigureDigest(digestOid);
			}
		}

		/**
        * add a signer - no attributes other than the default ones will be
        * provided here.
        * @throws NoSuchAlgorithmException
        * @throws InvalidKeyException
        */
        public void AddSigner(
            AsymmetricKeyParameter	privateKey,
            X509Certificate			cert,
            string					digestOid)
        {
			AddSigner(privateKey, cert, digestOid,
				new DefaultSignedAttributeTableGenerator(), null);
		}

		/**
		 * add a signer, specifying the digest encryption algorithm - no attributes other than the default ones will be
		 * provided here.
		 * @throws NoSuchProviderException
		 * @throws NoSuchAlgorithmException
		 * @throws InvalidKeyException
		 */
		public void AddSigner(
			AsymmetricKeyParameter	privateKey,
			X509Certificate			cert,
			string					encryptionOid,
			string					digestOid)
		{
			AddSigner(privateKey, cert, encryptionOid, digestOid,
				new DefaultSignedAttributeTableGenerator(),
				(CmsAttributeTableGenerator)null);
		}

        /**
        * add a signer with extra signed/unsigned attributes.
        * @throws NoSuchAlgorithmException
        * @throws InvalidKeyException
        */
        public void AddSigner(
            AsymmetricKeyParameter	privateKey,
            X509Certificate			cert,
            string					digestOid,
            Asn1.Cms.AttributeTable	signedAttr,
            Asn1.Cms.AttributeTable	unsignedAttr)
        {
			AddSigner(privateKey, cert, digestOid,
				new DefaultSignedAttributeTableGenerator(signedAttr),
				new SimpleAttributeTableGenerator(unsignedAttr));
		}

		/**
		 * add a signer with extra signed/unsigned attributes - specifying digest
		 * encryption algorithm.
		 * @throws NoSuchProviderException
		 * @throws NoSuchAlgorithmException
		 * @throws InvalidKeyException
		 */
		public void AddSigner(
			AsymmetricKeyParameter	privateKey,
			X509Certificate			cert,
			string					encryptionOid,
			string					digestOid,
			Asn1.Cms.AttributeTable	signedAttr,
			Asn1.Cms.AttributeTable	unsignedAttr)
		{
			AddSigner(privateKey, cert, encryptionOid, digestOid,
				new DefaultSignedAttributeTableGenerator(signedAttr),
				new SimpleAttributeTableGenerator(unsignedAttr));
		}

		public void AddSigner(
			AsymmetricKeyParameter		privateKey,
			X509Certificate				cert,
			string						digestOid,
			CmsAttributeTableGenerator  signedAttrGenerator,
			CmsAttributeTableGenerator  unsignedAttrGenerator)
		{
			AddSigner(privateKey, cert, Helper.GetEncOid(privateKey, digestOid), digestOid,
				signedAttrGenerator, unsignedAttrGenerator);
        }

		public void AddSigner(
			AsymmetricKeyParameter		privateKey,
			X509Certificate				cert,
			string						encryptionOid,
			string						digestOid,
			CmsAttributeTableGenerator  signedAttrGenerator,
			CmsAttributeTableGenerator  unsignedAttrGenerator)
		{
			DoAddSigner(privateKey, GetSignerIdentifier(cert), encryptionOid, digestOid,
				signedAttrGenerator, unsignedAttrGenerator);
		}

		/**
		* add a signer - no attributes other than the default ones will be
		* provided here.
		* @throws NoSuchAlgorithmException
		* @throws InvalidKeyException
		*/
		public void AddSigner(
			AsymmetricKeyParameter	privateKey,
			byte[]					subjectKeyID,
			string					digestOid)
		{
			AddSigner(privateKey, subjectKeyID, digestOid, new DefaultSignedAttributeTableGenerator(),
				(CmsAttributeTableGenerator)null);
		}

		/**
		 * add a signer - no attributes other than the default ones will be
		 * provided here.
		 * @throws NoSuchProviderException
		 * @throws NoSuchAlgorithmException
		 * @throws InvalidKeyException
		 */
		public void AddSigner(
			AsymmetricKeyParameter	privateKey,
			byte[]					subjectKeyID,
			string					encryptionOid,
			string					digestOid)
		{
			AddSigner(privateKey, subjectKeyID, encryptionOid, digestOid,
				new DefaultSignedAttributeTableGenerator(),
				(CmsAttributeTableGenerator)null);
		}

		/**
		* add a signer with extra signed/unsigned attributes.
		* @throws NoSuchAlgorithmException
		* @throws InvalidKeyException
		*/
		public void AddSigner(
			AsymmetricKeyParameter	privateKey,
			byte[]					subjectKeyID,
			string					digestOid,
			Asn1.Cms.AttributeTable	signedAttr,
			Asn1.Cms.AttributeTable	unsignedAttr)
	    {
	        AddSigner(privateKey, subjectKeyID, digestOid,
				new DefaultSignedAttributeTableGenerator(signedAttr),
				new SimpleAttributeTableGenerator(unsignedAttr));
		}

		public void AddSigner(
			AsymmetricKeyParameter		privateKey,
			byte[]						subjectKeyID,
			string						digestOid,
			CmsAttributeTableGenerator	signedAttrGenerator,
			CmsAttributeTableGenerator	unsignedAttrGenerator)
		{
			AddSigner(privateKey, subjectKeyID, Helper.GetEncOid(privateKey, digestOid),
				digestOid, signedAttrGenerator, unsignedAttrGenerator);
		}

		public void AddSigner(
			AsymmetricKeyParameter		privateKey,
			byte[]						subjectKeyID,
			string						encryptionOid,
			string						digestOid,
			CmsAttributeTableGenerator	signedAttrGenerator,
			CmsAttributeTableGenerator	unsignedAttrGenerator)
		{
			DoAddSigner(privateKey, GetSignerIdentifier(subjectKeyID), encryptionOid, digestOid,
				signedAttrGenerator, unsignedAttrGenerator);
		}

		private void DoAddSigner(
			AsymmetricKeyParameter		privateKey,
			SignerIdentifier			signerIdentifier,
			string						encryptionOid,
			string						digestOid,
			CmsAttributeTableGenerator	signedAttrGenerator,
			CmsAttributeTableGenerator	unsignedAttrGenerator)
		{
			ConfigureDigest(digestOid);

			SignerInfoGeneratorImpl signerInf = new SignerInfoGeneratorImpl(this, privateKey,
				signerIdentifier, digestOid, encryptionOid, signedAttrGenerator, unsignedAttrGenerator);

			_signerInfs.Add(new DigestAndSignerInfoGeneratorHolder(signerInf, digestOid));
		}

		internal override void AddSignerCallback(
			SignerInformation si)
		{
			// FIXME If there were parameters in si.DigestAlgorithmID.Parameters, they are lost
			// NB: Would need to call FixAlgID on the DigestAlgorithmID

			// For precalculated signers, just need to register the algorithm, not configure a digest
            RegisterDigestOid(si.DigestAlgorithmID.Algorithm.Id);
		}

		/**
        * generate a signed object that for a CMS Signed Data object
        */
        public Stream Open(
            Stream outStream)
        {
            return Open(outStream, false);
        }

        /**
        * generate a signed object that for a CMS Signed Data
        * object - if encapsulate is true a copy
        * of the message will be included in the signature with the
        * default content type "data".
        */
        public Stream Open(
            Stream	outStream,
            bool	encapsulate)
        {
            return Open(outStream, Data, encapsulate);
        }

		/**
		 * generate a signed object that for a CMS Signed Data
		 * object using the given provider - if encapsulate is true a copy
		 * of the message will be included in the signature with the
		 * default content type "data". If dataOutputStream is non null the data
		 * being signed will be written to the stream as it is processed.
		 * @param out stream the CMS object is to be written to.
		 * @param encapsulate true if data should be encapsulated.
		 * @param dataOutputStream output stream to copy the data being signed to.
		 */
		public Stream Open(
			Stream	outStream,
			bool	encapsulate,
			Stream	dataOutputStream)
		{
			return Open(outStream, Data, encapsulate, dataOutputStream);
		}

		/**
        * generate a signed object that for a CMS Signed Data
        * object - if encapsulate is true a copy
        * of the message will be included in the signature. The content type
        * is set according to the OID represented by the string signedContentType.
        */
        public Stream Open(
            Stream	outStream,
            string	signedContentType,
            bool	encapsulate)
        {
			return Open(outStream, signedContentType, encapsulate, null);
		}

		/**
		* generate a signed object that for a CMS Signed Data
		* object using the given provider - if encapsulate is true a copy
		* of the message will be included in the signature. The content type
		* is set according to the OID represented by the string signedContentType.
		* @param out stream the CMS object is to be written to.
		* @param signedContentType OID for data to be signed.
		* @param encapsulate true if data should be encapsulated.
		* @param dataOutputStream output stream to copy the data being signed to.
		*/
		public Stream Open(
			Stream	outStream,
			string	signedContentType,
			bool	encapsulate,
			Stream	dataOutputStream)
		{
			if (outStream == null)
				throw new ArgumentNullException("outStream");
			if (!outStream.CanWrite)
				throw new ArgumentException("Expected writeable stream", "outStream");
			if (dataOutputStream != null && !dataOutputStream.CanWrite)
				throw new ArgumentException("Expected writeable stream", "dataOutputStream");

			_messageDigestsLocked = true;

			//
            // ContentInfo
            //
            BerSequenceGenerator sGen = new BerSequenceGenerator(outStream);

			sGen.AddObject(CmsObjectIdentifiers.SignedData);

			//
            // Signed Data
            //
            BerSequenceGenerator sigGen = new BerSequenceGenerator(
				sGen.GetRawOutputStream(), 0, true);

            bool isCounterSignature = (signedContentType == null);

            DerObjectIdentifier contentTypeOid = isCounterSignature
                ? null
                : new DerObjectIdentifier(signedContentType);

            sigGen.AddObject(CalculateVersion(contentTypeOid));

			Asn1EncodableVector digestAlgs = new Asn1EncodableVector();

			foreach (string digestOid in _messageDigestOids)
            {
				digestAlgs.Add(new AlgorithmIdentifier(new DerObjectIdentifier(digestOid), DerNull.Instance));
            }

            new DerSet(digestAlgs).EncodeTo(sigGen.GetRawOutputStream());

			BerSequenceGenerator eiGen = new BerSequenceGenerator(sigGen.GetRawOutputStream());
            eiGen.AddObject(contentTypeOid);

        	// If encapsulating, add the data as an octet string in the sequence
			Stream encapStream = encapsulate
				?	CmsUtilities.CreateBerOctetOutputStream(eiGen.GetRawOutputStream(), 0, true, _bufferSize)
				:	null;

        	// Also send the data to 'dataOutputStream' if necessary
			Stream teeStream = GetSafeTeeOutputStream(dataOutputStream, encapStream);

        	// Let all the digests see the data as it is written
			Stream digStream = AttachDigestsToOutputStream(m_messageDigests.Values, teeStream);

			return new CmsSignedDataOutputStream(this, digStream, signedContentType, sGen, sigGen, eiGen);
        }

		private void RegisterDigestOid(
			string digestOid)
		{
       		if (_messageDigestsLocked)
       		{
       			if (!_messageDigestOids.Contains(digestOid))
					throw new InvalidOperationException("Cannot register new digest OIDs after the data stream is opened");
       		}
       		else
       		{
				_messageDigestOids.Add(digestOid);
       		}
		}

		private void ConfigureDigest(string digestOid)
		{
       		RegisterDigestOid(digestOid);

       		string digestName = Helper.GetDigestAlgName(digestOid);

			if (!m_messageDigests.ContainsKey(digestName))
			{
				if (_messageDigestsLocked)
					throw new InvalidOperationException("Cannot configure new digests after the data stream is opened");

            	m_messageDigests[digestName] = Helper.GetDigestInstance(digestName);
            }
		}

		// TODO Make public?
		internal void Generate(
			Stream			outStream,
			string			eContentType,
			bool			encapsulate,
			Stream			dataOutputStream,
			CmsProcessable	content)
		{
			Stream signedOut = Open(outStream, eContentType, encapsulate, dataOutputStream);
			if (content != null)
			{
				content.Write(signedOut);
			}
            Platform.Dispose(signedOut);
		}

		// RFC3852, section 5.1:
		// IF ((certificates is present) AND
		//    (any certificates with a type of other are present)) OR
		//    ((crls is present) AND
		//    (any crls with a type of other are present))
		// THEN version MUST be 5
		// ELSE
		//    IF (certificates is present) AND
		//       (any version 2 attribute certificates are present)
		//    THEN version MUST be 4
		//    ELSE
		//       IF ((certificates is present) AND
		//          (any version 1 attribute certificates are present)) OR
		//          (any SignerInfo structures are version 3) OR
		//          (encapContentInfo eContentType is other than id-data)
		//       THEN version MUST be 3
		//       ELSE version MUST be 1
		//
		private DerInteger CalculateVersion(
			DerObjectIdentifier contentOid)
		{
			bool otherCert = false;
			bool otherCrl = false;
			bool attrCertV1Found = false;
			bool attrCertV2Found = false;

			if (_certs != null)
			{
				foreach (object obj in _certs)
				{
					if (obj is Asn1TaggedObject)
					{
						Asn1TaggedObject tagged = (Asn1TaggedObject) obj;

						if (tagged.TagNo == 1)
						{
							attrCertV1Found = true;
						}
						else if (tagged.TagNo == 2)
						{
							attrCertV2Found = true;
						}
						else if (tagged.TagNo == 3)
						{
							otherCert = true;
							break;
						}
					}
				}
			}

			if (otherCert)
			{
				return new DerInteger(5);
			}

			if (_crls != null)
			{
				foreach (object obj in _crls)
				{
					if (obj is Asn1TaggedObject)
					{
						otherCrl = true;
						break;
					}
				}
			}

			if (otherCrl)
			{
				return new DerInteger(5);
			}

			if (attrCertV2Found)
			{
				return new DerInteger(4);
			}

            if (attrCertV1Found || !CmsObjectIdentifiers.Data.Equals(contentOid) || CheckForVersion3(_signers))
            {
                return new DerInteger(3);
            }

            return new DerInteger(1);
        }

		private bool CheckForVersion3(IList<SignerInformation> signerInfos)
		{
			foreach (SignerInformation si in signerInfos)
			{
				SignerInfo s = SignerInfo.GetInstance(si.ToSignerInfo());

				if (s.Version.IntValueExact == 3)
					return true;
			}

			return false;
		}

		private static Stream AttachDigestsToOutputStream(IEnumerable<IDigest> digests, Stream s)
		{
			Stream result = s;
			foreach (IDigest digest in digests)
			{
				result = GetSafeTeeOutputStream(result, new DigestSink(digest));
			}
			return result;
		}

		private static Stream GetSafeOutputStream(Stream s)
		{
			return s ?? Stream.Null;
		}

		private static Stream GetSafeTeeOutputStream(Stream s1, Stream s2)
		{
			if (s1 == null)
				return GetSafeOutputStream(s2);
			if (s2 == null)
				return GetSafeOutputStream(s1);
			return new TeeOutputStream(s1, s2);
		}

		private class CmsSignedDataOutputStream
            : BaseOutputStream
        {
			private readonly CmsSignedDataStreamGenerator outer;

			private Stream					_out;
            private DerObjectIdentifier		_contentOID;
            private BerSequenceGenerator	_sGen;
            private BerSequenceGenerator	_sigGen;
            private BerSequenceGenerator	_eiGen;

			public CmsSignedDataOutputStream(
				CmsSignedDataStreamGenerator	outer,
				Stream							outStream,
                string							contentOID,
                BerSequenceGenerator			sGen,
                BerSequenceGenerator			sigGen,
                BerSequenceGenerator			eiGen)
            {
				this.outer = outer;

				_out = outStream;
                _contentOID = new DerObjectIdentifier(contentOID);
                _sGen = sGen;
                _sigGen = sigGen;
                _eiGen = eiGen;
            }

			public override void Write(byte[] buffer, int offset, int count)
			{
				_out.Write(buffer, offset, count);
			}

			public override void WriteByte(byte value)
			{
				_out.WriteByte(value);
			}

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    DoClose();
                }
                base.Dispose(disposing);
            }

            private void DoClose()
            {
                Platform.Dispose(_out);

                // TODO Parent context(s) should really be be closed explicitly

                _eiGen.Close();

                outer.m_digests.Clear();    // clear the current preserved digest state

				if (outer._certs.Count > 0)
				{
					Asn1Set certs = outer.UseDerForCerts
                        ?   CmsUtilities.CreateDerSetFromList(outer._certs)
                        :   CmsUtilities.CreateBerSetFromList(outer._certs);

                    WriteToGenerator(_sigGen, new BerTaggedObject(false, 0, certs));
                }

				if (outer._crls.Count > 0)
				{
                    Asn1Set crls = outer.UseDerForCrls
                        ?   CmsUtilities.CreateDerSetFromList(outer._crls)
                        :   CmsUtilities.CreateBerSetFromList(outer._crls);

                    WriteToGenerator(_sigGen, new BerTaggedObject(false, 1, crls));
                }

                //
                // Calculate the digest hashes
                //
                foreach (var de in outer.m_messageDigests)
                {
                    outer.m_messageHashes.Add(de.Key, DigestUtilities.DoFinal(de.Value));
                }

                // TODO If the digest OIDs for precalculated signers weren't mixed in with
                // the others, we could fill in outer._digests here, instead of SignerInfoGenerator.Generate

                //
                // collect all the SignerInfo objects
                //
                Asn1EncodableVector signerInfos = new Asn1EncodableVector();

                //
                // add the generated SignerInfo objects
                //
                {
                    foreach (DigestAndSignerInfoGeneratorHolder holder in outer._signerInfs)
                    {
                        AlgorithmIdentifier digestAlgorithm = holder.DigestAlgorithm;

                        byte[] calculatedDigest = outer.m_messageHashes[
                            Helper.GetDigestAlgName(holder.digestOID)];
                        outer.m_digests[holder.digestOID] = (byte[])calculatedDigest.Clone();

                        signerInfos.Add(holder.signerInf.Generate(_contentOID, digestAlgorithm, calculatedDigest));
                    }
                }

                //
                // add the precalculated SignerInfo objects.
                //
                {
                    foreach (SignerInformation signer in outer._signers)
                    {
                        // TODO Verify the content type and calculated digest match the precalculated SignerInfo
//						if (!signer.ContentType.Equals(_contentOID))
//						{
//							// TODO The precalculated content type did not match - error?
//						}
//
//						byte[] calculatedDigest = (byte[])outer._digests[signer.DigestAlgOid];
//						if (calculatedDigest == null)
//						{
//							// TODO We can't confirm this digest because we didn't calculate it - error?
//						}
//						else
//						{
//							if (!Arrays.AreEqual(signer.GetContentDigest(), calculatedDigest))
//							{
//								// TODO The precalculated digest did not match - error?
//							}
//						}

                        signerInfos.Add(signer.ToSignerInfo());
                    }
                }

                WriteToGenerator(_sigGen, new DerSet(signerInfos));

				_sigGen.Close();
                _sGen.Close();
            }

			private static void WriteToGenerator(Asn1Generator ag, Asn1Encodable ae)
			{
				ae.EncodeTo(ag.GetRawOutputStream());
			}
		}
    }
}
