using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Cms
{
	/**
	 * Produce an object suitable for an Asn1OutputStream.
	 * <pre>
	 * AuthenticatedData ::= SEQUENCE {
	 *       version CMSVersion,
	 *       originatorInfo [0] IMPLICIT OriginatorInfo OPTIONAL,
	 *       recipientInfos RecipientInfos,
	 *       macAlgorithm MessageAuthenticationCodeAlgorithm,
	 *       digestAlgorithm [1] DigestAlgorithmIdentifier OPTIONAL,
	 *       encapContentInfo EncapsulatedContentInfo,
	 *       authAttrs [2] IMPLICIT AuthAttributes OPTIONAL,
	 *       mac MessageAuthenticationCode,
	 *       unauthAttrs [3] IMPLICIT UnauthAttributes OPTIONAL }
	 *
	 * AuthAttributes ::= SET SIZE (1..MAX) OF Attribute
	 *
	 * UnauthAttributes ::= SET SIZE (1..MAX) OF Attribute
	 *
	 * MessageAuthenticationCode ::= OCTET STRING
	 * </pre>
	 */
	public class AuthenticatedDataParser
	{
	    private Asn1SequenceParser	seq;
	    private DerInteger			version;
	    private IAsn1Convertible	nextObject;
	    private bool				originatorInfoCalled;

	    public AuthenticatedDataParser(
	        Asn1SequenceParser	seq)
	    {
	        this.seq = seq;
	        this.version = (DerInteger)seq.ReadObject();
	    }

	    public DerInteger Version
	    {
	        get { return version; }
	    }

	    public OriginatorInfo GetOriginatorInfo()
	    {
	        originatorInfoCalled = true;

	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

			if (nextObject is Asn1TaggedObjectParser o)
			{
				if (o.HasContextTag(0))
				{
					Asn1SequenceParser originatorInfo = (Asn1SequenceParser)o.ParseBaseUniversal(false, Asn1Tags.Sequence);
					nextObject = null;
					return OriginatorInfo.GetInstance(originatorInfo.ToAsn1Object());
				}
			}

	        return null;
	    }

	    public Asn1SetParser GetRecipientInfos()
	    {
	        if (!originatorInfoCalled)
	        {
	            GetOriginatorInfo();
	        }

	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

	        Asn1SetParser recipientInfos = (Asn1SetParser)nextObject;
	        nextObject = null;
	        return recipientInfos;
	    }

	    public AlgorithmIdentifier GetMacAlgorithm()
	    {
	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

	        if (nextObject != null)
	        {
	            Asn1SequenceParser o = (Asn1SequenceParser)nextObject;
	            nextObject = null;
	            return AlgorithmIdentifier.GetInstance(o.ToAsn1Object());
	        }

	        return null;
	    }

		public AlgorithmIdentifier GetDigestAlgorithm()
		{
			if (nextObject == null)
			{
				nextObject = seq.ReadObject();
			}

			if (nextObject is Asn1TaggedObjectParser)
			{
				AlgorithmIdentifier obj = AlgorithmIdentifier.GetInstance(
					(Asn1TaggedObject)nextObject.ToAsn1Object(), false);
				nextObject = null;
				return obj;
			}

			return null;
		}

	    public ContentInfoParser GetEnapsulatedContentInfo()
	    {
	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

	        if (nextObject != null)
	        {
	            Asn1SequenceParser o = (Asn1SequenceParser)nextObject;
	            nextObject = null;
	            return new ContentInfoParser(o);
	        }

	        return null;
	    }

	    public Asn1SetParser GetAuthAttrs()
	    {
	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

			if (nextObject is Asn1TaggedObjectParser o)
			{
				nextObject = null;
				return (Asn1SetParser)Asn1Utilities.ParseContextBaseUniversal(o, 2, false, Asn1Tags.SetOf);
			}

	        return null;
	    }

	    public Asn1OctetString GetMac()
	    {
	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

	        IAsn1Convertible o = nextObject;
	        nextObject = null;

	        return Asn1OctetString.GetInstance(o.ToAsn1Object());
	    }

	    public Asn1SetParser GetUnauthAttrs()
	    {
	        if (nextObject == null)
	        {
	            nextObject = seq.ReadObject();
	        }

			if (nextObject != null)
			{
				Asn1TaggedObject o = (Asn1TaggedObject)nextObject;
				nextObject = null;
				return (Asn1SetParser)Asn1Utilities.ParseContextBaseUniversal(o, 3, false, Asn1Tags.SetOf);
			}

	        return null;
	    }
	}
}
