using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
	public class Asn1StreamParser
	{
		private readonly Stream _in;
		private readonly int _limit;

        private readonly byte[][] tmpBuffers;

        public Asn1StreamParser(Stream input)
			: this(input, Asn1InputStream.FindLimit(input))
		{
		}

        public Asn1StreamParser(byte[] encoding)
            : this(new MemoryStream(encoding, false), encoding.Length)
        {
        }

        public Asn1StreamParser(Stream input, int limit)
            : this(input, limit, new byte[16][])
		{
        }

        internal Asn1StreamParser(Stream input, int limit, byte[][] tmpBuffers)
        {
            if (!input.CanRead)
                throw new ArgumentException("Expected stream to be readable", "input");

            this._in = input;
            this._limit = limit;
            this.tmpBuffers = tmpBuffers;
        }

		public virtual IAsn1Convertible ReadObject()
		{
			int tagHdr = _in.ReadByte();
			if (tagHdr < 0)
				return null;

            return ImplParseObject(tagHdr);
        }

        internal IAsn1Convertible ImplParseObject(int tagHdr)
        {
            // turn off looking for "00" while we resolve the tag
            Set00Check(false);

			//
			// calculate tag number
			//
			int tagNo = Asn1InputStream.ReadTagNumber(_in, tagHdr);

			//
			// calculate length
			//
			int length = Asn1InputStream.ReadLength(_in, _limit,
                tagNo == Asn1Tags.BitString || tagNo == Asn1Tags.OctetString || tagNo == Asn1Tags.Sequence ||
                tagNo == Asn1Tags.Set || tagNo == Asn1Tags.External);

			if (length < 0) // indefinite-length method
			{
                if (0 == (tagHdr & Asn1Tags.Constructed))
                    throw new IOException("indefinite-length primitive encoding encountered");

                IndefiniteLengthInputStream indIn = new IndefiniteLengthInputStream(_in, _limit);
                Asn1StreamParser sp = new Asn1StreamParser(indIn, _limit, tmpBuffers);

                int tagClass = tagHdr & Asn1Tags.Private;
                if (0 != tagClass)
                    return new BerTaggedObjectParser(tagClass, tagNo, sp);

                return sp.ParseImplicitConstructedIL(tagNo);
			}
			else
			{
				DefiniteLengthInputStream defIn = new DefiniteLengthInputStream(_in, length, _limit);

                if (0 == (tagHdr & Asn1Tags.Flags))
                    return ParseImplicitPrimitive(tagNo, defIn);

                Asn1StreamParser sp = new Asn1StreamParser(defIn, defIn.Remaining, tmpBuffers);

                int tagClass = tagHdr & Asn1Tags.Private;
                if (0 != tagClass)
                {
                    bool isConstructed = (tagHdr & Asn1Tags.Constructed) != 0;

                    return new DLTaggedObjectParser(tagClass, tagNo, isConstructed, sp);
                }

                return sp.ParseImplicitConstructedDL(tagNo);
			}
		}

        internal Asn1Object LoadTaggedDL(int tagClass, int tagNo, bool constructed)
        {
            if (!constructed)
            {
                byte[] contentsOctets = ((DefiniteLengthInputStream)_in).ToArray();
                return Asn1TaggedObject.CreatePrimitive(tagClass, tagNo, contentsOctets);
            }

            Asn1EncodableVector contentsElements = ReadVector();
            return Asn1TaggedObject.CreateConstructedDL(tagClass, tagNo, contentsElements);
        }

        internal Asn1Object LoadTaggedIL(int tagClass, int tagNo)
        {
            Asn1EncodableVector contentsElements = ReadVector();
            return Asn1TaggedObject.CreateConstructedIL(tagClass, tagNo, contentsElements);
        }

        internal IAsn1Convertible ParseImplicitConstructedDL(int univTagNo)
        {
            switch (univTagNo)
            {
            case Asn1Tags.BitString:
                // TODO[asn1] DLConstructedBitStringParser
                return new BerBitStringParser(this);
            case Asn1Tags.External:
                return new DerExternalParser(this);
            case Asn1Tags.OctetString:
                // TODO[asn1] DLConstructedOctetStringParser
                return new BerOctetStringParser(this);
            case Asn1Tags.Set:
                return new DerSetParser(this);
            case Asn1Tags.Sequence:
                return new DerSequenceParser(this);
            default:
				throw new Asn1Exception("unknown DL object encountered: 0x" + univTagNo.ToString("X"));
            }
        }

        internal IAsn1Convertible ParseImplicitConstructedIL(int univTagNo)
        {
            switch (univTagNo)
            {
            case Asn1Tags.BitString:
                return new BerBitStringParser(this);
            case Asn1Tags.External:
                // TODO[asn1] BERExternalParser
                return new DerExternalParser(this);
            case Asn1Tags.OctetString:
                return new BerOctetStringParser(this);
            case Asn1Tags.Sequence:
                return new BerSequenceParser(this);
            case Asn1Tags.Set:
                return new BerSetParser(this);
            default:
                throw new Asn1Exception("unknown BER object encountered: 0x" + univTagNo.ToString("X"));
            }
        }

        internal IAsn1Convertible ParseImplicitPrimitive(int univTagNo)
        {
            return ParseImplicitPrimitive(univTagNo, (DefiniteLengthInputStream)_in);
        }

        internal IAsn1Convertible ParseImplicitPrimitive(int univTagNo, DefiniteLengthInputStream defIn)
        {
            // Some primitive encodings can be handled by parsers too...
            switch (univTagNo)
            {
            case Asn1Tags.BitString:
                return new DLBitStringParser(defIn);
            case Asn1Tags.External:
                throw new Asn1Exception("externals must use constructed encoding (see X.690 8.18)");
            case Asn1Tags.OctetString:
                return new DerOctetStringParser(defIn);
			case Asn1Tags.Set:
				throw new Asn1Exception("sequences must use constructed encoding (see X.690 8.9.1/8.10.1)");
			case Asn1Tags.Sequence:
				throw new Asn1Exception("sets must use constructed encoding (see X.690 8.11.1/8.12.1)");
            }

            try
            {
                return Asn1InputStream.CreatePrimitiveDerObject(univTagNo, defIn, tmpBuffers);
            }
            catch (ArgumentException e)
            {
                throw new Asn1Exception("corrupted stream detected", e);
            }
        }

        internal IAsn1Convertible ParseObject(int univTagNo)
        {
            if (univTagNo < 0 || univTagNo > 30)
                throw new ArgumentException("invalid universal tag number: " + univTagNo, "univTagNo");

            int tagHdr = _in.ReadByte();
            if (tagHdr < 0)
                return null;

            if ((tagHdr & ~Asn1Tags.Constructed) != univTagNo)
                throw new IOException("unexpected identifier encountered: " + tagHdr);

            return ImplParseObject(tagHdr);
        }

        internal Asn1TaggedObjectParser ParseTaggedObject()
        {
            int tagHdr = _in.ReadByte();
            if (tagHdr< 0)
                return null;

            int tagClass = tagHdr & Asn1Tags.Private;
            if (0 == tagClass)
                throw new Asn1Exception("no tagged object found");

            return (Asn1TaggedObjectParser)ImplParseObject(tagHdr);
        }

        // TODO[asn1] Prefer 'LoadVector'
        internal Asn1EncodableVector ReadVector()
        {
            int tagHdr = _in.ReadByte();
            if (tagHdr < 0)
                return new Asn1EncodableVector(0);

            Asn1EncodableVector v = new Asn1EncodableVector();
            do
            {
                IAsn1Convertible obj = ImplParseObject(tagHdr);

                v.Add(obj.ToAsn1Object());
            }
            while ((tagHdr = _in.ReadByte()) >= 0);
            return v;
        }

		private void Set00Check(bool enabled)
		{
			if (_in is IndefiniteLengthInputStream indef)
			{
				indef.SetEofOn00(enabled);
			}
		}
	}
}
