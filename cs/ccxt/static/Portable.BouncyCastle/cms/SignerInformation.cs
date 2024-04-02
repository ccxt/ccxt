using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Signers;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
	/**
	* an expanded SignerInfo block from a CMS Signed message
	*/
	public class SignerInformation
	{
		private static readonly CmsSignedHelper Helper = CmsSignedHelper.Instance;

		private SignerID			sid;

		private CmsProcessable		content;
		private byte[]				signature;
		private DerObjectIdentifier	contentType;
		private byte[]	calculatedDigest;
		private byte[]	resultDigest;

		// Derived
		private Asn1.Cms.AttributeTable	signedAttributeTable;
		private Asn1.Cms.AttributeTable	unsignedAttributeTable;
		private readonly bool isCounterSignature;

		protected SignerInfo info;
		protected AlgorithmIdentifier digestAlgorithm;
		protected AlgorithmIdentifier encryptionAlgorithm;
		protected readonly Asn1Set signedAttributeSet;
		protected readonly Asn1Set unsignedAttributeSet;

		internal SignerInformation(
			SignerInfo			info,
			DerObjectIdentifier	contentType,
			CmsProcessable		content,
			IDigestCalculator	digestCalculator)
		{
			this.info = info;
			this.sid = new SignerID();
			this.contentType = contentType;
			this.isCounterSignature = contentType == null;

			try
			{
				SignerIdentifier s = info.SignerID;

				if (s.IsTagged)
				{
					Asn1OctetString octs = Asn1OctetString.GetInstance(s.ID);

					sid.SubjectKeyIdentifier = octs.GetEncoded();
				}
				else
				{
					Asn1.Cms.IssuerAndSerialNumber iAnds =
						Asn1.Cms.IssuerAndSerialNumber.GetInstance(s.ID);

					sid.Issuer = iAnds.Name;
					sid.SerialNumber = iAnds.SerialNumber.Value;
				}
			}
			catch (IOException)
			{
				throw new ArgumentException("invalid sid in SignerInfo");
			}

			this.digestAlgorithm = info.DigestAlgorithm;
			this.signedAttributeSet = info.AuthenticatedAttributes;
			this.unsignedAttributeSet = info.UnauthenticatedAttributes;
			this.encryptionAlgorithm = info.DigestEncryptionAlgorithm;
			this.signature = (byte[])info.EncryptedDigest.GetOctets().Clone();

			this.content = content;
			this.calculatedDigest = (digestCalculator != null) ? digestCalculator.GetDigest() : null;
		}

        /**
         * Protected constructor. In some cases clients have their own idea about how to encode
         * the signed attributes and calculate the signature. This constructor is to allow developers
         * to deal with that by extending off the class and overriding e.g. SignedAttributes property.
         *
         * @param baseInfo the SignerInformation to base this one on.
         */
        protected SignerInformation(SignerInformation baseInfo)
        {
            this.info = baseInfo.info;
			this.content = baseInfo.content;
			this.contentType = baseInfo.contentType;
            this.isCounterSignature = baseInfo.IsCounterSignature;
			this.sid = baseInfo.sid;
			this.digestAlgorithm = info.DigestAlgorithm;
            this.signedAttributeSet = info.AuthenticatedAttributes;
            this.unsignedAttributeSet = info.UnauthenticatedAttributes;
            this.encryptionAlgorithm = info.DigestEncryptionAlgorithm;
			this.signature = (byte[])info.EncryptedDigest.GetOctets().Clone();
			
			this.calculatedDigest = baseInfo.calculatedDigest;
            this.signedAttributeTable = baseInfo.signedAttributeTable;
            this.unsignedAttributeTable = baseInfo.unsignedAttributeTable;
        }

		public bool IsCounterSignature
		{
			get { return isCounterSignature; }
		}

		public DerObjectIdentifier ContentType
		{
			get { return contentType; }
		}

		public SignerID SignerID
		{
			get { return sid; }
		}

		/**
		* return the version number for this objects underlying SignerInfo structure.
		*/
		public int Version
		{
			get { return info.Version.IntValueExact; }
		}

		public AlgorithmIdentifier DigestAlgorithmID
		{
			get { return digestAlgorithm; }
		}

		/**
		* return the object identifier for the signature.
		*/
		public string DigestAlgOid
		{
            get { return digestAlgorithm.Algorithm.Id; }
		}

		/**
		* return the signature parameters, or null if there aren't any.
		*/
		public Asn1Object DigestAlgParams
		{
			get
			{
				Asn1Encodable ae = digestAlgorithm.Parameters;

				return ae == null ? null : ae.ToAsn1Object();
			}
		}

		/**
		 * return the content digest that was calculated during verification.
		 */
		public byte[] GetContentDigest()
		{
			if (resultDigest == null)
			{
				throw new InvalidOperationException("method can only be called after verify.");
			}

			return (byte[])resultDigest.Clone();
		}

		public AlgorithmIdentifier EncryptionAlgorithmID
		{
			get { return encryptionAlgorithm; }
		}

		/**
		* return the object identifier for the signature.
		*/
		public string EncryptionAlgOid
		{
            get { return encryptionAlgorithm.Algorithm.Id; }
		}

		/**
		* return the signature/encryption algorithm parameters, or null if
		* there aren't any.
		*/
		public Asn1Object EncryptionAlgParams
		{
			get
			{
				Asn1Encodable ae = encryptionAlgorithm.Parameters;

				return ae == null ? null : ae.ToAsn1Object();
			}
		}

		/**
		* return a table of the signed attributes - indexed by
		* the OID of the attribute.
		*/
		public Asn1.Cms.AttributeTable SignedAttributes
		{
			get
			{
				if (signedAttributeSet != null && signedAttributeTable == null)
				{
					signedAttributeTable = new Asn1.Cms.AttributeTable(signedAttributeSet);
				}
				return signedAttributeTable;
			}
		}

		/**
		* return a table of the unsigned attributes indexed by
		* the OID of the attribute.
		*/
		public Asn1.Cms.AttributeTable UnsignedAttributes
		{
			get
			{
				if (unsignedAttributeSet != null && unsignedAttributeTable == null)
				{
					unsignedAttributeTable = new Asn1.Cms.AttributeTable(unsignedAttributeSet);
				}
				return unsignedAttributeTable;
			}
		}

		/**
		* return the encoded signature
		*/
		public byte[] GetSignature()
		{
			return (byte[]) signature.Clone();
		}

		/**
		* Return a SignerInformationStore containing the counter signatures attached to this
		* signer. If no counter signatures are present an empty store is returned.
		*/
		public SignerInformationStore GetCounterSignatures()
		{
			// TODO There are several checks implied by the RFC3852 comments that are missing

			/*
			The countersignature attribute MUST be an unsigned attribute; it MUST
			NOT be a signed attribute, an authenticated attribute, an
			unauthenticated attribute, or an unprotected attribute.
			*/
			Asn1.Cms.AttributeTable unsignedAttributeTable = UnsignedAttributes;
			if (unsignedAttributeTable == null)
			{
                return new SignerInformationStore(new List<SignerInformation>(0));
			}

            var counterSignatures = new List<SignerInformation>();

			/*
			The UnsignedAttributes syntax is defined as a SET OF Attributes.  The
			UnsignedAttributes in a signerInfo may include multiple instances of
			the countersignature attribute.
			*/
			Asn1EncodableVector allCSAttrs = unsignedAttributeTable.GetAll(CmsAttributes.CounterSignature);

			foreach (Asn1.Cms.Attribute counterSignatureAttribute in allCSAttrs)
			{
				/*
				A countersignature attribute can have multiple attribute values.  The
				syntax is defined as a SET OF AttributeValue, and there MUST be one
				or more instances of AttributeValue present.
				*/
				Asn1Set values = counterSignatureAttribute.AttrValues;
				if (values.Count < 1)
				{
					// TODO Throw an appropriate exception?
				}

				foreach (Asn1Encodable asn1Obj in values)
				{
					/*
					Countersignature values have the same meaning as SignerInfo values
					for ordinary signatures, except that:

					   1. The signedAttributes field MUST NOT contain a content-type
					      attribute; there is no content type for countersignatures.

					   2. The signedAttributes field MUST contain a message-digest
					      attribute if it contains any other attributes.

					   3. The input to the message-digesting process is the contents
					      octets of the DER encoding of the signatureValue field of the
					      SignerInfo value with which the attribute is associated.
					*/
					SignerInfo si = SignerInfo.GetInstance(asn1Obj.ToAsn1Object());

                    string digestName = CmsSignedHelper.Instance.GetDigestAlgName(si.DigestAlgorithm.Algorithm.Id);

					counterSignatures.Add(new SignerInformation(si, null, null, new CounterSignatureDigestCalculator(digestName, GetSignature())));
				}
			}

			return new SignerInformationStore(counterSignatures);
		}

		/**
		* return the DER encoding of the signed attributes.
		* @throws IOException if an encoding error occurs.
		*/
		public virtual byte[] GetEncodedSignedAttributes()
		{
			return signedAttributeSet == null
				?	null
				:	signedAttributeSet.GetEncoded(Asn1Encodable.Der);
		}

		private bool DoVerify(
			AsymmetricKeyParameter	key)
		{
			DerObjectIdentifier sigAlgOid = this.encryptionAlgorithm.Algorithm;
			Asn1Encodable sigParams = this.encryptionAlgorithm.Parameters;
			string digestName = Helper.GetDigestAlgName(this.EncryptionAlgOid);

			if (digestName.Equals(sigAlgOid.Id))
			{
				digestName = Helper.GetDigestAlgName(this.DigestAlgOid);
			}
			
			IDigest digest = Helper.GetDigestInstance(digestName);
			ISigner sig;

			if (sigAlgOid.Equals(Asn1.Pkcs.PkcsObjectIdentifiers.IdRsassaPss))
			{
				// RFC 4056 2.2
				// When the id-RSASSA-PSS algorithm identifier is used for a signature,
				// the AlgorithmIdentifier parameters field MUST contain RSASSA-PSS-params.
				if (sigParams == null)
					throw new CmsException("RSASSA-PSS signature must specify algorithm parameters");

				try
				{
					// TODO Provide abstract configuration mechanism
					// (via alternate SignerUtilities.GetSigner method taking ASN.1 params)

					Asn1.Pkcs.RsassaPssParameters pss = Asn1.Pkcs.RsassaPssParameters.GetInstance(
						sigParams.ToAsn1Object());

                    if (!pss.HashAlgorithm.Algorithm.Equals(this.digestAlgorithm.Algorithm))
						throw new CmsException("RSASSA-PSS signature parameters specified incorrect hash algorithm");
                    if (!pss.MaskGenAlgorithm.Algorithm.Equals(Asn1.Pkcs.PkcsObjectIdentifiers.IdMgf1))
						throw new CmsException("RSASSA-PSS signature parameters specified unknown MGF");

                    IDigest pssDigest = DigestUtilities.GetDigest(pss.HashAlgorithm.Algorithm);
                    int saltLength = pss.SaltLength.IntValueExact;

                    // RFC 4055 3.1
                    // The value MUST be 1, which represents the trailer field with hexadecimal value 0xBC
                    if (!Asn1.Pkcs.RsassaPssParameters.DefaultTrailerField.Equals(pss.TrailerField))
						throw new CmsException("RSASSA-PSS signature parameters must have trailerField of 1");

					IAsymmetricBlockCipher rsa = new RsaBlindedEngine();

					if (signedAttributeSet == null && calculatedDigest != null)
					{
                        sig = PssSigner.CreateRawSigner(rsa, pssDigest, pssDigest, saltLength, PssSigner.TrailerImplicit);
                    }
                    else
					{
						sig = new PssSigner(rsa, pssDigest, saltLength);
					}
				}
				catch (Exception e)
				{
					throw new CmsException("failed to set RSASSA-PSS signature parameters", e);
				}
			}
			else
			{
				// TODO Probably too strong a check at the moment
				//				if (sigParams != null)
				//					throw new CmsException("unrecognised signature parameters provided");

				string signatureName = digestName + "with" + Helper.GetEncryptionAlgName(this.EncryptionAlgOid);

                sig = Helper.GetSignatureInstance(signatureName);

                //sig = Helper.GetSignatureInstance(this.EncryptionAlgOid);
                //sig = SignerUtilities.GetSigner(sigAlgOid);
			}

			try
			{
				if (calculatedDigest != null)
				{
					resultDigest = calculatedDigest;
				}
				else
				{
					if (content != null)
					{
						content.Write(new DigestSink(digest));
					}
					else if (signedAttributeSet == null)
					{
						// TODO Get rid of this exception and just treat content==null as empty not missing?
						throw new CmsException("data not encapsulated in signature - use detached constructor.");
					}

					resultDigest = DigestUtilities.DoFinal(digest);
				}
			}
			catch (IOException e)
			{
				throw new CmsException("can't process mime object to create signature.", e);
			}

			// RFC 3852 11.1 Check the content-type attribute is correct
			{
				Asn1Object validContentType = GetSingleValuedSignedAttribute(
					CmsAttributes.ContentType, "content-type");
				if (validContentType == null)
				{
					if (!isCounterSignature && signedAttributeSet != null)
						throw new CmsException("The content-type attribute type MUST be present whenever signed attributes are present in signed-data");
				}
				else
				{
					if (isCounterSignature)
						throw new CmsException("[For counter signatures,] the signedAttributes field MUST NOT contain a content-type attribute");

					if (!(validContentType is DerObjectIdentifier))
						throw new CmsException("content-type attribute value not of ASN.1 type 'OBJECT IDENTIFIER'");

					DerObjectIdentifier signedContentType = (DerObjectIdentifier)validContentType;

					if (!signedContentType.Equals(contentType))
						throw new CmsException("content-type attribute value does not match eContentType");
				}
			}

			// RFC 3852 11.2 Check the message-digest attribute is correct
			{
				Asn1Object validMessageDigest = GetSingleValuedSignedAttribute(
					CmsAttributes.MessageDigest, "message-digest");
				if (validMessageDigest == null)
				{
				    if (signedAttributeSet != null)
						throw new CmsException("the message-digest signed attribute type MUST be present when there are any signed attributes present");
				}
				else
				{
					if (!(validMessageDigest is Asn1OctetString))
					{
						throw new CmsException("message-digest attribute value not of ASN.1 type 'OCTET STRING'");
					}

					Asn1OctetString signedMessageDigest = (Asn1OctetString)validMessageDigest;

					if (!Arrays.AreEqual(resultDigest, signedMessageDigest.GetOctets()))
						throw new CmsException("message-digest attribute value does not match calculated value");
				}
			}

			// RFC 3852 11.4 Validate countersignature attribute(s)
			{
            	Asn1.Cms.AttributeTable signedAttrTable = this.SignedAttributes;
            	if (signedAttrTable != null
                	&& signedAttrTable.GetAll(CmsAttributes.CounterSignature).Count > 0)
            	{
                	throw new CmsException("A countersignature attribute MUST NOT be a signed attribute");
            	}

            	Asn1.Cms.AttributeTable unsignedAttrTable = this.UnsignedAttributes;
            	if (unsignedAttrTable != null)
            	{
					foreach (Asn1.Cms.Attribute csAttr in unsignedAttrTable.GetAll(CmsAttributes.CounterSignature))
	                {
                    	if (csAttr.AttrValues.Count < 1)
	                        throw new CmsException("A countersignature attribute MUST contain at least one AttributeValue");

						// Note: We don't recursively validate the countersignature value
    	            }
	            }
			}

			try
			{
				sig.Init(false, key);

				if (signedAttributeSet == null)
				{
					if (calculatedDigest != null)
					{
						if (sig is PssSigner)
						{
							sig.BlockUpdate(resultDigest, 0, resultDigest.Length);
						}
						else
						{
							// need to decrypt signature and check message bytes
							return VerifyDigest(resultDigest, key, this.GetSignature());
						}
					}
					else if (content != null)
					{
                        try
                        {
                            // TODO Use raw signature of the hash value instead
                            content.Write(new SignerSink(sig));
                        }
                        catch (SignatureException e)
                        {
                            throw new CmsStreamException("signature problem: " + e);
                        }
					}
				}
				else
				{
					byte[] tmp = this.GetEncodedSignedAttributes();
					sig.BlockUpdate(tmp, 0, tmp.Length);
				}

				return sig.VerifySignature(this.GetSignature());
			}
			catch (InvalidKeyException e)
			{
				throw new CmsException("key not appropriate to signature in message.", e);
			}
			catch (IOException e)
			{
				throw new CmsException("can't process mime object to create signature.", e);
			}
			catch (SignatureException e)
			{
				throw new CmsException("invalid signature format in message: " + e.Message, e);
			}
		}

		private bool IsNull(
			Asn1Encodable o)
		{
			return (o is Asn1Null) || (o == null);
		}

		private DigestInfo DerDecode(
			byte[] encoding)
		{
			if (encoding[0] != (int)(Asn1Tags.Constructed | Asn1Tags.Sequence))
			{
				throw new IOException("not a digest info object");
			}

			DigestInfo digInfo = DigestInfo.GetInstance(Asn1Object.FromByteArray(encoding));

			// length check to avoid Bleichenbacher vulnerability

			if (digInfo.GetEncoded().Length != encoding.Length)
			{
				throw new CmsException("malformed RSA signature");
			}

			return digInfo;
		}

		private bool VerifyDigest(
			byte[]					digest,
			AsymmetricKeyParameter	key,
			byte[]					signature)
		{
			string algorithm = Helper.GetEncryptionAlgName(this.EncryptionAlgOid);

			try
			{
				if (algorithm.Equals("RSA"))
				{
					IBufferedCipher c = CmsEnvelopedHelper.Instance.CreateAsymmetricCipher("RSA/ECB/PKCS1Padding");

					c.Init(false, key);

					byte[] decrypt = c.DoFinal(signature);

					DigestInfo digInfo = DerDecode(decrypt);

                    if (!digInfo.AlgorithmID.Algorithm.Equals(digestAlgorithm.Algorithm))
					{
						return false;
					}

					if (!IsNull(digInfo.AlgorithmID.Parameters))
					{
						return false;
					}

					byte[] sigHash = digInfo.GetDigest();

					return Arrays.ConstantTimeAreEqual(digest, sigHash);
				}
				else if (algorithm.Equals("DSA"))
				{
					ISigner sig = SignerUtilities.GetSigner("NONEwithDSA");

					sig.Init(false, key);

					sig.BlockUpdate(digest, 0, digest.Length);

					return sig.VerifySignature(signature);
				}
				else
				{
					throw new CmsException("algorithm: " + algorithm + " not supported in base signatures.");
				}
			}
			catch (SecurityUtilityException e)
			{
				throw e;
			}
			catch (GeneralSecurityException e)
			{
				throw new CmsException("Exception processing signature: " + e, e);
			}
			catch (IOException e)
			{
				throw new CmsException("Exception decoding signature: " + e, e);
			}
		}

		/**
		* verify that the given public key successfully handles and confirms the
		* signature associated with this signer.
		*/
		public bool Verify(
			AsymmetricKeyParameter pubKey)
		{
			if (pubKey.IsPrivate)
				throw new ArgumentException("Expected public key", "pubKey");

			// Optional, but still need to validate if present
			GetSigningTime();

			return DoVerify(pubKey);
		}

		/**
		* verify that the given certificate successfully handles and confirms
		* the signature associated with this signer and, if a signingTime
		* attribute is available, that the certificate was valid at the time the
		* signature was generated.
		*/
		public bool Verify(
			X509Certificate cert)
		{
			Asn1.Cms.Time signingTime = GetSigningTime();
			if (signingTime != null)
			{
				cert.CheckValidity(signingTime.Date);
			}

			return DoVerify(cert.GetPublicKey());
		}

		/**
		* Return the base ASN.1 CMS structure that this object contains.
		*
		* @return an object containing a CMS SignerInfo structure.
		*/
		public SignerInfo ToSignerInfo()
		{
			return info;
		}

		private Asn1Object GetSingleValuedSignedAttribute(
			DerObjectIdentifier attrOID, string printableName)
		{

			Asn1.Cms.AttributeTable unsignedAttrTable = this.UnsignedAttributes;
			if (unsignedAttrTable != null
				&& unsignedAttrTable.GetAll(attrOID).Count > 0)
			{
				throw new CmsException("The " + printableName
					+ " attribute MUST NOT be an unsigned attribute");
			}

			Asn1.Cms.AttributeTable signedAttrTable = this.SignedAttributes;
			if (signedAttrTable == null)
			{
				return null;
			}

			Asn1EncodableVector v = signedAttrTable.GetAll(attrOID);
			switch (v.Count)
			{
				case 0:
					return null;
				case 1:
					Asn1.Cms.Attribute t = (Asn1.Cms.Attribute) v[0];
					Asn1Set attrValues = t.AttrValues;

					if (attrValues.Count != 1)
						throw new CmsException("A " + printableName
							+ " attribute MUST have a single attribute value");

					return attrValues[0].ToAsn1Object();
				default:
					throw new CmsException("The SignedAttributes in a signerInfo MUST NOT include multiple instances of the "
						+ printableName + " attribute");
			}
		}

		private Asn1.Cms.Time GetSigningTime()
		{
			Asn1Object validSigningTime = GetSingleValuedSignedAttribute(
				CmsAttributes.SigningTime, "signing-time");

			if (validSigningTime == null)
				return null;

			try
			{
				return Asn1.Cms.Time.GetInstance(validSigningTime);
			}
			catch (ArgumentException)
			{
				throw new CmsException("signing-time attribute value not a valid 'Time' structure");
			}
		}

		/**
		* Return a signer information object with the passed in unsigned
		* attributes replacing the ones that are current associated with
		* the object passed in.
		*
		* @param signerInformation the signerInfo to be used as the basis.
		* @param unsignedAttributes the unsigned attributes to add.
		* @return a copy of the original SignerInformationObject with the changed attributes.
		*/
		public static SignerInformation ReplaceUnsignedAttributes(
			SignerInformation		signerInformation,
			Asn1.Cms.AttributeTable	unsignedAttributes)
		{
			SignerInfo sInfo = signerInformation.info;
			Asn1Set unsignedAttr = null;

			if (unsignedAttributes != null)
			{
				unsignedAttr = new DerSet(unsignedAttributes.ToAsn1EncodableVector());
			}

			return new SignerInformation(
				new SignerInfo(
					sInfo.SignerID,
					sInfo.DigestAlgorithm,
					sInfo.AuthenticatedAttributes,
					sInfo.DigestEncryptionAlgorithm,
					sInfo.EncryptedDigest,
					unsignedAttr),
				signerInformation.contentType,
				signerInformation.content,
				null);
		}

		/**
		 * Return a signer information object with passed in SignerInformationStore representing counter
		 * signatures attached as an unsigned attribute.
		 *
		 * @param signerInformation the signerInfo to be used as the basis.
		 * @param counterSigners signer info objects carrying counter signature.
		 * @return a copy of the original SignerInformationObject with the changed attributes.
		 */
		public static SignerInformation AddCounterSigners(
			SignerInformation		signerInformation,
			SignerInformationStore	counterSigners)
		{
			// TODO Perform checks from RFC 3852 11.4

			SignerInfo sInfo = signerInformation.info;
			Asn1.Cms.AttributeTable unsignedAttr = signerInformation.UnsignedAttributes;
			Asn1EncodableVector v;

			if (unsignedAttr != null)
			{
				v = unsignedAttr.ToAsn1EncodableVector();
			}
			else
			{
				v = new Asn1EncodableVector();
			}

			Asn1EncodableVector sigs = new Asn1EncodableVector();

			foreach (SignerInformation sigInf in counterSigners.GetSigners())
			{
				sigs.Add(sigInf.ToSignerInfo());
			}

			v.Add(new Asn1.Cms.Attribute(CmsAttributes.CounterSignature, new DerSet(sigs)));

			return new SignerInformation(
				new SignerInfo(
					sInfo.SignerID,
					sInfo.DigestAlgorithm,
					sInfo.AuthenticatedAttributes,
					sInfo.DigestEncryptionAlgorithm,
					sInfo.EncryptedDigest,
					new DerSet(v)),
				signerInformation.contentType,
				signerInformation.content,
				null);
		}
	}
}
