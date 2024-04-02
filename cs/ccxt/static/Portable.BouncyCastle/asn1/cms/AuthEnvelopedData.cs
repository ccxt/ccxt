using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
	public class AuthEnvelopedData
		: Asn1Encodable
	{
		private DerInteger				version;
		private OriginatorInfo			originatorInfo;
		private Asn1Set					recipientInfos;
		private EncryptedContentInfo	authEncryptedContentInfo;
		private Asn1Set					authAttrs;
		private Asn1OctetString			mac;
		private Asn1Set					unauthAttrs;

		public AuthEnvelopedData(
			OriginatorInfo			originatorInfo,
			Asn1Set					recipientInfos,
			EncryptedContentInfo	authEncryptedContentInfo,
			Asn1Set					authAttrs,
			Asn1OctetString			mac,
			Asn1Set					unauthAttrs)
		{
			// "It MUST be set to 0."
			this.version = new DerInteger(0);

			this.originatorInfo = originatorInfo;

			// "There MUST be at least one element in the collection."
			this.recipientInfos = recipientInfos;
			if (this.recipientInfos.Count < 1)
				throw new ArgumentException("AuthEnvelopedData requires at least 1 RecipientInfo");

			this.authEncryptedContentInfo = authEncryptedContentInfo;

			// "The authAttrs MUST be present if the content type carried in
			// EncryptedContentInfo is not id-data."
			this.authAttrs = authAttrs;
			if (!authEncryptedContentInfo.ContentType.Equals(CmsObjectIdentifiers.Data))
			{
				if (authAttrs == null || authAttrs.Count < 1)
					throw new ArgumentException("authAttrs must be present with non-data content");
			}

			this.mac = mac;

			this.unauthAttrs = unauthAttrs;
	    }

		private AuthEnvelopedData(
			Asn1Sequence	seq)
		{
			int index = 0;

			// "It MUST be set to 0."
			Asn1Object tmp = seq[index++].ToAsn1Object();
			version = DerInteger.GetInstance(tmp);
			if (!version.HasValue(0))
				throw new ArgumentException("AuthEnvelopedData version number must be 0");

			tmp = seq[index++].ToAsn1Object();
			if (tmp is Asn1TaggedObject)
			{
				originatorInfo = OriginatorInfo.GetInstance((Asn1TaggedObject)tmp, false);
				tmp = seq[index++].ToAsn1Object();
			}

			// "There MUST be at least one element in the collection."
			recipientInfos = Asn1Set.GetInstance(tmp);
			if (recipientInfos.Count < 1)
				throw new ArgumentException("AuthEnvelopedData requires at least 1 RecipientInfo");

			tmp = seq[index++].ToAsn1Object();
			authEncryptedContentInfo = EncryptedContentInfo.GetInstance(tmp);

			tmp = seq[index++].ToAsn1Object();
			if (tmp is Asn1TaggedObject)
			{
				authAttrs = Asn1Set.GetInstance((Asn1TaggedObject)tmp, false);
				tmp = seq[index++].ToAsn1Object();
			}
			else
			{
				// "The authAttrs MUST be present if the content type carried in
				// EncryptedContentInfo is not id-data."
				if (!authEncryptedContentInfo.ContentType.Equals(CmsObjectIdentifiers.Data))
				{
					if (authAttrs == null || authAttrs.Count < 1)
						throw new ArgumentException("authAttrs must be present with non-data content");
				}
			}

			mac = Asn1OctetString.GetInstance(tmp);

			if (seq.Count > index)
			{
				tmp = seq[index++].ToAsn1Object();
				unauthAttrs = Asn1Set.GetInstance((Asn1TaggedObject)tmp, false);
			}
		}

		/**
		 * return an AuthEnvelopedData object from a tagged object.
		 *
		 * @param obj      the tagged object holding the object we want.
		 * @param isExplicit true if the object is meant to be explicitly
		 *                 tagged false otherwise.
		 * @throws ArgumentException if the object held by the
		 *                                  tagged object cannot be converted.
		 */
		public static AuthEnvelopedData GetInstance(
			Asn1TaggedObject	obj,
			bool				isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}

		/**
		 * return an AuthEnvelopedData object from the given object.
		 *
		 * @param obj the object we want converted.
		 * @throws ArgumentException if the object cannot be converted.
		 */
		public static AuthEnvelopedData GetInstance(
			object	obj)
		{
			if (obj == null || obj is AuthEnvelopedData)
				return (AuthEnvelopedData)obj;

			if (obj is Asn1Sequence)
				return new AuthEnvelopedData((Asn1Sequence)obj);

            throw new ArgumentException("Invalid AuthEnvelopedData: " + Platform.GetTypeName(obj));
		}

		public DerInteger Version
		{
			get { return version; }
		}

		public OriginatorInfo OriginatorInfo
		{
			get { return originatorInfo; }
		}

		public Asn1Set RecipientInfos
		{
			get { return recipientInfos; }
		}

		public EncryptedContentInfo AuthEncryptedContentInfo
		{
			get { return authEncryptedContentInfo; }
		}

		public Asn1Set AuthAttrs
		{
			get { return authAttrs; }
		}

		public Asn1OctetString Mac
		{
			get { return mac; }
		}

		public Asn1Set UnauthAttrs
		{
			get { return unauthAttrs; }
		}

		/**
		 * Produce an object suitable for an Asn1OutputStream.
		 * <pre>
		 * AuthEnvelopedData ::= SEQUENCE {
		 *   version CMSVersion,
		 *   originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
		 *   recipientInfos RecipientInfos,
		 *   authEncryptedContentInfo EncryptedContentInfo,
		 *   authAttrs [1] IMPLICIT AuthAttributes OPTIONAL,
		 *   mac MessageAuthenticationCode,
		 *   unauthAttrs [2] IMPLICIT UnauthAttributes OPTIONAL }
		 * </pre>
		 */
	    public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(version);
            v.AddOptionalTagged(false, 0, originatorInfo);
			v.Add(recipientInfos, authEncryptedContentInfo);

			// "authAttrs optionally contains the authenticated attributes."
            // "AuthAttributes MUST be DER encoded, even if the rest of the
            // AuthEnvelopedData structure is BER encoded."
            v.AddOptionalTagged(false, 1, authAttrs);

            v.Add(mac);

            // "unauthAttrs optionally contains the unauthenticated attributes."
            v.AddOptionalTagged(false, 2, unauthAttrs);

            return new BerSequence(v);
		}
	}
}
