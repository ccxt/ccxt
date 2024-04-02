using System;
using System.Collections.Generic;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    internal class LazyDLSequence
        : DLSequence
    {
        private byte[] encoded;

        internal LazyDLSequence(byte[] encoded)
            : base()
        {
            if (null == encoded)
                throw new ArgumentNullException("encoded");

            this.encoded = encoded;
        }

        public override Asn1Encodable this[int index]
        {
            get
            {
                Force();

                return base[index];
            }
        }

        public override IEnumerator<Asn1Encodable> GetEnumerator()
        {
            byte[] encoded = GetContents();
            if (null != encoded)
            {
                return new LazyDLEnumerator(encoded);
            }

            return base.GetEnumerator();
        }

        public override int Count
        {
            get
            {
                Force();

                return base.Count;
            }
        }

        public override Asn1Encodable[] ToArray()
        {
            Force();

            return base.ToArray();
        }

        public override string ToString()
        {
            Force();

            return base.ToString();
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer == encoding)
            {
                byte[] encoded = GetContents();
                if (encoded != null)
                    return new ConstructedLazyDLEncoding(Asn1Tags.Universal, Asn1Tags.Sequence, encoded);
            }
            else
            {
                Force();
            }

            return base.GetEncoding(encoding);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingBer == encoding)
            {
                byte[] encoded = GetContents();
                if (encoded != null)
                    return new ConstructedLazyDLEncoding(tagClass, tagNo, encoded);
            }
            else
            {
                Force();
            }

            return base.GetEncodingImplicit(encoding, tagClass, tagNo);
        }

        private void Force()
        {
            lock (this)
            {
                if (null != encoded)
                {
                    Asn1InputStream input = new LazyAsn1InputStream(encoded);
                    try
                    {
                        Asn1EncodableVector v = input.ReadVector();

                        this.elements = v.TakeElements();
                        this.encoded = null;
                    }
                    catch (IOException e)
                    {
                        throw new Asn1ParsingException("malformed ASN.1: " + e.Message, e);
                    }
                }
            }
        }

        private byte[] GetContents()
        {
            lock (this) return encoded;
        }
    }
}
