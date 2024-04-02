using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Asn1.Icao
{
	/**
	 * The LDSSecurityObject object (V1.8).
	 * <pre>
	 * LDSSecurityObject ::= SEQUENCE {
	 *   version                LDSSecurityObjectVersion,
	 *   hashAlgorithm          DigestAlgorithmIdentifier,
	 *   dataGroupHashValues    SEQUENCE SIZE (2..ub-DataGroups) OF DataHashGroup,
	 *   ldsVersionInfo         LDSVersionInfo OPTIONAL
	 *     -- if present, version MUST be v1 }
	 *
	 * DigestAlgorithmIdentifier ::= AlgorithmIdentifier,
	 *
	 * LDSSecurityObjectVersion :: INTEGER {V0(0)}
	 * </pre>
	 */
	public class LdsSecurityObject
		: Asn1Encodable
	{
		public const int UBDataGroups = 16;

		private DerInteger version = new DerInteger(0);
		private AlgorithmIdentifier digestAlgorithmIdentifier;
		private DataGroupHash[] datagroupHash;
		private LdsVersionInfo versionInfo;

		public static LdsSecurityObject GetInstance(object obj)
		{
			if (obj is LdsSecurityObject)
				return (LdsSecurityObject)obj;

			if (obj != null)
				return new LdsSecurityObject(Asn1Sequence.GetInstance(obj));

			return null;
		}

		private LdsSecurityObject(Asn1Sequence seq)
		{
			if (seq == null || seq.Count == 0)
				throw new ArgumentException("null or empty sequence passed.");

			var e = seq.GetEnumerator();

			// version
			e.MoveNext();
			version = DerInteger.GetInstance(e.Current);
			// digestAlgorithmIdentifier
			e.MoveNext();
			digestAlgorithmIdentifier = AlgorithmIdentifier.GetInstance(e.Current);

			e.MoveNext();
			Asn1Sequence datagroupHashSeq = Asn1Sequence.GetInstance(e.Current);

			if (version.HasValue(1))
			{
				e.MoveNext();
				versionInfo = LdsVersionInfo.GetInstance(e.Current);
			}

			CheckDatagroupHashSeqSize(datagroupHashSeq.Count);

			datagroupHash = new DataGroupHash[datagroupHashSeq.Count];
			for (int i= 0; i< datagroupHashSeq.Count; i++)
			{
				datagroupHash[i] = DataGroupHash.GetInstance(datagroupHashSeq[i]);
			}
		}

		public LdsSecurityObject(
			AlgorithmIdentifier	digestAlgorithmIdentifier,
			DataGroupHash[]		datagroupHash)
		{
			this.version = new DerInteger(0);
			this.digestAlgorithmIdentifier = digestAlgorithmIdentifier;
			this.datagroupHash = datagroupHash;

			CheckDatagroupHashSeqSize(datagroupHash.Length);
		}


		public LdsSecurityObject(
			AlgorithmIdentifier	digestAlgorithmIdentifier,
			DataGroupHash[]		datagroupHash,
			LdsVersionInfo		versionInfo)
		{
			this.version = new DerInteger(1);
			this.digestAlgorithmIdentifier = digestAlgorithmIdentifier;
			this.datagroupHash = datagroupHash;
			this.versionInfo = versionInfo;

			CheckDatagroupHashSeqSize(datagroupHash.Length);
		}

		private void CheckDatagroupHashSeqSize(int size)
		{
			if (size < 2 || size > UBDataGroups)
				throw new ArgumentException("wrong size in DataGroupHashValues : not in (2.."+ UBDataGroups +")");
		}

		public BigInteger Version
		{
			get { return version.Value; }
		}

		public AlgorithmIdentifier DigestAlgorithmIdentifier
		{
			get { return digestAlgorithmIdentifier; }
		}

		public DataGroupHash[] GetDatagroupHash()
		{
			return datagroupHash;
		}

		public LdsVersionInfo VersionInfo
		{
			get { return versionInfo; }
		}

		public override Asn1Object ToAsn1Object()
		{
			DerSequence hashSeq = new DerSequence(datagroupHash);

			Asn1EncodableVector v = new Asn1EncodableVector(version, digestAlgorithmIdentifier, hashSeq);
            v.AddOptional(versionInfo);
			return new DerSequence(v);
		}
	}
}
