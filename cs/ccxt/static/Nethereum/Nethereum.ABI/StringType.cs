using Nethereum.ABI.Decoders;
using Nethereum.ABI.Encoders;

namespace Nethereum.ABI
{
    public class StringType : ABIType
    {
        public StringType() : base("string")
        {
            Decoder = new StringTypeDecoder();
            Encoder = new StringTypeEncoder();
        }

        public override int FixedSize => -1;
    }
}