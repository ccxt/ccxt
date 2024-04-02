using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class MacData
        : Asn1Encodable
    {
        internal DigestInfo	digInfo;
        internal byte[]		salt;
        internal BigInteger	iterationCount;

		public static MacData GetInstance(
            object obj)
        {
            if (obj is MacData)
            {
                return (MacData) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new MacData((Asn1Sequence) obj);
            }

			throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private MacData(
            Asn1Sequence seq)
        {
            this.digInfo = DigestInfo.GetInstance(seq[0]);
            this.salt = ((Asn1OctetString) seq[1]).GetOctets();

			if (seq.Count == 3)
            {
                this.iterationCount = ((DerInteger) seq[2]).Value;
            }
            else
            {
                this.iterationCount = BigInteger.One;
            }
        }

		public MacData(
            DigestInfo	digInfo,
            byte[]		salt,
            int			iterationCount)
        {
            this.digInfo = digInfo;
            this.salt = (byte[]) salt.Clone();
            this.iterationCount = BigInteger.ValueOf(iterationCount);
        }

		public DigestInfo Mac
		{
			get { return digInfo; }
		}

		public byte[] GetSalt()
        {
            return (byte[]) salt.Clone();
        }

		public BigInteger IterationCount
		{
			get { return iterationCount; }
		}

		/**
		 * <pre>
		 * MacData ::= SEQUENCE {
		 *     mac      DigestInfo,
		 *     macSalt  OCTET STRING,
		 *     iterations INTEGER DEFAULT 1
		 *     -- Note: The default is for historic reasons and its use is deprecated. A
		 *     -- higher value, like 1024 is recommended.
		 * </pre>
		 * @return the basic DERObject construction.
		 */
		public override Asn1Object ToAsn1Object()
        {
			Asn1EncodableVector v = new Asn1EncodableVector(digInfo, new DerOctetString(salt));

			if (!iterationCount.Equals(BigInteger.One))
			{
				v.Add(new DerInteger(iterationCount));
			}

			return new DerSequence(v);
        }
    }
}
