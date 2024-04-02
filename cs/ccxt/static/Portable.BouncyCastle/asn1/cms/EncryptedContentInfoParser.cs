using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Cms
{
	/**
	* <pre>
	* EncryptedContentInfo ::= SEQUENCE {
	*     contentType ContentType,
	*     contentEncryptionAlgorithm ContentEncryptionAlgorithmIdentifier,
	*     encryptedContent [0] IMPLICIT EncryptedContent OPTIONAL
	* }
	* </pre>
	*/
	public class EncryptedContentInfoParser
	{
		private DerObjectIdentifier		_contentType;
		private AlgorithmIdentifier		_contentEncryptionAlgorithm;
		private Asn1TaggedObjectParser	_encryptedContent;

		public EncryptedContentInfoParser(
			Asn1SequenceParser seq)
		{
			_contentType = (DerObjectIdentifier)seq.ReadObject();
			_contentEncryptionAlgorithm = AlgorithmIdentifier.GetInstance(seq.ReadObject().ToAsn1Object());
			_encryptedContent = (Asn1TaggedObjectParser)seq.ReadObject();
		}

		public DerObjectIdentifier ContentType
		{
			get { return _contentType; }
		}

		public AlgorithmIdentifier ContentEncryptionAlgorithm
		{
			get { return _contentEncryptionAlgorithm; }
		}

		public IAsn1Convertible GetEncryptedContent(
			int tag)
		{
			return Asn1Utilities.ParseContextBaseUniversal(_encryptedContent, 0, false, tag);
		}
	}
}
