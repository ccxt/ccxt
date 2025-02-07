using System;
using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Asn1
{
    public class Asn1OutputStream
        : FilterStream
    {
        internal const int EncodingBer = 1;
        internal const int EncodingDer = 2;

        public static Asn1OutputStream Create(Stream output)
        {
            return new Asn1OutputStream(output);
        }

        public static Asn1OutputStream Create(Stream output, string encoding)
        {
            if (Asn1Encodable.Der.Equals(encoding))
            {
                return new DerOutputStream(output);
            }
            else
            {
                return new Asn1OutputStream(output);
            }
        }

        internal Asn1OutputStream(Stream os)
            : base(os)
        {
        }

        public virtual void WriteObject(Asn1Encodable asn1Encodable)
        {
            if (null == asn1Encodable)
                throw new ArgumentNullException("asn1Encodable");

            asn1Encodable.ToAsn1Object().GetEncoding(this.Encoding).Encode(this);
            FlushInternal();
        }

        public virtual void WriteObject(Asn1Object asn1Object)
        {
            if (null == asn1Object)
                throw new ArgumentNullException("asn1Object");

            asn1Object.GetEncoding(this.Encoding).Encode(this);
            FlushInternal();
        }

        internal void EncodeContents(IAsn1Encoding[] contentsEncodings)
        {
            for (int i = 0, count = contentsEncodings.Length; i < count; ++i)
            {
                contentsEncodings[i].Encode(this);
            }
        }

        internal virtual int Encoding
        {
            get { return EncodingBer; }
        }

        internal void FlushInternal()
        {
            // Placeholder to support future internal buffering
        }

        internal void WriteDL(int dl)
        {
            if (dl < 128)
            {
                WriteByte((byte)dl);
                return;
            }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            Span<byte> stack = stackalloc byte[5];
#else
            byte[] stack = new byte[5];
#endif
            int pos = stack.Length;

            do
            {
                stack[--pos] = (byte)dl;
                dl >>= 8;
            }
            while (dl > 0);

            int count = stack.Length - pos;
            stack[--pos] = (byte)(0x80 | count);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            Write(stack[pos..]);
#else
            Write(stack, pos, count + 1);
#endif
        }

        internal void WriteIdentifier(int tagClass, int tagNo)
        {
            if (tagNo < 31)
            {
                WriteByte((byte)(tagClass | tagNo));
                return;
            }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            Span<byte> stack = stackalloc byte[6];
#else
            byte[] stack = new byte[6];
#endif
            int pos = stack.Length;

            stack[--pos] = (byte)(tagNo & 0x7F);
            while (tagNo > 127)
            {
                tagNo >>= 7;
                stack[--pos] = (byte)(tagNo & 0x7F | 0x80);
            }

            stack[--pos] = (byte)(tagClass | 0x1F);

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            Write(stack[pos..]);
#else
            Write(stack, pos, stack.Length - pos);
#endif
        }

        internal static IAsn1Encoding[] GetContentsEncodings(int encoding, Asn1Encodable[] elements)
        {
            int count = elements.Length;
            IAsn1Encoding[] contentsEncodings = new IAsn1Encoding[count];
            for (int i = 0; i < count; ++i)
            {
                contentsEncodings[i] = elements[i].ToAsn1Object().GetEncoding(encoding);
            }
            return contentsEncodings;
        }

        internal static int GetLengthOfContents(IAsn1Encoding[] contentsEncodings)
        {
            int contentsLength = 0;
            for (int i = 0, count = contentsEncodings.Length; i < count; ++i)
            {
                contentsLength += contentsEncodings[i].GetLength();
            }
            return contentsLength;
        }

        internal static int GetLengthOfDL(int dl)
        {
            if (dl < 128)
                return 1;

            int length = 2;
            while ((dl >>= 8) > 0)
            {
                ++length;
            }
            return length;
        }

        internal static int GetLengthOfIdentifier(int tagNo)
        {
            if (tagNo < 31)
                return 1;

            int length = 2;
            while ((tagNo >>= 7) > 0)
            {
                ++length;
            }
            return length;
        }
    }
}
