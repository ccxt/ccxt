using System;
using System.Linq;

namespace Nethereum.ABI.Decoders
{
    public class BytesElementaryTypeDecoder : TypeDecoder
    {
        private readonly int _size;

        public BytesElementaryTypeDecoder(int size)
        {
            _size = size;
        }

        public override object Decode(byte[] encoded, Type type)
        {
            if (!IsSupportedType(type)) throw new NotSupportedException(type + " is not supported");

            var returnArray = encoded.Take(_size).ToArray();

            if (_size == 1 && type == typeof(byte)) return returnArray[0];

            if (_size == 16 && type == typeof(Guid)) return new Guid(returnArray);

            return returnArray;
        }

        public override Type GetDefaultDecodingType()
        {
            return typeof(byte[]);
        }

        public override bool IsSupportedType(Type type)
        {
            if (_size == 1) return type == typeof(byte[]) || type == typeof(byte);
            if (_size == 16) return type == typeof(byte[]) || type == typeof(Guid);
            return type == typeof(byte[]);
        }
    }
}