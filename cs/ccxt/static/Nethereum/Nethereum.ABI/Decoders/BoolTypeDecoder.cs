using System;

namespace Nethereum.ABI.Decoders
{
    public class BoolTypeDecoder : TypeDecoder
    {
        private readonly IntTypeDecoder _intTypeDecoder;

        public BoolTypeDecoder()
        {
            _intTypeDecoder = new IntTypeDecoder();
        }

        public bool Decode(byte[] encoded)
        {
            return Decode<bool>(encoded);
        }

        public override object Decode(byte[] encoded, Type type)
        {
            if (!IsSupportedType(type)) throw new NotSupportedException(type + " is not supported");
            var decoded = _intTypeDecoder.DecodeInt(encoded);
            return Convert.ToBoolean(decoded);
        }

        public override Type GetDefaultDecodingType()
        {
            return typeof(bool);
        }

        public override bool IsSupportedType(Type type)
        {
            return type == typeof(bool) || type == typeof(object);
        }
    }
}