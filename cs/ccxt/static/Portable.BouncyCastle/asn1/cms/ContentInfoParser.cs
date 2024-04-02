using System;

namespace Org.BouncyCastle.Asn1.Cms
{
	/**
	* Produce an object suitable for an Asn1OutputStream.
	* <pre>
	* ContentInfo ::= SEQUENCE {
	*          contentType ContentType,
	*          content
	*          [0] EXPLICIT ANY DEFINED BY contentType OPTIONAL }
	* </pre>
	*/
	public class ContentInfoParser
	{
		private readonly DerObjectIdentifier m_contentType;
		private readonly Asn1TaggedObjectParser m_content;

		public ContentInfoParser(Asn1SequenceParser seq)
		{
			m_contentType = (DerObjectIdentifier)seq.ReadObject();
			m_content = (Asn1TaggedObjectParser)seq.ReadObject();
		}

		public DerObjectIdentifier ContentType
		{
			get { return m_contentType; }
		}

		public IAsn1Convertible GetContent(int tag)
		{
			if (null == m_content)
				return null;

            // TODO[cms] Ideally we could enforce the claimed tag
            //return Asn1Utilities.ParseContextBaseUniversal(content, 0, true, tag);
            return Asn1Utilities.ParseExplicitContextBaseObject(m_content, 0);
        }
	}
}
