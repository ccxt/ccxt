using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
	public class Evidence
		: Asn1Encodable, IAsn1Choice
	{
		private TimeStampTokenEvidence tstEvidence;
        private Asn1Sequence otherEvidence;

		public Evidence(TimeStampTokenEvidence tstEvidence)
		{
			this.tstEvidence = tstEvidence;
		}

		private Evidence(Asn1TaggedObject tagged)
		{
            if (tagged.TagNo == 0)
            {
                this.tstEvidence = TimeStampTokenEvidence.GetInstance(tagged, false);
            }
            //else if (tagged.TagNo == 1)
            //{
            //    this.ersEvidence = EvidenceRecord.GetInstance(tagged, false);
            //}
            else if (tagged.TagNo == 2)
            {
                this.otherEvidence = Asn1Sequence.GetInstance(tagged, false);
            }
            else
            {
                throw new ArgumentException("unknown tag in Evidence", "tagged");
            }
        }

		public static Evidence GetInstance(object obj)
		{
			if (obj is Evidence)
				return (Evidence)obj;

			if (obj is Asn1TaggedObject)
				return new Evidence(Asn1TaggedObject.GetInstance(obj));

			throw new ArgumentException("Unknown object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

        public static Evidence GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(obj.GetObject()); // must be explicitly tagged
        }

		public virtual TimeStampTokenEvidence TstEvidence
		{
			get { return tstEvidence; }
		}

        //public EvidenceRecord ErsEvidence
        //{
        //    get { return ersEvidence; }
        //}

		public override Asn1Object ToAsn1Object()
		{
			if (tstEvidence != null)
				return new DerTaggedObject(false, 0, tstEvidence);
            //if (ersEvidence != null)
            //    return new DerTaggedObject(false, 1, ersEvidence);
            return new DerTaggedObject(false, 2, otherEvidence);
		}
	}
}
