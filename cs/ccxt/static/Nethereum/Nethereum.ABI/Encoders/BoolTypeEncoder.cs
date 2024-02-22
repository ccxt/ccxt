using System;

namespace Nethereum.ABI.Encoders
{
    public class BoolTypeEncoder : ITypeEncoder
    {
        private readonly IntTypeEncoder _intTypeEncoder;

        public BoolTypeEncoder()
        {
            _intTypeEncoder = new IntTypeEncoder(false,8);
        }

        public byte[] Encode(object value)
        {
            if (!(value is bool))
                throw new Exception("Wrong value for bool type: " + value);
            return _intTypeEncoder.Encode((bool) value ? 1 : 0);
        }

        public byte[] EncodePacked(object value)
        {
            if (!(value is bool))
                throw new Exception("Wrong value for bool type: " + value);
            return _intTypeEncoder.EncodePacked((bool)value ? 1 : 0);
        }
    }
}