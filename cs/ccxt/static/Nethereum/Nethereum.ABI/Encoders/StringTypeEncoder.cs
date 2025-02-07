using System;
using System.Text;

namespace Nethereum.ABI.Encoders
{
    public class StringTypeEncoder : ITypeEncoder
    {
        private readonly BytesTypeEncoder byteTypeEncoder;

        public StringTypeEncoder()
        {
            byteTypeEncoder = new BytesTypeEncoder();
        }

        public byte[] Encode(object value)
        {
            if (!(value is string))
                throw new Exception("String value expected for type 'string'");

            var bytes = Encoding.UTF8.GetBytes((string) value);

            return byteTypeEncoder.Encode(bytes, false);
        }

        public byte[] EncodePacked(object value)
        {
            if (!(value is string))
                throw new Exception("String value expected for type 'string'");

            return Encoding.UTF8.GetBytes((string)value);
        }
    }
}