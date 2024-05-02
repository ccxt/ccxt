using System;
using System.Diagnostics;
using System.IO;
using System.Text;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
	public class DerBitString
		: DerStringBase, Asn1BitStringParser
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerBitString), Asn1Tags.BitString) { }

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }

            internal override Asn1Object FromImplicitConstructed(Asn1Sequence sequence)
            {
                return sequence.ToAsn1BitString();
            }
        }

        private static readonly char[] table
			= { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };

        /**
		 * return a Bit string from the passed in object
		 *
		 * @exception ArgumentException if the object cannot be converted.
		 */
		public static DerBitString GetInstance(object obj)
		{
			if (obj == null || obj is DerBitString)
			{
				return (DerBitString)obj;
			}
            //else if (obj is Asn1BitStringParser)
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerBitString)
                    return (DerBitString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return GetInstance(FromByteArray((byte[])obj));
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct BIT STRING from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
		}

		/**
		 * return a Bit string from a tagged object.
		 *
		 * @param obj the tagged object holding the object we want
		 * @param explicitly true if the object is meant to be explicitly
		 *              tagged false otherwise.
		 * @exception ArgumentException if the tagged object cannot
		 *               be converted.
		 */
		public static DerBitString GetInstance(Asn1TaggedObject obj, bool isExplicit)
		{
			Asn1Object o = obj.GetObject();

			if (isExplicit || o is DerBitString)
			{
				return GetInstance(o);
			}

            // Not copied because assumed to be a tagged implicit primitive from the parser
			return CreatePrimitive(((Asn1OctetString)o).GetOctets());
		}

        internal readonly byte[] contents;

        public DerBitString(byte data, int padBits)
        {
            if (padBits > 7 || padBits < 0)
                throw new ArgumentException("pad bits cannot be greater than 7 or less than 0", "padBits");

            this.contents = new byte[] { (byte)padBits, data };
        }

        public DerBitString(byte[] data)
            : this(data, 0)
        {
        }

        /**
		 * @param data the octets making up the bit string.
		 * @param padBits the number of extra bits at the end of the string.
		 */
        public DerBitString(byte[] data, int padBits)
		{
            if (data == null)
                throw new ArgumentNullException("data");
            if (padBits < 0 || padBits > 7)
                throw new ArgumentException("must be in the range 0 to 7", "padBits");
            if (data.Length == 0 && padBits != 0)
                throw new ArgumentException("if 'data' is empty, 'padBits' must be 0");

            this.contents = Arrays.Prepend(data, (byte)padBits);
        }

        public DerBitString(int namedBits)
        {
            if (namedBits == 0)
            {
                this.contents = new byte[]{ 0 };
                return;
            }

            int bits = 32 - Integers.NumberOfLeadingZeros(namedBits);
            int bytes = (bits + 7) / 8;
            Debug.Assert(0 < bytes && bytes <= 4);

            byte[] data = new byte[1 + bytes];

            for (int i = 1; i < bytes; i++)
            {
                data[i] = (byte)namedBits;
                namedBits >>= 8;
            }

            Debug.Assert((namedBits & 0xFF) != 0);
            data[bytes] = (byte)namedBits;

            int padBits = 0;
            while ((namedBits & (1 << padBits)) == 0)
            {
                ++padBits;
            }

            Debug.Assert(padBits < 8);
            data[0] = (byte)padBits;

            this.contents = data;
        }

        public DerBitString(Asn1Encodable obj)
            : this(obj.GetDerEncoded())
		{
		}

        internal DerBitString(byte[] contents, bool check)
        {
            if (check)
            {
                if (null == contents)
                    throw new ArgumentNullException("contents");
                if (contents.Length < 1)
                    throw new ArgumentException("cannot be empty", "contents");

                int padBits = contents[0];
                if (padBits > 0)
                {
                    if (contents.Length < 2)
                        throw new ArgumentException("zero length data with non-zero pad bits", "contents");
                    if (padBits > 7)
                        throw new ArgumentException("pad bits cannot be greater than 7 or less than 0", "contents");
                }
            }

            this.contents = contents;
        }

        /**
         * Return the octets contained in this BIT STRING, checking that this BIT STRING really
         * does represent an octet aligned string. Only use this method when the standard you are
         * following dictates that the BIT STRING will be octet aligned.
         *
         * @return a copy of the octet aligned data.
         */
        public virtual byte[] GetOctets()
        {
            if (contents[0] != 0)
                throw new InvalidOperationException("attempt to get non-octet aligned data from BIT STRING");

            return Arrays.CopyOfRange(contents, 1, contents.Length);
        }

        public virtual byte[] GetBytes()
		{
            if (contents.Length == 1)
                return Asn1OctetString.EmptyOctets;

            int padBits = contents[0];
            byte[] rv = Arrays.CopyOfRange(contents, 1, contents.Length);
            // DER requires pad bits be zero
            rv[rv.Length - 1] &= (byte)(0xFF << padBits);
            return rv;
        }

        public virtual int PadBits
		{
			get { return contents[0]; }
		}

		/**
		 * @return the value of the bit string as an int (truncating if necessary)
		 */
        public virtual int IntValue
		{
			get
			{
                int value = 0, end = System.Math.Min(5, contents.Length - 1);
                for (int i = 1; i < end; ++i)
                {
                    value |= (int)contents[i] << (8 * (i - 1));
                }
                if (1 <= end && end < 5)
                {
                    int padBits = contents[0];
                    byte der = (byte)(contents[end] & (0xFF << padBits));
                    value |= (int)der << (8 * (end - 1));
                }
                return value;
            }
		}

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            int padBits = contents[0];
            if (padBits != 0)
            {
                int last = contents.Length - 1;
                byte lastBer = contents[last];
                byte lastDer = (byte)(lastBer & (0xFF << padBits));

                if (lastBer != lastDer)
                    return new PrimitiveEncodingSuffixed(Asn1Tags.Universal, Asn1Tags.BitString, contents, lastDer);
            }

            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.BitString, contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            int padBits = contents[0];
            if (padBits != 0)
            {
                int last = contents.Length - 1;
                byte lastBer = contents[last];
                byte lastDer = (byte)(lastBer & (0xFF << padBits));

                if (lastBer != lastDer)
                    return new PrimitiveEncodingSuffixed(tagClass, tagNo, contents, lastDer);
            }

            return new PrimitiveEncoding(tagClass, tagNo, contents);
        }

        protected override int Asn1GetHashCode()
		{
            if (contents.Length < 2)
                return 1;

            int padBits = contents[0];
            int last = contents.Length - 1;

            byte lastDer = (byte)(contents[last] & (0xFF << padBits));

            int hc = Arrays.GetHashCode(contents, 0, last);
            hc *= 257;
            hc ^= lastDer;
            return hc;
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
		{
            DerBitString that = asn1Object as DerBitString;
            if (null == that)
                return false;

            byte[] thisContents = this.contents, thatContents = that.contents;

            int length = thisContents.Length;
            if (thatContents.Length != length)
                return false;
            if (length == 1)
                return true;

            int last = length - 1;
            for (int i = 0; i < last; ++i)
            {
                if (thisContents[i] != thatContents[i])
                    return false;
            }

            int padBits = thisContents[0];
            byte thisLastDer = (byte)(thisContents[last] & (0xFF << padBits));
            byte thatLastDer = (byte)(thatContents[last] & (0xFF << padBits));

            return thisLastDer == thatLastDer;
        }

        public Stream GetBitStream()
        {
            return new MemoryStream(contents, 1, contents.Length - 1, false);
        }

        public Stream GetOctetStream()
        {
            int padBits = contents[0] & 0xFF;
            if (0 != padBits)
                throw new IOException("expected octet-aligned bitstring, but found padBits: " + padBits);

            return GetBitStream();
        }

        public Asn1BitStringParser Parser
        {
            get { return this; }
        }

        public override string GetString()
		{
			byte[] str = GetDerEncoded();

            StringBuilder buffer = new StringBuilder(1 + str.Length * 2);
            buffer.Append('#');

            for (int i = 0; i != str.Length; i++)
			{
				uint u8 = str[i];
				buffer.Append(table[u8 >> 4]);
				buffer.Append(table[u8 & 0xF]);
			}

			return buffer.ToString();
		}

		internal static DerBitString CreatePrimitive(byte[] contents)
		{
            int length = contents.Length;
            if (length < 1)
                throw new ArgumentException("truncated BIT STRING detected", "contents");

            int padBits = contents[0];
            if (padBits > 0)
            {
                if (padBits > 7 || length < 2)
                    throw new ArgumentException("invalid pad bits detected", "contents");

                byte finalOctet = contents[length - 1];
                if (finalOctet != (byte)(finalOctet & (0xFF << padBits)))
                    return new DLBitString(contents, false);
            }

            return new DerBitString(contents, false);
		}
	}
}
