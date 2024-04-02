using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
	/**
	* <pre>
	* SignedData ::= SEQUENCE {
	*     version CMSVersion,
	*     digestAlgorithms DigestAlgorithmIdentifiers,
	*     encapContentInfo EncapsulatedContentInfo,
	*     certificates [0] IMPLICIT CertificateSet OPTIONAL,
	*     crls [1] IMPLICIT CertificateRevocationLists OPTIONAL,
	*     signerInfos SignerInfos
	*   }
	* </pre>
	*/
	public class SignedDataParser
	{
		private Asn1SequenceParser	_seq;
		private DerInteger			_version;
		private object				_nextObject;
		private bool				_certsCalled;
		private bool				_crlsCalled;

		public static SignedDataParser GetInstance(
			object o)
		{
			if (o is Asn1Sequence)
				return new SignedDataParser(((Asn1Sequence)o).Parser);

			if (o is Asn1SequenceParser)
				return new SignedDataParser((Asn1SequenceParser)o);

            throw new IOException("unknown object encountered: " + Platform.GetTypeName(o));
		}

		public SignedDataParser(
			Asn1SequenceParser seq)
		{
			this._seq = seq;
			this._version = (DerInteger)seq.ReadObject();
		}

		public DerInteger Version
		{
			get { return _version; }
		}

		public Asn1SetParser GetDigestAlgorithms()
		{
			return (Asn1SetParser)_seq.ReadObject();
		}

		public ContentInfoParser GetEncapContentInfo()
		{
			return new ContentInfoParser((Asn1SequenceParser)_seq.ReadObject());
		}

		public Asn1SetParser GetCertificates()
		{
			_certsCalled = true;
			_nextObject = _seq.ReadObject();

			if (_nextObject is Asn1TaggedObjectParser o)
			{
				if (o.HasContextTag(0))
				{
					Asn1SetParser certs = (Asn1SetParser)o.ParseBaseUniversal(false, Asn1Tags.SetOf);
					_nextObject = null;
					return certs;
				}
			}

			return null;
		}

		public Asn1SetParser GetCrls()
		{
			if (!_certsCalled)
				throw new IOException("GetCerts() has not been called.");

			_crlsCalled = true;

			if (_nextObject == null)
			{
				_nextObject = _seq.ReadObject();
			}

			if (_nextObject is Asn1TaggedObjectParser o)
			{
				if (o.HasContextTag(1))
				{
					Asn1SetParser crls = (Asn1SetParser)o.ParseBaseUniversal(false, Asn1Tags.SetOf);
					_nextObject = null;
					return crls;
				}
			}

            return null;
        }

		public Asn1SetParser GetSignerInfos()
		{
			if (!_certsCalled || !_crlsCalled)
				throw new IOException("GetCerts() and/or GetCrls() has not been called.");

			if (_nextObject == null)
			{
				_nextObject = _seq.ReadObject();
			}

			return (Asn1SetParser)_nextObject;
		}
	}
}
