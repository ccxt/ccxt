namespace Org.BouncyCastle.Asn1.X9
{
    /**
     * ANS.1 def for Diffie-Hellman key exchange OtherInfo structure. See
     * RFC 2631, or X9.42, for further details.
     */
    public class OtherInfo
        : Asn1Encodable
    {
        private KeySpecificInfo	keyInfo;
        private Asn1OctetString	partyAInfo;
        private Asn1OctetString	suppPubInfo;

		public OtherInfo(
            KeySpecificInfo	keyInfo,
            Asn1OctetString	partyAInfo,
            Asn1OctetString	suppPubInfo)
        {
            this.keyInfo = keyInfo;
            this.partyAInfo = partyAInfo;
            this.suppPubInfo = suppPubInfo;
        }

		public OtherInfo(Asn1Sequence seq)
        {
            var e = seq.GetEnumerator();

			e.MoveNext();
            keyInfo = new KeySpecificInfo((Asn1Sequence)e.Current);

			while (e.MoveNext())
            {
                Asn1TaggedObject o = (Asn1TaggedObject)e.Current;

				if (o.TagNo == 0)
                {
                    partyAInfo = (Asn1OctetString)o.GetObject();
                }
                else if ((int) o.TagNo == 2)
                {
                    suppPubInfo = (Asn1OctetString)o.GetObject();
                }
            }
        }

		public KeySpecificInfo KeyInfo
        {
			get { return keyInfo; }
        }

		public Asn1OctetString PartyAInfo
        {
			get { return partyAInfo; }
        }

		public Asn1OctetString SuppPubInfo
        {
            get { return suppPubInfo; }
        }

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  OtherInfo ::= Sequence {
         *      keyInfo KeySpecificInfo,
         *      partyAInfo [0] OCTET STRING OPTIONAL,
         *      suppPubInfo [2] OCTET STRING
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(keyInfo);
            v.AddOptionalTagged(true, 0, partyAInfo);
            v.Add(new DerTaggedObject(2, suppPubInfo));
            return new DerSequence(v);
        }
    }
}
