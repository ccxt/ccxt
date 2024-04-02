using System;

using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
	public class RsaesOaepParameters
		: Asn1Encodable
	{
		private AlgorithmIdentifier hashAlgorithm;
		private AlgorithmIdentifier maskGenAlgorithm;
		private AlgorithmIdentifier pSourceAlgorithm;

		public readonly static AlgorithmIdentifier DefaultHashAlgorithm = new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1, DerNull.Instance);
		public readonly static AlgorithmIdentifier DefaultMaskGenFunction = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, DefaultHashAlgorithm);
		public readonly static AlgorithmIdentifier DefaultPSourceAlgorithm = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdPSpecified, new DerOctetString(new byte[0]));

		public static RsaesOaepParameters GetInstance(
			object obj)
		{
			if (obj is RsaesOaepParameters)
			{
				return (RsaesOaepParameters)obj;
			}
			else if (obj is Asn1Sequence)
			{
				return new RsaesOaepParameters((Asn1Sequence)obj);
			}

			throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		 * The default version
		 */
		public RsaesOaepParameters()
		    : this(DefaultHashAlgorithm, DefaultMaskGenFunction, DefaultPSourceAlgorithm)
		{ 
		}

		public RsaesOaepParameters(
			AlgorithmIdentifier hashAlgorithm,
			AlgorithmIdentifier maskGenAlgorithm)
		    : this(hashAlgorithm, maskGenAlgorithm, DefaultPSourceAlgorithm)
		{
		}

		public RsaesOaepParameters(
			AlgorithmIdentifier hashAlgorithm,
			AlgorithmIdentifier maskGenAlgorithm,
			AlgorithmIdentifier pSourceAlgorithm)
		{
			this.hashAlgorithm = hashAlgorithm;
			this.maskGenAlgorithm = maskGenAlgorithm;
			this.pSourceAlgorithm = pSourceAlgorithm;
		}

		public RsaesOaepParameters(
			Asn1Sequence seq)
		{
			hashAlgorithm = DefaultHashAlgorithm;
			maskGenAlgorithm = DefaultMaskGenFunction;
			pSourceAlgorithm = DefaultPSourceAlgorithm;

			for (int i = 0; i != seq.Count; i++)
			{
				Asn1TaggedObject o = (Asn1TaggedObject)seq[i];

				switch (o.TagNo)
				{
					case 0:
						hashAlgorithm = AlgorithmIdentifier.GetInstance(o, true);
						break;
					case 1:
						maskGenAlgorithm = AlgorithmIdentifier.GetInstance(o, true);
						break;
					case 2:
						pSourceAlgorithm = AlgorithmIdentifier.GetInstance(o, true);
						break;
					default:
						throw new ArgumentException("unknown tag");
				}
			}
		}

		public AlgorithmIdentifier HashAlgorithm
		{
			get { return hashAlgorithm; }
		}

		public AlgorithmIdentifier MaskGenAlgorithm
		{
			get { return maskGenAlgorithm; }
		}

		public AlgorithmIdentifier PSourceAlgorithm
		{
			get { return pSourceAlgorithm; }
		}

		/**
		 * <pre>
		 *  RSAES-OAEP-params ::= SEQUENCE {
		 *     hashAlgorithm      [0] OAEP-PSSDigestAlgorithms     DEFAULT sha1,
		 *     maskGenAlgorithm   [1] PKCS1MGFAlgorithms  DEFAULT mgf1SHA1,
		 *     pSourceAlgorithm   [2] PKCS1PSourceAlgorithms  DEFAULT pSpecifiedEmpty
		 *   }
		 *
		 *   OAEP-PSSDigestAlgorithms    ALGORITHM-IDENTIFIER ::= {
		 *     { OID id-sha1 PARAMETERS NULL   }|
		 *     { OID id-sha256 PARAMETERS NULL }|
		 *     { OID id-sha384 PARAMETERS NULL }|
		 *     { OID id-sha512 PARAMETERS NULL },
		 *     ...  -- Allows for future expansion --
		 *   }
		 *   PKCS1MGFAlgorithms    ALGORITHM-IDENTIFIER ::= {
		 *     { OID id-mgf1 PARAMETERS OAEP-PSSDigestAlgorithms },
		 *    ...  -- Allows for future expansion --
		 *   }
		 *   PKCS1PSourceAlgorithms    ALGORITHM-IDENTIFIER ::= {
		 *     { OID id-pSpecified PARAMETERS OCTET STRING },
		 *     ...  -- Allows for future expansion --
		 *  }
		 * </pre>
		 * @return the asn1 primitive representing the parameters.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector();

			if (!hashAlgorithm.Equals(DefaultHashAlgorithm))
			{
				v.Add(new DerTaggedObject(true, 0, hashAlgorithm));
			}

			if (!maskGenAlgorithm.Equals(DefaultMaskGenFunction))
			{
				v.Add(new DerTaggedObject(true, 1, maskGenAlgorithm));
			}

			if (!pSourceAlgorithm.Equals(DefaultPSourceAlgorithm))
			{
				v.Add(new DerTaggedObject(true, 2, pSourceAlgorithm));
			}

			return new DerSequence(v);
		}
	}
}
