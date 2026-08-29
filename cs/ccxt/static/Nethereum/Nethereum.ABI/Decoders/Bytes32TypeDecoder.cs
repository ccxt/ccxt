using System;
using System.Text;

namespace Nethereum.ABI.Decoders
{
    public class Bytes32TypeDecoder : TypeDecoder
    {
        private readonly BoolTypeDecoder _boolTypeDecoder;
        private readonly IntTypeDecoder _intTypeDecoder;

        public Bytes32TypeDecoder()
        {
            _intTypeDecoder = new IntTypeDecoder();
            _boolTypeDecoder = new BoolTypeDecoder();
        }

        public override object Decode(byte[] encoded, Type type)
        {
            if (!IsSupportedType(type)) throw new NotSupportedException(type + " is not supported");

            if (type == typeof(byte[]) || type == typeof(object))
                return encoded;

            if (type == typeof(string))
                return DecodeString(encoded);

            if (_intTypeDecoder.IsSupportedType(type))
                return _intTypeDecoder.Decode(encoded, type);

            if (_boolTypeDecoder.IsSupportedType(type))
                return _boolTypeDecoder.Decode(encoded, type);

            throw new NotSupportedException();
        }

        public override Type GetDefaultDecodingType()
        {
            return typeof(byte[]);
        }

        public override bool IsSupportedType(Type type)
        {
            return type == typeof(byte[]) || type == typeof(string) || _intTypeDecoder.IsSupportedType(type)
                   || type == typeof(bool) || type == typeof(object);
        }

        private string DecodeString(byte[] encoded)
        {
            return Encoding.UTF8.GetString(encoded, 0, encoded.Length).TrimEnd('\0');
        }
    }
}