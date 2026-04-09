using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public class DerBoolean
        : Asn1Object
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerBoolean), Asn1Tags.Boolean) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        public static readonly DerBoolean False = new DerBoolean(false);
        public static readonly DerBoolean True  = new DerBoolean(true);

        /**
         * return a bool from the passed in object.
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerBoolean GetInstance(object obj)
        {
            if (obj == null || obj is DerBoolean)
            {
                return (DerBoolean)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerBoolean)
                    return (DerBoolean)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerBoolean)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct boolean from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        public static DerBoolean GetInstance(bool value)
        {
            return value ? True : False;
        }

        public static DerBoolean GetInstance(int value)
        {
            return value != 0 ? True : False;
        }

        /**
         * return a Boolean from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerBoolean GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerBoolean)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte value;

        public DerBoolean(
            byte[] val)
        {
            if (val.Length != 1)
                throw new ArgumentException("byte value should have 1 byte in it", "val");

            // TODO Are there any constraints on the possible byte values?
            this.value = val[0];
        }

        private DerBoolean(
            bool value)
        {
            this.value = value ? (byte)0xff : (byte)0;
        }

        public bool IsTrue
        {
            get { return value != 0; }
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.Boolean, GetContents(encoding));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, GetContents(encoding));
        }

        protected override bool Asn1Equals(
            Asn1Object asn1Object)
        {
            DerBoolean other = asn1Object as DerBoolean;

            if (other == null)
                return false;

            return IsTrue == other.IsTrue;
        }

        protected override int Asn1GetHashCode()
        {
            return IsTrue.GetHashCode();
        }

        public override string ToString()
        {
            return IsTrue ? "TRUE" : "FALSE";
        }

        internal static DerBoolean CreatePrimitive(byte[] contents)
        {
            if (contents.Length != 1)
                throw new ArgumentException("BOOLEAN value should have 1 byte in it", "contents");

            byte b = contents[0];

            return b == 0 ? False : b == 0xFF ? True : new DerBoolean(contents);
        }

        private byte[] GetContents(int encoding)
        {
            byte contents = value;
            if (Asn1OutputStream.EncodingDer == encoding && IsTrue)
            {
                contents = 0xFF;
            }

            return new byte[]{ contents };
        }
    }
}
