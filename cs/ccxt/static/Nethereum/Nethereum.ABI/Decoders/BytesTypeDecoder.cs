using System;
using System.Linq;

namespace Nethereum.ABI.Decoders
{
    public class BytesTypeDecoder : TypeDecoder
    {
        private readonly StringTypeDecoder _stringTypeDecoder;

        public BytesTypeDecoder()
        {
            _stringTypeDecoder = new StringTypeDecoder();
        }

        public override object Decode(byte[] encoded, Type type)
        {
            if (!IsSupportedType(type)) throw new NotSupportedException(type + " is not supported");
            if (type == typeof(string)) return _stringTypeDecoder.Decode(encoded, type);
            var returnArray = encoded.Skip(32).Take(EncoderDecoderHelpers.GetNumberOfBytes(encoded)).ToArray();
            if (type == typeof(byte)) return returnArray[0];
            return returnArray;
        }

        public override Type GetDefaultDecodingType()
        {
            return typeof(byte[]);
        }

        public override bool IsSupportedType(Type type)
        {
            return type == typeof(string) || type == typeof(byte[]) || type == typeof(object)
                   || type == typeof(byte);
        }
    }
}