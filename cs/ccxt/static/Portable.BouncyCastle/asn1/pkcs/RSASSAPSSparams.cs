using System;

using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
	public class RsassaPssParameters
		: Asn1Encodable
	{
		private AlgorithmIdentifier hashAlgorithm;
		private AlgorithmIdentifier maskGenAlgorithm;
		private DerInteger saltLength;
		private DerInteger trailerField;

		public readonly static AlgorithmIdentifier DefaultHashAlgorithm = new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1, DerNull.Instance);
		public readonly static AlgorithmIdentifier DefaultMaskGenFunction = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, DefaultHashAlgorithm);
		public readonly static DerInteger DefaultSaltLength = new DerInteger(20);
		public readonly static DerInteger DefaultTrailerField = new DerInteger(1);

		public static RsassaPssParameters GetInstance(
			object obj)
		{
			if (obj == null || obj is RsassaPssParameters)
			{
				return (RsassaPssParameters)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new RsassaPssParameters((Asn1Sequence)obj);
			}

			throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		 * The default version
		 */
		public RsassaPssParameters()
		{
			hashAlgorithm = DefaultHashAlgorithm;
			maskGenAlgorithm = DefaultMaskGenFunction;
			saltLength = DefaultSaltLength;
			trailerField = DefaultTrailerField;
		}

		public RsassaPssParameters(
			AlgorithmIdentifier hashAlgorithm,
			AlgorithmIdentifier maskGenAlgorithm,
			DerInteger saltLength,
			DerInteger trailerField)
		{
			this.hashAlgorithm = hashAlgorithm;
			this.maskGenAlgorithm = maskGenAlgorithm;
			this.saltLength = saltLength;
			this.trailerField = trailerField;
		}

		public RsassaPssParameters(
			Asn1Sequence seq)
		{
			hashAlgorithm = DefaultHashAlgorithm;
			maskGenAlgorithm = DefaultMaskGenFunction;
			saltLength = DefaultSaltLength;
			trailerField = DefaultTrailerField;

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
						saltLength = DerInteger.GetInstance(o, true);
						break;
					case 3:
						trailerField = DerInteger.GetInstance(o, true);
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

		public DerInteger SaltLength
		{
			get { return saltLength; }
		}

		public DerInteger TrailerField
		{
			get { return trailerField; }
		}

		/**
		 * <pre>
		 * RSASSA-PSS-params ::= SEQUENCE {
		 *   hashAlgorithm      [0] OAEP-PSSDigestAlgorithms  DEFAULT sha1,
		 *    maskGenAlgorithm   [1] PKCS1MGFAlgorithms  DEFAULT mgf1SHA1,
		 *    saltLength         [2] INTEGER  DEFAULT 20,
		 *    trailerField       [3] TrailerField  DEFAULT trailerFieldBC
		 *  }
		 *
		 * OAEP-PSSDigestAlgorithms    ALGORITHM-IDENTIFIER ::= {
		 *    { OID id-sha1 PARAMETERS NULL   }|
		 *    { OID id-sha256 PARAMETERS NULL }|
		 *    { OID id-sha384 PARAMETERS NULL }|
		 *    { OID id-sha512 PARAMETERS NULL },
		 *    ...  -- Allows for future expansion --
		 * }
		 *
		 * PKCS1MGFAlgorithms    ALGORITHM-IDENTIFIER ::= {
		 *   { OID id-mgf1 PARAMETERS OAEP-PSSDigestAlgorithms },
		 *    ...  -- Allows for future expansion --
		 * }
		 *
		 * TrailerField ::= INTEGER { trailerFieldBC(1) }
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

			if (!saltLength.Equals(DefaultSaltLength))
			{
				v.Add(new DerTaggedObject(true, 2, saltLength));
			}

			if (!trailerField.Equals(DefaultTrailerField))
			{
				v.Add(new DerTaggedObject(true, 3, trailerField));
			}

			return new DerSequence(v);
		}
	}
}
