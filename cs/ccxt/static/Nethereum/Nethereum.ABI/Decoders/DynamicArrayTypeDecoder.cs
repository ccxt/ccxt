using System;
using System.Linq;

namespace Nethereum.ABI.Decoders
{
    public class DynamicArrayTypeDecoder : ArrayTypeDecoder
    {
        public DynamicArrayTypeDecoder(ABIType elementType) : base(elementType, -1)
        {
        }

        public override object Decode(byte[] encoded, Type type)
        {
            var size = new IntTypeDecoder().DecodeInt(encoded.Take(32).ToArray());
            //Skip the length of the array, just pass the array values
            return Decode(encoded.Skip(32).ToArray(), type, size);
        }
    }
}