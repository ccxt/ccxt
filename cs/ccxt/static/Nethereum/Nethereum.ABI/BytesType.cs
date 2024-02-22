using Nethereum.ABI.Decoders;
using Nethereum.ABI.Encoders;

namespace Nethereum.ABI
{
    public class BytesType : ABIType
    {
        public BytesType() : base("bytes")
        {
            Decoder = new BytesTypeDecoder();
            Encoder = new BytesTypeEncoder();
        }

        public override int FixedSize => -1;
    }
}