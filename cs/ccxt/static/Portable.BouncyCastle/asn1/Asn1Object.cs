using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    public abstract class Asn1Object
		: Asn1Encodable
    {
        public override void EncodeTo(Stream output)
        {
            Asn1OutputStream asn1Out = Asn1OutputStream.Create(output);
            GetEncoding(asn1Out.Encoding).Encode(asn1Out);
            asn1Out.FlushInternal();
        }

        public override void EncodeTo(Stream output, string encoding)
        {
            Asn1OutputStream asn1Out = Asn1OutputStream.Create(output, encoding);
            GetEncoding(asn1Out.Encoding).Encode(asn1Out);
            asn1Out.FlushInternal();
        }

        public bool Equals(Asn1Object other)
        {
            return this == other || Asn1Equals(other);
        }

        /// <summary>Create a base ASN.1 object from a byte array.</summary>
        /// <param name="data">The byte array to parse.</param>
        /// <returns>The base ASN.1 object represented by the byte array.</returns>
        /// <exception cref="IOException">
        /// If there is a problem parsing the data, or parsing an object did not exhaust the available data.
        /// </exception>
        public static Asn1Object FromByteArray(
			byte[] data)
		{
            try
			{
                MemoryStream input = new MemoryStream(data, false);
                Asn1InputStream asn1 = new Asn1InputStream(input, data.Length);
                Asn1Object result = asn1.ReadObject();
                if (input.Position != input.Length)
                    throw new IOException("extra data found after object");
                return result;
			}
			catch (InvalidCastException)
			{
				throw new IOException("cannot recognise object in byte array");
			}
		}

		/// <summary>Read a base ASN.1 object from a stream.</summary>
		/// <param name="inStr">The stream to parse.</param>
		/// <returns>The base ASN.1 object represented by the byte array.</returns>
		/// <exception cref="IOException">If there is a problem parsing the data.</exception>
		public static Asn1Object FromStream(
			Stream inStr)
		{
			try
			{
				return new Asn1InputStream(inStr).ReadObject();
			}
			catch (InvalidCastException)
			{
				throw new IOException("cannot recognise object in stream");
			}
		}

		public sealed override Asn1Object ToAsn1Object()
        {
            return this;
        }

        internal abstract IAsn1Encoding GetEncoding(int encoding);

        internal abstract IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo);

        protected abstract bool Asn1Equals(Asn1Object asn1Object);
		protected abstract int Asn1GetHashCode();

		internal bool CallAsn1Equals(Asn1Object obj)
		{
			return Asn1Equals(obj);
		}

		internal int CallAsn1GetHashCode()
		{
			return Asn1GetHashCode();
		}
	}
}
