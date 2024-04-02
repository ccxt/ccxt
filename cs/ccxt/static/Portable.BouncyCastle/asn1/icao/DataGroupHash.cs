using System;

namespace Org.BouncyCastle.Asn1.Icao
{
    /**
    * The DataGroupHash object.
    * <pre>
    * DataGroupHash  ::=  SEQUENCE {
    *      dataGroupNumber         DataGroupNumber,
    *      dataGroupHashValue     OCTET STRING }
    *
    * DataGroupNumber ::= INTEGER {
    *         dataGroup1    (1),
    *         dataGroup1    (2),
    *         dataGroup1    (3),
    *         dataGroup1    (4),
    *         dataGroup1    (5),
    *         dataGroup1    (6),
    *         dataGroup1    (7),
    *         dataGroup1    (8),
    *         dataGroup1    (9),
    *         dataGroup1    (10),
    *         dataGroup1    (11),
    *         dataGroup1    (12),
    *         dataGroup1    (13),
    *         dataGroup1    (14),
    *         dataGroup1    (15),
    *         dataGroup1    (16) }
    *
    * </pre>
    */
    public class DataGroupHash
        : Asn1Encodable
    {
        private readonly DerInteger dataGroupNumber;
        private readonly Asn1OctetString dataGroupHashValue;

		public static DataGroupHash GetInstance(object obj)
        {
            if (obj is DataGroupHash)
                return (DataGroupHash)obj;

			if (obj != null)
				return new DataGroupHash(Asn1Sequence.GetInstance(obj));

			return null;
		}

		private DataGroupHash(Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			this.dataGroupNumber = DerInteger.GetInstance(seq[0]);
            this.dataGroupHashValue = Asn1OctetString.GetInstance(seq[1]);
        }

		public DataGroupHash(
            int				dataGroupNumber,
            Asn1OctetString	dataGroupHashValue)
        {
            this.dataGroupNumber = new DerInteger(dataGroupNumber);
            this.dataGroupHashValue = dataGroupHashValue;
        }

		public int DataGroupNumber
		{
            get { return dataGroupNumber.IntValueExact; }
		}

		public Asn1OctetString DataGroupHashValue
		{
			get { return dataGroupHashValue; }
		}

		public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(dataGroupNumber, dataGroupHashValue);
        }
    }
}
